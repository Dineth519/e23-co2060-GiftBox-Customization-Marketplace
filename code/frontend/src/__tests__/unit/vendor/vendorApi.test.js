import { updateVendorOrderStatus, updateVendorProduct } from '../../../utils/vendorApi';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('accessToken', 'vendor-token');
  global.fetch = jest.fn();
});

test('sends an authenticated order-status update', async () => {
  fetch.mockResolvedValue({ ok: true });
  await updateVendorOrderStatus(101, 'CONFIRMED');
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/orders/101/status'), expect.objectContaining({
    method: 'PUT', body: JSON.stringify({ status: 'CONFIRMED' }),
    headers: expect.objectContaining({ Authorization: 'Bearer vendor-token' }),
  }));
});

test('sends an authenticated product update', async () => {
  fetch.mockResolvedValue({ ok: true });
  await updateVendorProduct(10, { price: 1500 });
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/products/10'), expect.objectContaining({
    method: 'PUT', body: JSON.stringify({ price: 1500 }),
  }));
});

test('rejects a failed vendor update', async () => {
  fetch.mockResolvedValue({ ok: false });
  await expect(updateVendorOrderStatus(101, 'CONFIRMED')).rejects.toThrow('Update failed');
});
