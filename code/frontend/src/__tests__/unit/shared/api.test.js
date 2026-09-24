import { apiCall, getCurrentUser, isAuthenticated } from '../../../utils/api';

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('adds the access token and preserves caller headers', async () => {
  localStorage.setItem('accessToken', 'access-123');
  fetch.mockResolvedValue({ status: 200 });

  await apiCall('/api/orders', {
    method: 'POST',
    headers: { 'X-Request-ID': 'request-1' },
    body: '{}',
  });

  expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/orders', {
    method: 'POST',
    body: '{}',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-ID': 'request-1',
      Authorization: 'Bearer access-123',
    },
  });
});

test('refreshes an expired access token and retries the original request', async () => {
  localStorage.setItem('accessToken', 'expired-token');
  localStorage.setItem('refreshToken', 'refresh-123');
  fetch
    .mockResolvedValueOnce({ status: 401 })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ accessToken: 'new-token' }) })
    .mockResolvedValueOnce({ status: 200 });

  const response = await apiCall('/api/orders');

  expect(response.status).toBe(200);
  expect(localStorage.getItem('accessToken')).toBe('new-token');
  expect(fetch).toHaveBeenNthCalledWith(2, 'http://localhost:8080/api/auth/refresh-token', {
    method: 'POST',
    headers: { Authorization: 'Bearer refresh-123' },
  });
  expect(fetch.mock.calls[2][1].headers.Authorization).toBe('Bearer new-token');
});

test('reports the current authentication state and stored identity', () => {
  expect(isAuthenticated()).toBe(false);
  localStorage.setItem('accessToken', 'token');
  localStorage.setItem('userId', '42');
  localStorage.setItem('role', 'ASSEMBLER');

  expect(getCurrentUser()).toEqual({
    userId: '42',
    role: 'ASSEMBLER',
    isAuthenticated: true,
  });
});
