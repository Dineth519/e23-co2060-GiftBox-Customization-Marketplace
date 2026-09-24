import { placeCustomBoxOrder, placeStandardOrder } from '../../../utils/customerOrderApi';

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
