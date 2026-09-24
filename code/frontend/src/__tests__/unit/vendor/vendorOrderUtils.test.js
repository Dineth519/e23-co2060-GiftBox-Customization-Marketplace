import { canVendorSetOrderStatus, filterVendorOrders, vendorOrderStats } from '../../../utils/vendorOrderUtils';

const orders = [
  { order_id: 101, status: 'PENDING', delivery_address: 'Kandy', total_amount: 1000 },
  { order_id: 102, status: 'DELIVERED', delivery_address: 'Colombo', total_amount: 2500 },
  { order_id: 103, status: 'CANCELLED', delivery_address: 'Galle', total_amount: 5000 },
];

test('filters vendor orders by status, identifier, and address', () => {
  expect(filterVendorOrders(orders, 'PENDING', '')).toEqual([orders[0]]);
  expect(filterVendorOrders(orders, 'All', '102')).toEqual([orders[1]]);
  expect(filterVendorOrders(orders, 'All', 'GALLE')).toEqual([orders[2]]);
});

test('calculates order counts and excludes cancelled revenue', () => {
  expect(vendorOrderStats(orders)).toEqual({ total: 3, pending: 1, delivered: 1, revenue: 3500 });
});

test.each([
  ['PENDING', 'CONFIRMED', true], ['PENDING', 'CANCELLED', true],
  ['CONFIRMED', 'CANCELLED', false], ['PENDING', 'DELIVERED', false],
])('validates vendor order status transitions', (current, next, expected) => {
  expect(canVendorSetOrderStatus(current, next)).toBe(expected);
});
