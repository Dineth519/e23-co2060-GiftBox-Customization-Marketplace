import { getMonthlyOutput } from './monthlyOutput';

const now = new Date(2026, 1, 15);
test('groups real completions by submission month across the year boundary', () => {
  const { months, undated } = getMonthlyOutput([
    { status: 'completed', submittedAt: '2025-09-01T00:00:00' },
    { status: 'completed', submittedAt: '2026-01-31T23:59:59' },
    { status: 'completed', submittedAt: '2026-02-01T00:00:00' },
    { status: 'completed', submittedAt: '2026-02-14T10:00:00' },
    { status: 'assembling', submittedAt: '2026-02-10T10:00:00' },
    { status: 'completed', submittedAt: '2025-08-31T23:59:59' },
    { status: 'completed', submittedAt: '2026-03-01T00:00:00' },
  ], now);
  expect(months.map(month => month.key)).toEqual(['2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02']);
  expect(months.map(month => month.val)).toEqual([1, 0, 0, 0, 1, 2]);
  expect(undated).toBe(0);
});

test('does not invent dates for missing or invalid completion timestamps', () => {
  const result = getMonthlyOutput([
    { status: 'completed', submittedAt: null },
    { status: 'completed', submittedAt: 'invalid' },
    { status: 'awaiting', submittedAt: null },
  ], now);
  expect(result.undated).toBe(2);
  expect(result.months.every(month => month.val === 0)).toBe(true);
});

test('returns six zero months for an empty backend response', () => {
  const result = getMonthlyOutput([], now);
  expect(result.months).toHaveLength(6);
  expect(result.months.every(month => month.val === 0)).toBe(true);
  expect(result.undated).toBe(0);
});
