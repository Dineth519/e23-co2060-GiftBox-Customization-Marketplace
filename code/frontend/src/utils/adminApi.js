const apiBase = () => `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api`;
const auth = () => ({ Authorization: `Bearer ${localStorage.getItem('accessToken')}` });

async function request(path, options, errorMessage) {
  const response = await fetch(`${apiBase()}${path}`, options);
  if (!response.ok) throw new Error(errorMessage);
  return response;
}

export const updateVendorApplicationStatus = (vendorId, status) => request(
  `/vendors/${vendorId}/status?status=${status}`,
  { method: 'PUT', headers: auth() },
  'Failed to update vendor status',
);

export const updateAssemblerStatus = (assemblerId, status) => request(
  `/assemblers/${assemblerId}/status?status=${status}`,
  { method: 'PUT', headers: auth() },
  'Failed to update assembler status',
);

export async function createAssembler(payload) {
  const response = await request('/assemblers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...auth() },
    body: JSON.stringify(payload),
  }, 'Failed to create assembler');
  return response.json();
}

export const createCategory = name => request('/categories', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...auth() },
  body: JSON.stringify({ name: name.trim() }),
}, 'Failed to create category');

export const deleteCategory = categoryId => request(
  `/categories/${categoryId}`,
  { method: 'DELETE', headers: auth() },
  'Failed to delete category',
);
