import { getOrderErrorMessage, placeCustomBoxOrder, placeStandardOrder } from '../../../utils/customerOrderApi';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('accessToken', 'customer-token');
  global.fetch = jest.fn();
});

test.each([
  ['standard', placeStandardOrder, '/api/orders/standard'],
  ['custom box', placeCustomBoxOrder, '/api/orders/custom-box'],
])('places a %s order with authentication and JSON data', async (_name, placeOrder, endpoint) => {
  const payload = { customerId: 42, items: [{ productId: 10, quantity: 1 }] };
  fetch.mockResolvedValue({ ok: true });

  await placeOrder(payload);

  expect(fetch).toHaveBeenCalledWith(`${process.env.REACT_APP_API_URL || ''}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer customer-token',
    },
    body: JSON.stringify(payload),
  });
});

test('reports the backend error when order placement fails', async () => {
  fetch.mockResolvedValue({ ok: false, text: async () => 'Product is out of stock' });
  await expect(placeStandardOrder({ items: [] })).rejects.toThrow('Product is out of stock');
});

test('uses a stable fallback when an error response has no readable body', async () => {
  await expect(getOrderErrorMessage({ text: async () => { throw new Error('unreadable'); } }, 'Failed to place order'))
    .resolves.toBe('Failed to place order');
});

test('extracts a readable message from a Spring JSON error response', async () => {
  const response = {
    text: async () => JSON.stringify({ status: 500, error: 'Internal Server Error', path: '/api/orders/standard' }),
  };
  await expect(getOrderErrorMessage(response, 'Failed to place order'))
    .resolves.toBe('Internal Server Error');
});
