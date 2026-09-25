// Shared assembly status labels and queue filters.
export const STATUS = {
  awaiting: { label: 'Awaiting items', tone: 'amber' },
  ready: { label: 'Ready to assemble', tone: 'teal' },
  assembling: { label: 'In assembly', tone: 'blue' },
  completed: { label: 'Completed', tone: 'teal' },
  hold: { label: 'On hold', tone: 'red' },
};
export function hasAssemblyIssue(order) {
  return Boolean(order.status === 'hold' || order.issue?.trim() ||
    order.workspace?.items?.some(item => ['damaged', 'incorrect'].includes(item.condition)));
}
export function filterOrders(orders, status, query) {
  const search = query.trim().toLowerCase().replace(/^#/, '');
  return orders.filter(order => (status === 'all' || order.status === status) && order.id.toLowerCase().includes(search));
}

export function selectQueueOrders(orders, { status = 'all', query = '', box = 'all', due = 'all', sort = 'due' } = {}) {
  const dueRank = { Overdue: -1, Today: 0, Tomorrow: 1, 'In 2 days': 2 };
  return filterOrders(orders, status, query)
    .filter(order => (box === 'all' || order.box === box) && (due === 'all' || order.due === due))
    .sort((a, b) => {
      if (sort === 'newest') {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return timeB - timeA || Number(b.id) - Number(a.id);
      }
      if (sort === 'id') return Number(a.id) - Number(b.id);
      return (a.dueRank ?? dueRank[a.due] ?? 99) - (b.dueRank ?? dueRank[b.due] ?? 99) || Number(b.id) - Number(a.id);
    });
}
