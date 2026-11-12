export function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value !== null && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(key => canonical(key) + ':' + canonical(value[key])).join(',') + '}';
  }
  return JSON.stringify(value).replace(/[\u007f-\uffff]/g, ch =>
    '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0'));
}

export async function digest(value) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical(value)));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

export function receiptState(tx) {
  const stage = tx.statusName ?? tx.status ?? 'PENDING';
  const leader = tx.consensus_data?.leader_receipt;
  const execution = tx.txExecutionResultName ?? (Array.isArray(leader) ? leader[0] : leader)?.execution_result;
  if (['CANCELED', 'UNDETERMINED', 'VALIDATORS_TIMEOUT', 'LEADER_TIMEOUT', 6, 8, 12, 13].includes(stage)) {
    return { kind: 'failed', text: `${stage}. Inspect the receipt for details.` };
  }
  if (stage === 'FINALIZED' || stage === 7) {
    if (['FINISHED_WITH_ERROR', 'ERROR'].includes(execution) || tx.txExecutionResult === 2 ||
        tx.resultName === 'FAILURE') return { kind: 'failed', text: 'Finalized with an execution error.' };
    if (['FINISHED_WITH_RETURN', 'SUCCESS'].includes(execution) || tx.txExecutionResult === 1) {
      return { kind: 'success', text: 'Finalized successfully.' };
    }
    return { kind: 'unknown', text: 'Finalized. The RPC did not confirm the execution result.' };
  }
  return { kind: 'pending', text: `${stage}. Waiting for finalization.` };
}
