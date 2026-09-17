// Frontend preview fixtures. Replace with authenticated order data when the API is ready.
export const STATUS = {
  awaiting: { label: 'Awaiting items', tone: 'amber' },
  ready: { label: 'Ready to assemble', tone: 'teal' },
  assembling: { label: 'In assembly', tone: 'blue' },
  review: { label: 'Ready for review', tone: 'teal' },
  hold: { label: 'On hold', tone: 'red' },
};
export const SAMPLE_ORDERS = [
  { id: 'GF-1042', occasion: 'Birthday', received: 4, total: 4, due: 'Today', status: 'assembling', box: 'Medium', recipient: 'Amaya', wrap: 'Classic Gold', ribbon: 'Navy', message: 'Happy birthday! With love.' },
  { id: 'GF-1043', occasion: 'Anniversary', received: 2, total: 4, due: 'Today', status: 'awaiting', box: 'Large', recipient: 'Kavindi', wrap: 'Pearl Ivory', ribbon: 'Gold', message: 'Here is to another wonderful year together.' },
  { id: 'GF-1044', occasion: 'Thank you', received: 3, total: 3, due: 'Tomorrow', status: 'ready', box: 'Small', recipient: 'Nimal', wrap: 'Emerald Luxe', ribbon: 'Ivory', message: 'Thank you for everything.' },
  { id: 'GF-1045', occasion: 'Birthday', received: 2, total: 3, due: 'Tomorrow', status: 'hold', box: 'Medium', recipient: 'Tharushi', wrap: 'Rose Blush', ribbon: 'Ivory', message: 'Wishing you a beautiful birthday.', issue: 'Ceramic mug arrived cracked. A replacement is needed before assembly can continue.' },
  { id: 'GF-1046', occasion: 'Graduation', received: 4, total: 4, due: 'Tomorrow', status: 'review', box: 'Medium', recipient: 'Dilan', wrap: 'Midnight Navy', ribbon: 'Gold', message: 'Congratulations on your graduation!' },
  { id: 'GF-1047', occasion: 'Anniversary', received: 1, total: 5, due: 'In 2 days', status: 'awaiting', box: 'Large', recipient: 'Isuri', wrap: 'Champagne Silk', ribbon: 'Burgundy', message: 'With all my love.' },
];
export function filterOrders(orders, status, query) {
  const search = query.trim().toLowerCase().replace(/^#/, '');
  return orders.filter(order => (status === 'all' || order.status === status) && order.id.toLowerCase().includes(search));
}

export function selectQueueOrders(orders, { status = 'all', query = '', box = 'all', due = 'all', sort = 'due' } = {}) {
  const dueRank = { Today: 0, Tomorrow: 1, 'In 2 days': 2 };
  return filterOrders(orders, status, query)
    .filter(order => (box === 'all' || order.box === box) && (due === 'all' || order.due === due))
    .sort((a, b) => sort === 'id'
      ? a.id.localeCompare(b.id)
      : (dueRank[a.due] ?? 99) - (dueRank[b.due] ?? 99) || a.id.localeCompare(b.id));
}
