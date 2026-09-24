import { CHECKS, canSubmit, receiptsReady } from '../../../pages/assembler/workspaceState';

const readyItem = { id: 1, expected: 2, received: 2, condition: 'good' };

const readyState = (overrides = {}) => ({
  items: [readyItem],
  receiptConfirmed: true,
  issue: '',
  status: 'assembling',
  checks: Array(CHECKS.length).fill(true),
  ...overrides,
});

describe('receiptsReady', () => {
  test('accepts a complete receipt containing only good items', () => {
    expect(receiptsReady(readyState())).toBe(true);
  });

  test.each([
    ['no items', []],
    ['a missing item', [{ ...readyItem, received: 1 }]],
    ['a damaged item', [{ ...readyItem, condition: 'damaged' }]],
    ['a non-integer quantity', [{ ...readyItem, received: 1.5 }]],
  ])('rejects %s', (_description, items) => {
    expect(receiptsReady(readyState({ items }))).toBe(false);
  });
});

describe('canSubmit', () => {
  test('allows submission only after receipt, assembly, and all checks are complete', () => {
    expect(canSubmit(readyState())).toBe(true);
  });

  test.each([
    ['receipt is not confirmed', { receiptConfirmed: false }],
    ['an issue is open', { issue: 'Broken item' }],
    ['order is not assembling', { status: 'ready' }],
    ['a quality check is incomplete', { checks: [true, true, true, true, true, false] }],
    ['the number of checks is incorrect', { checks: [true] }],
  ])('blocks submission when %s', (_description, overrides) => {
    expect(canSubmit(readyState(overrides))).toBe(false);
  });
});
