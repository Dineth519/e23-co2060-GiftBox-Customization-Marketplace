import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createMemoryRouter, RouterProvider, Link } from 'react-router-dom';
import OrderWorkspace from '../../../pages/assembler/OrderWorkspace';
import { fetchAssemblyOrder, saveAssemblyOrder } from '../../../pages/assembler/assemblyApi';

jest.mock('../../../pages/assembler/assemblyApi', () => ({ fetchAssemblyOrder: jest.fn(), saveAssemblyOrder: jest.fn() }));
global.IS_REACT_ACT_ENVIRONMENT = true;

const order = () => ({
  id: '1', occasion: 'Birthday', box: 'Medium', due: 'Today', total: 2,
  recipient: 'Customer recipient', wrap: 'Gold', ribbon: 'Ivory', card: 'Script', sender: 'Sender', waxSeal: 'Yes', message: 'Hello',
  workspace: { revision: 0, status: 'assembling', receiptConfirmed: true, issue: '', notes: '', activity: [], checks: Array(6).fill(false), items: [{ id: 10, name: 'Real candle', vendor: 'Real vendor', expected: 2, received: 2, condition: 'good' }] },
});
let container, root, router;
const flush = async () => { await act(async () => { await Promise.resolve(); }); };
const button = text => [...container.querySelectorAll('button')].find(element => element.textContent === text);
async function click(element) { await act(async () => element.click()); }
async function render() {
  router = createMemoryRouter([
    { path: '/assembler/orders/:orderId', element: <><Link to="/assembler/issues">Sidebar issues</Link><OrderWorkspace /></> },
    { path: '/assembler/issues', element: <p>Issues destination</p> },
  ], { initialEntries: ['/assembler/orders/1'] });
  await act(async () => root.render(<RouterProvider router={router} />));
  await flush();
}
beforeEach(() => {
  jest.clearAllMocks();
  container = document.createElement('div'); document.body.appendChild(container); root = createRoot(container);
  fetchAssemblyOrder.mockResolvedValue(order());
  window.confirm = jest.fn().mockReturnValue(false);
});
afterEach(async () => { await act(async () => root.unmount()); router?.dispose(); container.remove(); });

test('loads a real order and submits completed QA through the backend', async () => {
  const initial = order(); initial.workspace.checks = [true, true, true, true, true, false];
  fetchAssemblyOrder.mockResolvedValue(initial);
  const updated = order(); updated.workspace.revision = 1; updated.workspace.status = 'completed'; updated.workspace.checks = Array(6).fill(true);
  updated.workspace.activity = [{ text: 'Assembly and quality checks completed; order is ready for delivery.', time: '2026-09-22T10:00:00Z' }];
  saveAssemblyOrder.mockResolvedValue(updated);
  await render();
  expect(container.textContent).toContain('Real candle');
  await click([...container.querySelectorAll('input[type="checkbox"]')].at(-1));
  await click(button('Mark as Delivered'));
  expect(saveAssemblyOrder).toHaveBeenCalledWith('1', 'submit', expect.objectContaining({ revision: 0, checks: Array(6).fill(true) }));
  expect(container.textContent).toContain('Assembly completed');
});

test('sidebar navigation warns and preserves edits when leaving is cancelled', async () => {
  await render(); await click(container.querySelector('input[type="checkbox"]'));
  await click(container.querySelector('a'));
  expect(window.confirm).toHaveBeenCalledWith('Leave without saving your changes?');
  expect(router.state.location.pathname).toBe('/assembler/orders/1');
  expect(container.querySelector('input[type="checkbox"]').checked).toBe(true);
  window.confirm.mockReturnValue(true);
  await click(container.querySelector('a'));
  expect(router.state.location.pathname).toBe('/assembler/issues');
});

test('failed save retains changes and shows the server error', async () => {
  const initial = order(); initial.workspace.checks = [true, true, true, true, true, false];
  fetchAssemblyOrder.mockResolvedValue(initial);
  saveAssemblyOrder.mockRejectedValue(new Error('This order changed in another session. Reload it before saving again.'));
  await render();
  await click([...container.querySelectorAll('input[type="checkbox"]')].at(-1));
  await click(button('Mark as Delivered'));
  expect(container.querySelector('[role="alert"]').textContent).toContain('changed in another session');
  expect([...container.querySelectorAll('input[type="checkbox"]')].at(-1).checked).toBe(true);
});

test('load failure offers retry instead of substituting sample orders', async () => {
  fetchAssemblyOrder.mockRejectedValueOnce(new Error('Order not found.'));
  await render();
  expect(container.textContent).toContain('Order not found.');
  expect(container.textContent).not.toContain('GF-1042');
  await click(button('Retry'));
  expect(container.textContent).toContain('Real candle');
});

test('submission is disabled until all checks are complete', async () => {
  await render();
  expect(button('Mark as Delivered').disabled).toBe(true);
  for (const checkbox of container.querySelectorAll('input[type="checkbox"]')) await click(checkbox);
  expect(button('Mark as Delivered').disabled).toBe(false);
});

test('displays the ordered product image and falls back if it cannot load', async () => {
  const actualOrder = order();
  actualOrder.workspace.receiptConfirmed = false;
  actualOrder.workspace.status = 'awaiting';
  actualOrder.workspace.items[0].imageUrl = 'https://example.com/candle.jpg';
  fetchAssemblyOrder.mockResolvedValue(actualOrder);
  await render();
  const image = container.querySelector('img.aw-product-image');
  expect(image.getAttribute('src')).toBe('https://example.com/candle.jpg');
  expect(image.alt).toBe('Real candle');
  await act(async () => image.dispatchEvent(new Event('error')));
  expect(container.querySelector('img.aw-product-image')).toBeNull();
  expect(container.querySelector('[aria-label="Product image unavailable"]')).not.toBeNull();
  expect(container.textContent).toContain('Real candle');
});
