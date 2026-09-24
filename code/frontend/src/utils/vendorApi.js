const baseUrl = () => `${process.env.REACT_APP_API_URL || ''}/api`;

async function checkedFetch(url, options, message) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(message);
  return response;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken')}` });

export const updateVendorOrderStatus = (orderId, status) => checkedFetch(
  `${baseUrl()}/orders/${orderId}/status`,
  { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify({ status }) },
  'Update failed',
);

export const updateVendorProduct = (productId, payload) => checkedFetch(
  `${baseUrl()}/products/${productId}`,
  { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) },
  'Update failed',
);
