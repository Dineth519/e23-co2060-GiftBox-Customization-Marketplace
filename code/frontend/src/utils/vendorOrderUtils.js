export function filterVendorOrders(orders, status = 'All', search = '') {
  const query = search.trim().toLowerCase();
  return orders.filter(order => {
    const matchesStatus = status === 'All' || order.status === status;
    const matchesSearch = !query
      || String(order.order_id).includes(query)
      || (order.delivery_address || '').toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });
}

export function vendorOrderStats(orders) {
  return {
    total: orders.length,
    pending: orders.filter(order => order.status === 'PENDING').length,
    delivered: orders.filter(order => order.status === 'DELIVERED').length,
    revenue: orders
      .filter(order => order.status !== 'CANCELLED')
      .reduce((total, order) => total + Number(order.total_amount || 0), 0),
  };
}

export const canVendorSetOrderStatus = (currentStatus, newStatus) =>
  currentStatus === 'PENDING' && ['CONFIRMED', 'CANCELLED'].includes(newStatus);
