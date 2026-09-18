import { SAMPLE_ORDERS } from './overviewData.js';

export const CHECKS = ['Products and quantities match', 'Items inspected for damage', 'Protective filling added', 'Wrapping and ribbon verified', 'Greeting card and message verified', 'Final presentation checked'];

export function createWorkspace(order) {
  const quantities = order.total === 3 ? [1, 1, 1] : order.total === 5 ? [1, 2, 2] : [1, 2, 1];
  let remaining = order.received;
  const items = [
    { id: 'candle', name: 'Soy candle', vendor: 'Lumiere', symbol: 'C' },
    { id: 'chocolate', name: 'Dark chocolate', vendor: 'Cocoa House', symbol: 'CH' },
    { id: 'mug', name: 'Ceramic mug', vendor: 'Clay Studio', symbol: 'M' },
  ].map((item, index) => {
    const received = Math.min(remaining, quantities[index]);
    remaining -= received;
    return { ...item, expected: quantities[index], received, condition: order.issue && index === 2 ? 'damaged' : received ? 'good' : 'unchecked' };
  });
  return {
    version: 1, items, checks: CHECKS.map(() => order.status === 'review'),
    status: order.status, receiptConfirmed: ['ready', 'assembling', 'review'].includes(order.status),
    notes: '', issue: order.issue || '', activity: [{ text: 'Sample order added to assembly workspace.', time: null }],
  };
}
export function receiptsReady(state) {
  return state.items.every(item => Number.isInteger(item.received) && item.received === item.expected && item.condition === 'good');
}
export function canSubmit(state) {
  return state.receiptConfirmed && receiptsReady(state) && !state.issue && state.status === 'assembling' && state.checks.every(Boolean);
}
function key(id) {
  return 'giftora:assembly-demo:v1:' + (localStorage.getItem('userId') || 'preview') + ':' + id;
}
export function loadWorkspace(order) {
  try {
    const saved = JSON.parse(localStorage.getItem(key(order.id)));
    const base = createWorkspace(order);
    if (saved?.version === 1 && saved.items?.length === base.items.length && saved.checks?.length === CHECKS.length &&
      saved.items.every((item, i) => item.id === base.items[i].id && item.expected === base.items[i].expected && Number.isInteger(item.received) && item.received >= 0 && item.received <= item.expected && ['good', 'unchecked', 'damaged', 'incorrect'].includes(item.condition)) &&
      saved.checks.every(value => typeof value === 'boolean') && Array.isArray(saved.activity) &&
      saved.activity.every(event => typeof event.text === 'string' && (event.time === null || typeof event.time === 'string')) &&
      ['awaiting', 'ready', 'assembling', 'review', 'hold'].includes(saved.status) &&
      typeof saved.issue === 'string' && typeof saved.notes === 'string' && typeof saved.receiptConfirmed === 'boolean') return saved;
  } catch { /* Unavailable or invalid storage falls back to clearly labelled sample data. */ }
  return createWorkspace(order);
}
export function saveWorkspace(id, state) {
  localStorage.setItem(key(id), JSON.stringify(state));
}
export function getDemoOrders() {
  return SAMPLE_ORDERS.map(order => {
    const state = loadWorkspace(order);
    return { ...order, status: state.status, received: state.items.reduce((sum, item) => sum + item.received, 0), issue: state.issue };
  });
}
