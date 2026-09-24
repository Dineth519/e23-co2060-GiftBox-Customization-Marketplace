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
    pending: orders.filter(order => order.status === 'PENDING_VENDOR_ACCEPTANCE').length,
    delivered: orders.filter(order => order.status === 'SENT_TO_ASSEMBLY').length,
    revenue: orders
      .filter(order => order.status !== 'REJECTED')
      .reduce((total, order) => total + Number(order.total_amount || 0), 0),
  };
}

export const canVendorSetOrderStatus = (currentStatus, newStatus) =>
  currentStatus === 'PENDING_VENDOR_ACCEPTANCE' && ['ACCEPTED_BY_VENDOR', 'REJECTED'].includes(newStatus)
  || currentStatus === 'ACCEPTED_BY_VENDOR' && newStatus === 'SENT_TO_ASSEMBLY';
