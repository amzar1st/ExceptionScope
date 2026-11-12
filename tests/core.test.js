import test from 'node:test';
import assert from 'node:assert/strict';
import { canonical, digest, receiptState } from '../web/core.js';
import { demos, policy, exception } from '../web/config.js';

test('canonical JSON matches Python ensure_ascii', () => {
  assert.equal(canonical({ z: '😀', a: ['é', 7] }), '{"a":["\\u00e9",7],"z":"\\ud83d\\ude00"}');
});
test('action commitment matches the independent Python fixture', async () => {
  assert.equal(await digest({ policy_id: policy, exception_id: exception, action: demos[0].action }),
    '2fc5b9e383640d2ec46f565695fb12ed9b101343559c36ccf7f922eba8c8474e');
});
test('accepted stays pending and finalization alone is insufficient', () => {
  assert.equal(receiptState({ statusName: 'ACCEPTED' }).kind, 'pending');
  assert.equal(receiptState({ statusName: 'FINALIZED' }).kind, 'unknown');
});
test('execution and consensus failures are distinguishable from success', () => {
  assert.equal(receiptState({ status: 7, txExecutionResult: 1 }).kind, 'success');
  assert.equal(receiptState({ status: 7, txExecutionResult: 2 }).kind, 'failed');
  assert.equal(receiptState({ statusName: 'UNDETERMINED' }).kind, 'failed');
});
