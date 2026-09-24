import { apiCall } from '../../utils/api.js';
import { saveAssemblyOrder } from './assemblyApi.js';

jest.mock('../../utils/api.js', () => ({ apiCall: jest.fn() }));
const state = { revision: 0, items: [{ id: 10, received: 1, condition: 'damaged' }], checks: Array(6).fill(false), notes: '', issue: '' };

test('sends damaged item progress without requiring an issue report', async () => {
  apiCall.mockResolvedValue({ ok: true, json: async () => ({ id: '1', workspace: state }) });
  await saveAssemblyOrder('1', 'save', state);
  const payload = JSON.parse(apiCall.mock.calls.at(-1)[1].body);
  expect(payload.items[0].condition).toBe('damaged');
  expect(payload.action).toBe('save');
});

test('identifies denied access even when the server returns an empty error body', async () => {
  apiCall.mockResolvedValue({ ok: false, status: 403, json: async () => { throw new Error('Empty body'); } });
  await expect(saveAssemblyOrder('1', 'save', state)).rejects.toThrow('server denied access');
});

test('preserves server details and includes the HTTP error code', async () => {
  apiCall.mockResolvedValue({ ok: false, status: 409, json: async () => ({ message: 'This order changed in another session.' }) });
  await expect(saveAssemblyOrder('1', 'save', state)).rejects.toThrow('This order changed in another session. (HTTP 409)');
});
