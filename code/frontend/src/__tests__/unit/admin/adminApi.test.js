import {
  createAssembler, createCategory, deleteCategory,
  updateAssemblerStatus, updateVendorApplicationStatus,
} from '../../../utils/adminApi';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('accessToken', 'admin-token');
  global.fetch = jest.fn();
});

test('approves a vendor using the authenticated admin request', async () => {
  fetch.mockResolvedValue({ ok: true });
  await updateVendorApplicationStatus(5, 'ACTIVE');
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/vendors/5/status?status=ACTIVE'), {
    method: 'PUT', headers: { Authorization: 'Bearer admin-token' },
  });
});

test('creates an active assembler and returns the server record', async () => {
  const created = { assemblerId: 8, status: 'ACTIVE' };
  fetch.mockResolvedValue({ ok: true, json: async () => created });
  const payload = { fullName: 'Nimal', email: 'nimal@example.com', status: 'ACTIVE' };
  await expect(createAssembler(payload)).resolves.toEqual(created);
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/assemblers'), expect.objectContaining({
    method: 'POST', body: JSON.stringify(payload),
    headers: expect.objectContaining({ Authorization: 'Bearer admin-token' }),
  }));
});

test('activates or deactivates an assembler', async () => {
  fetch.mockResolvedValue({ ok: true });
  await updateAssemblerStatus(8, 'INACTIVE');
  expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/assemblers/8/status?status=INACTIVE'), expect.any(Object));
});

test('creates and deletes product categories', async () => {
  fetch.mockResolvedValue({ ok: true });
  await createCategory(' Watches ');
  await deleteCategory(4);
  expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({ name: 'Watches' }));
  expect(fetch.mock.calls[1][0]).toContain('/api/categories/4');
  expect(fetch.mock.calls[1][1].method).toBe('DELETE');
});

test('rejects unsuccessful admin actions', async () => {
  fetch.mockResolvedValue({ ok: false });
  await expect(updateVendorApplicationStatus(5, 'ACTIVE')).rejects.toThrow('Failed to update vendor status');
});
