import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';
import { canonical, digest, receiptState } from './core.js';
import { address, demos, exception, explorer, policy, rejectedPublication, transactions } from './config.js';
import './style.css';

const client = createClient({ chain: studionet });
const byId = id => document.getElementById(id);
const form = byId('review');
const result = byId('result');
const receipt = byId('receipt');
let lookup = 0;
let tracking = 0;
let timer;

function element(tag, text, className) {
  const node = document.createElement(tag);
  node.textContent = text;
  if (className) node.className = className;
  return node;
}

function link(text, path) {
  const node = element('a', text);
  node.href = explorer + path;
  node.target = '_blank';
  node.rel = 'noopener noreferrer';
  return node;
}

function request() {
  const value = Object.fromEntries(new FormData(form));
  const action = {
    actor: value.actor, resource: value.resource, purpose: value.purpose,
    operation: value.operation, timestamp: Date.parse(value.timestamp + 'Z') / 1000,
  };
  if (!Number.isSafeInteger(action.timestamp) || action.timestamp < 0 || action.timestamp > 253402300799 ||
      Object.values(action).some(v => typeof v === 'string' && (!v || v !== v.trim()))) {
    throw new Error('Use a valid UTC timestamp and enter action details without surrounding spaces.');
  }
  return { policy_id: value.policy, exception_id: value.exception, action };
}

async function read(functionName, key) {
  const value = await client.readContract({
    address, functionName, args: [key], transactionHashVariant: 'latest-final',
  });
  return value ? JSON.parse(value) : null;
}

function addClauses(title, ids, document) {
  if (!ids.length) return;
  result.append(element('h3', title));
  const list = element('ul', '');
  for (const id of ids) list.append(element('li', `${id} · ${document.clauses[id]}`));
  result.append(list);
}

async function findDecision() {
  const current = ++lookup;
  result.replaceChildren(element('p', 'Reading finalized Studionet state…', 'muted'));
  try {
    const input = request();
    const key = await digest(input);
    const [record, policyRecord, exceptionRecord] = await Promise.all([
      read('get_decision', key), read('get_policy', input.policy_id), read('get_exception', input.exception_id),
    ]);
    if (current !== lookup) return;
    if (!policyRecord || !exceptionRecord) throw new Error('The policy or exception ID was not found in finalized state.');
    if (!record) {
      result.replaceChildren(element('p', 'No finalized decision for this action. Prepare a Studio transaction or track a submission already in progress.', 'muted'));
      return;
    }
    const { decision_hash, ...decision } = record;
    const received = { policy_id: record.policy_id, exception_id: record.exception_id, action: record.action };
    if (await digest(decision) !== decision_hash || canonical(received) !== canonical(input) ||
        await digest(policyRecord) !== input.policy_id || await digest(exceptionRecord) !== input.exception_id) {
      throw new Error('The returned record does not match its content commitments.');
    }
    if (current !== lookup) return;
    result.replaceChildren(element('span', record.verdict, 'verdict-tag'));
    const names = { POLICY_VERSION: 'Policy version', ACTOR: 'Actor', RESOURCE: 'Resource', TIME_WINDOW: 'Time window' };
    if (record.failed_checks.length) {
      result.append(element('p', 'Failed scope checks · ' + record.failed_checks.map(item => names[item]).join(', ')));
    }
    if (record.verdict === 'INCONCLUSIVE') {
      result.append(element('p', 'The cited policy and exception did not resolve this action unambiguously.'));
    }
    addClauses('Policy clauses', record.policy_ids, policyRecord);
    addClauses('Exception clauses', record.exception_ids, exceptionRecord);
    const details = element('dl', '');
    for (const [label, value] of [['Policy version', policyRecord.version], ['Decision ID', key], ['Decision SHA-256', decision_hash]]) {
      details.append(element('dt', label), element('dd', value));
    }
    result.append(details);
  } catch (error) {
    if (current === lookup) result.replaceChildren(element('p', error.shortMessage ?? error.message, 'failed'));
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  void findDecision();
});
form.addEventListener('input', () => {
  lookup++;
  result.replaceChildren(element('p', 'Action edited. Find its finalized decision to refresh the result.', 'muted'));
  byId('args').textContent = 'Prepare this action to generate updated arguments.';
  byId('copy').disabled = true;
  byId('copy-state').textContent = '';
});
byId('prepare').addEventListener('click', () => {
  if (!form.reportValidity()) return;
  byId('studio-detail').open = true;
  byId('copy-state').textContent = '';
  try {
    const { policy_id, exception_id, action } = request();
    byId('args').textContent = JSON.stringify([policy_id, exception_id, action.actor, action.resource,
      action.purpose, action.operation, action.timestamp], null, 2);
    byId('copy').disabled = false;
  } catch (error) {
    byId('args').textContent = error.message;
    byId('copy').disabled = true;
  }
});
byId('copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(byId('args').textContent);
    byId('copy-state').textContent = 'Arguments copied.';
  } catch {
    byId('copy-state').textContent = 'Select and copy the arguments from the box.';
  }
});

function stopTracking() {
  tracking++;
  clearTimeout(timer);
  byId('stop').disabled = true;
}

function track(hash) {
  stopTracking();
  const current = tracking;
  const deadline = Date.now() + 300_000;
  const external = byId('transaction');
  external.href = explorer + '/tx/' + hash;
  external.hidden = false;
  byId('stop').disabled = false;
  receipt.className = 'pending status';
  receipt.textContent = 'Looking up transaction…';

  async function poll() {
    try {
      const tx = await client.getTransaction({ hash });
      if (tracking !== current) return;
      const destination = tx.to_address ?? tx.recipient;
      if (destination && destination.toLowerCase() !== address.toLowerCase()) {
        receipt.className = 'failed status';
        receipt.textContent = 'This transaction targets a different contract.';
        stopTracking();
        return;
      }
      const state = receiptState(tx);
      receipt.className = state.kind + ' status';
      receipt.textContent = state.text;
      if (state.kind !== 'pending') {
        stopTracking();
        if (state.kind === 'success' && form.checkValidity()) void findDecision();
        return;
      }
    } catch (error) {
      if (tracking !== current) return;
      receipt.textContent = 'Receipt unavailable. Retrying… ' + (error.shortMessage ?? error.message);
    }
    if (Date.now() >= deadline) {
      receipt.textContent = 'Tracking paused after five minutes. Track this same hash again to resume.';
      stopTracking();
      return;
    }
    timer = setTimeout(poll, 5000);
  }
  void poll();
}

byId('track').addEventListener('submit', event => {
  event.preventDefault();
  track(new FormData(event.currentTarget).get('hash'));
});
byId('failure-example').addEventListener('click', () => {
  byId('track').elements.namedItem('hash').value = rejectedPublication;
  track(rejectedPublication);
});
byId('stop').addEventListener('click', () => {
  stopTracking();
  receipt.textContent = 'Tracking paused. Track this hash again to resume.';
});

byId('deployment').replaceChildren('Contract ', link(address, '/address/' + address),
  ' · ', link('Deployment receipt', '/tx/' + transactions.deploy));
for (const demo of demos) {
  const button = element('button', demo.label);
  button.type = 'button';
  button.addEventListener('click', () => {
    const values = { policy, exception, ...demo.action,
      timestamp: new Date(demo.action.timestamp * 1000).toISOString().slice(0, 19) };
    for (const [field, value] of Object.entries(values)) form.elements.namedItem(field).value = value;
    form.dispatchEvent(new Event('input'));
    if (demo.hash) {
      byId('track').elements.namedItem('hash').value = demo.hash;
      track(demo.hash);
    }
    void findDecision();
  });
  byId('examples').append(button);
}
