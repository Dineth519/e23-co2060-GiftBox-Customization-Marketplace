const apiBaseUrl = () => process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function fetchJson(path) {
  try {
    const response = await fetch(`${apiBaseUrl()}${path}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    return response.ok ? response.json() : null;
  } catch {
    return null;
  }
}

const storedValues = object => Object.fromEntries(
  Object.entries(object || {}).filter(([, value]) => value !== null && value !== undefined && value !== ''),
);

export async function loadCheckoutProfile(userId, username) {
  const currentCustomer = await fetchJson('/api/users/me/checkout-details');
  if (currentCustomer) return currentCustomer;
  if (!userId) return {};

  const [profile, addressResponse] = await Promise.all([
    fetchJson(`/api/users/${userId}`),
    username ? fetchJson(`/api/users/${encodeURIComponent(username)}/address`) : Promise.resolve(null),
  ]);

  return {
    ...storedValues(profile),
    ...storedValues(addressResponse?.address),
  };
}

export function checkoutFieldsFromProfile(profile = {}) {
  return {
    name: profile.name || profile.fullName || '',
    deliveryAddress: [profile.addressLine1 || profile.address, profile.addressLine2]
      .filter(value => value?.trim())
      .join(', '),
    city: profile.city || '',
    zipCode: profile.postalCode || profile.zipCode || '',
    mobileNumber: profile.phoneNumber || profile.phone || '',
  };
}
