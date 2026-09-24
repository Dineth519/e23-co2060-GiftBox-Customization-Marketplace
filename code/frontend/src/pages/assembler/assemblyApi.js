import { useCallback, useEffect, useRef, useState } from 'react';
import { apiCall } from '../../utils/api.js';

export function normalizeOrder(order) {
  const custom = order.customization || {};
  const dueDate = order.dueDate || custom.deliveryDate || '';
  const date = dueDate ? new Date(dueDate) : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = date && Number.isFinite(date.getTime())
    ? Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()) - today) / 86400000) : null;
  const due = days === null ? 'Not scheduled' : days < 0 ? 'Overdue' : days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : days === 2 ? 'In 2 days' : date.toLocaleDateString();
  return {
    ...order, dueDate, due, dueRank: days ?? Number.MAX_SAFE_INTEGER,
    box: order.box ? order.box[0].toUpperCase() + order.box.slice(1).toLowerCase() : 'Not specified',
    ribbon: custom.ribbonColor || 'Not recorded', card: custom.cardTemplate || 'Not recorded',
    sender: custom.senderName || 'Not recorded',
    waxSeal: typeof custom.hasWaxSeal === 'boolean' ? (custom.hasWaxSeal ? 'Yes' : 'No') : 'Not recorded',
  };
}
async function request(path = '', options) {
  const response = await apiCall('/api/assembler/orders' + path, options);
  if (!response.ok) {
    const explanations = {
      401: 'Your login has expired. Sign in again before saving.',
      403: 'The server denied access to this order. Check that you are signed in as its assembler.',
      409: 'This order has changed or is no longer available for editing. Reload it before saving again.',
    };
    let message = explanations[response.status] || (response.status >= 500
      ? 'The backend could not save or load the order. Check the backend error log.'
      : 'The server rejected this request. Please check the order details.');
    try { const body = await response.json(); message = body.message || body.detail || message; }
    catch { /* Keep a readable message for non-JSON responses. */ }
    throw new Error(message + ` (HTTP ${response.status})`);
  }
  return response.json();
}
export const fetchAssemblyOrder = async id => normalizeOrder(await request('/' + encodeURIComponent(id)));
export const saveAssemblyOrder = async (id, action, state) => normalizeOrder(await request('/' + encodeURIComponent(id), {
  method: 'PUT',
  body: JSON.stringify({ revision: state.revision, action, items: state.items.map(({ id, received, condition }) => ({ id, received, condition })), checks: state.checks, notes: state.notes, issue: state.issue }),
}));
export function useAssemblyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const requestId = useRef(0);
  const reload = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const result = await request();
      if (id === requestId.current) { setOrders(result.map(normalizeOrder)); setError(''); }
    } catch (failure) { if (id === requestId.current) setError(failure.message); }
    finally { if (id === requestId.current) setLoading(false); }
  }, []);
  useEffect(() => {
    reload();
    window.addEventListener('focus', reload);
    const timer = window.setInterval(reload, 60000);
    return () => { requestId.current++; window.removeEventListener('focus', reload); window.clearInterval(timer); };
  }, [reload]);
  return { orders, loading, error, reload };
}
export function AssemblyLoadState({ loading, error, reload }) {
  return <>{loading && <p role="status">Loading assembly orders…</p>}{error && <p role="alert">{error} <button type="button" onClick={reload}>Retry</button></p>}</>;
}
