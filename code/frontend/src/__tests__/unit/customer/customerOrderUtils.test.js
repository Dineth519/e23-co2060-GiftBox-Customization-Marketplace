import {
  addSelectedItem,
  buildCustomOrderPayload,
  buildStandardOrderPayload,
  calculateBoxTotal,
  calculateItemsSubtotal,
  countSelectedItems,
  filterProducts,
  getProductId,
  removeSelectedItem,
  trimSelectionToLimit,
  validateCustomOrder,
} from '../../../utils/customerOrderUtils';

const products = [
  { productId: 10, name: 'Dark Chocolate', category: 'Gourmet', price: 950 },
  { id: 20, name: 'Soy Candle', category: 'Wellness', price: 2400 },
  { _id: 30, name: 'Ceramic Mug', category: 'Lifestyle', price: 1600 },
];

describe('customer product selection', () => {
  test('supports each product identifier returned by the backend', () => {
    expect(products.map(getProductId)).toEqual([10, 20, 30]);
  });

  test('filters products by category and case-insensitive search text', () => {
    expect(filterProducts(products, 'Wellness', 'CANDLE')).toEqual([products[1]]);
    expect(filterProducts(products, 'All', 'c')).toEqual(products);
  });

  test('adds products until the selected box reaches its capacity', () => {
    const first = addSelectedItem({}, products[0], 2);
    const second = addSelectedItem(first, products[0], 2);
    const blocked = addSelectedItem(second, products[1], 2);
    expect(second).toEqual({ 10: 2 });
    expect(blocked).toBe(second);
    expect(countSelectedItems(blocked)).toBe(2);
  });

  test('removes one unit and removes the key when the last unit is removed', () => {
    expect(removeSelectedItem({ 10: 2 }, 10)).toEqual({ 10: 1 });
    expect(removeSelectedItem({ 10: 1 }, 10)).toEqual({});
  });

  test('trims the latest selections when a smaller box is chosen', () => {
    expect(trimSelectionToLimit({ 10: 2, 20: 2, 30: 1 }, 3)).toEqual({ 10: 2, 20: 1 });
  });
});

describe('gift box totals and validation', () => {
  test('calculates product subtotal, box fee, and optional wax-seal fee', () => {
    expect(calculateItemsSubtotal({ 10: 2, 20: 1 }, products)).toBe(4300);
    expect(calculateBoxTotal({ 10: 2, 20: 1 }, products, 1200, true)).toBe(5750);
    expect(calculateBoxTotal({ 10: 2 }, products, 800, false)).toBe(2700);
  });

  test.each([
    [{ selectedItems: {}, recipientName: 'Nimal', deliveryAddress: 'Kandy' }, 'Your gift box is empty! Add items in Step 3.'],
    [{ selectedItems: { 10: 1 }, recipientName: ' ', deliveryAddress: 'Kandy' }, 'Please specify a recipient name.'],
    [{ selectedItems: { 10: 1 }, recipientName: 'Nimal', deliveryAddress: ' ' }, 'Please provide a complete delivery address.'],
  ])('rejects an incomplete custom-box order', (input, message) => {
    expect(validateCustomOrder(input)).toBe(message);
  });

  test('accepts a complete custom-box order', () => {
    expect(validateCustomOrder({
      selectedItems: { 10: 1 }, recipientName: ' Nimal ', deliveryAddress: ' Kandy ',
    })).toBeNull();
  });
});

describe('order payload creation', () => {
  test('creates a standard order using only server-required item fields', () => {
    expect(buildStandardOrderPayload('42', ' 12 Temple Road ', [
      { productId: 10, name: 'Chocolate', price: 950, quantity: 2 },
    ])).toEqual({
      customerId: 42,
      deliveryAddress: '12 Temple Road',
      items: [{ productId: 10, quantity: 2 }],
    });
  });

  test('creates a custom-box order with numeric product identifiers', () => {
    const payload = buildCustomOrderPayload({
      customerId: '42', occasion: 'Birthday', boxSize: { id: 'MEDIUM' },
      wrappingStyle: { id: 'Classic Gold' }, ribbonColor: 'White', hasWaxSeal: true,
      recipientName: ' Nimal ', senderName: 'Kamal', giftMessage: 'Happy birthday',
      cardTemplate: { id: 'cursive' }, deliveryAddress: ' Kandy ', deliveryDate: '2026-09-30',
      totalPrice: 5750, selectedItems: { 10: 2, 20: 1 },
    });
    expect(payload).toEqual(expect.objectContaining({
      customerId: 42,
      boxSize: 'MEDIUM',
      wrappingStyle: 'Classic Gold',
      recipientName: 'Nimal',
      deliveryAddress: 'Kandy',
      items: [{ productId: 10, quantity: 2 }, { productId: 20, quantity: 1 }],
    }));
  });
});
