// The existing assembler API supplies status and submittedAt from the database.
export function getMonthlyOutput(orders, now = new Date()) {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      month: date.toLocaleDateString('en', { month: 'short' }),
      label: date.toLocaleDateString('en', { month: 'long', year: 'numeric' }),
      val: 0,
    };
  });
  let undated = 0;
  for (const order of orders) {
    if (order.status !== 'completed') continue;
    if (!order.submittedAt || !Number.isFinite(Date.parse(order.submittedAt))) {
      undated++;
      continue;
    }
    // Use the backend's calendar month, without shifting its local timestamp.
    const month = months.find(entry => entry.key === order.submittedAt.slice(0, 7));
    if (month) month.val++;
  }
  return { months, undated };
}
