export const CHECKS = ['Products and quantities match', 'Items inspected for damage', 'Protective filling added', 'Wrapping and ribbon verified', 'Greeting card and message verified', 'Final presentation checked'];
export function receiptsReady(state) {
  return state.items.length > 0 && state.items.every(item => Number.isInteger(item.received) && item.received === item.expected && item.condition === 'good');
}
export function canSubmit(state) {
  return state.receiptConfirmed && receiptsReady(state) && !state.issue && state.status === 'assembling' && state.checks.length === CHECKS.length && state.checks.every(Boolean);
}
