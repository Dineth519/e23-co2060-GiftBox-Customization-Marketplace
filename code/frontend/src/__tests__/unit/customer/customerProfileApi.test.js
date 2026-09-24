import { checkoutFieldsFromProfile, loadCheckoutProfile } from '../../../utils/customerProfileApi';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('accessToken', 'customer-token');
  global.fetch = jest.fn();
});

test('maps stored customer data to checkout fields', () => {
  expect(checkoutFieldsFromProfile({
    name: 'Nimal Silva',
    addressLine1: '12 Temple Road',
    addressLine2: 'Peradeniya',
    city: 'Kandy',
    postalCode: '20000',
    phoneNumber: '0771234567',
  })).toEqual({
    name: 'Nimal Silva',
    deliveryAddress: '12 Temple Road, Peradeniya',
    city: 'Kandy',
    zipCode: '20000',
    mobileNumber: '0771234567',
  });
});

test('supports the legacy single customer address field', () => {
  expect(checkoutFieldsFromProfile({ name: 'Nimal', address: '12 Temple Road, Kandy' }))
    .toEqual(expect.objectContaining({ deliveryAddress: '12 Temple Road, Kandy' }));
});

test('loads checkout details for the customer identified by the access token', async () => {
  fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ name: 'Nimal Silva', addressLine1: '12 Temple Road', city: 'Kandy' }),
  });

  await expect(loadCheckoutProfile('42', 'nimal')).resolves.toEqual({
    name: 'Nimal Silva', addressLine1: '12 Temple Road', city: 'Kandy',
  });
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/users/me/checkout-details'), {
    headers: { Authorization: 'Bearer customer-token' },
  });
});

test('merges the saved address record into the customer profile', async () => {
  fetch
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Nimal Silva', email: 'nimal@example.com' }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        address: { addressLine1: '12 Temple Road', city: 'Kandy', postalCode: '20000', phoneNumber: '0771234567' },
      }),
    });

  await expect(loadCheckoutProfile('42', 'nimal')).resolves.toEqual(expect.objectContaining({
    name: 'Nimal Silva',
    addressLine1: '12 Temple Road',
    city: 'Kandy',
    postalCode: '20000',
    phoneNumber: '0771234567',
  }));
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch).toHaveBeenNthCalledWith(3, expect.stringContaining('/api/users/nimal/address'), {
    headers: { Authorization: 'Bearer customer-token' },
  });
});

test('keeps profile address values when the separate address request fails', async () => {
  fetch
    .mockResolvedValueOnce({ ok: false })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Nimal', addressLine1: 'Main Street', city: 'Colombo' }),
    })
    .mockResolvedValueOnce({ ok: false });

  await expect(loadCheckoutProfile('42', 'nimal')).resolves.toEqual({
    name: 'Nimal',
    addressLine1: 'Main Street',
    city: 'Colombo',
  });
});
