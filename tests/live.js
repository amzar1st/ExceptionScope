import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { address, authority, demos, exception, policy, rejectedPublication, transactions } from '../web/config.js';
import { digest, receiptState } from '../web/core.js';

const client = createClient({ chain: studionet });
const get = (functionName, args = []) => client.readContract({
  address, functionName, args, transactionHashVariant: 'latest-final',
});
const source = await readFile(new URL('../contracts/exception_scope.py', import.meta.url));

await Promise.all([
  (async () => assert.equal((await get('get_authority')).toLowerCase(), authority.toLowerCase()))(),
  (async () => assert.equal(await digest(JSON.parse(await get('get_policy', [policy]))), policy))(),
  (async () => assert.equal(await digest(JSON.parse(await get('get_exception', [exception]))), exception))(),
  ...Object.entries(transactions).map(async ([name, hash]) => {
    const receipt = await client.getTransaction({ hash });
    assert.equal(receipt.to_address?.toLowerCase(), address.toLowerCase());
    assert.equal(receipt.from_address?.toLowerCase(), authority.toLowerCase());
    assert.equal(receiptState(receipt).kind, 'success', name);
    if (name === 'deploy') assert.deepEqual(Buffer.from(receipt.data.contract_code, 'base64'), source);
    console.log(name, 'finalized successfully');
  }),
  (async () => {
    const receipt = await client.getTransaction({ hash: rejectedPublication });
    assert.equal(receipt.statusName, 'FINALIZED');
    assert.equal(receiptState(receipt).kind, 'failed');
    assert.notEqual(receipt.from_address.toLowerCase(), authority.toLowerCase());
    assert.equal(receipt.consensus_data.leader_receipt[0].result.payload, 'Authority only');
    const denied = await digest({ version: 'unauthorized-demo', clauses: { 'U-1': 'This publication must be rejected.' } });
    assert.equal(await get('get_policy', [denied]), '');
    console.log('Unauthorized policy publication reverted without a record');
  })(),
  ...demos.map(async ({ action, hash, label, verdict }) => {
    const key = await digest({ policy_id: policy, exception_id: exception, action });
    const [value, receipt] = await Promise.all([get('get_decision', [key]), client.getTransaction({ hash })]);
    const { decision_hash, ...record } = JSON.parse(value);
    assert.equal(receiptState(receipt).kind, 'success', label);
    assert.equal(receipt.to_address?.toLowerCase(), address.toLowerCase());
    assert.equal(record.verdict, verdict);
    assert.deepEqual(record.action, action);
    if (label === 'At expiry') assert.deepEqual(record.failed_checks, ['TIME_WINDOW']);
    assert.equal(await digest(record), decision_hash);
    console.log(label, verdict, key, decision_hash);
  }),
]);
