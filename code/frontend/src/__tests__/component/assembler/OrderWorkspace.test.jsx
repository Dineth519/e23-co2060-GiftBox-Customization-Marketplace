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

test('loads real order and saves QA progress through the backend', async () => {
  const updated = order(); updated.workspace.revision = 1; updated.workspace.checks[0] = true;
  updated.workspace.activity = [{ text: 'Progress saved.', time: '2026-09-22T10:00:00Z' }];
  saveAssemblyOrder.mockResolvedValue(updated);
  await render();
  expect(container.textContent).toContain('Real candle');
  await click(button('Packing & QA'));
  await click(container.querySelector('input[type="checkbox"]'));
  expect(container.textContent).toContain('Unsaved changes');
  await click(button('Save progress'));
  expect(saveAssemblyOrder).toHaveBeenCalledWith('1', 'save', expect.objectContaining({ revision: 0, checks: [true, false, false, false, false, false] }));
  expect(container.textContent).toContain('All changes saved');
});

test('sidebar navigation warns and preserves edits when leaving is cancelled', async () => {
  await render(); await click(button('Packing & QA')); await click(container.querySelector('input[type="checkbox"]'));
  await click(container.querySelector('a'));
  expect(window.confirm).toHaveBeenCalledWith('Leave without saving your changes?');
  expect(router.state.location.pathname).toBe('/assembler/orders/1');
  expect(container.querySelector('input[type="checkbox"]').checked).toBe(true);
  window.confirm.mockReturnValue(true);
  await click(container.querySelector('a'));
  expect(router.state.location.pathname).toBe('/assembler/issues');
});

test('failed save retains changes and shows the server error', async () => {
  saveAssemblyOrder.mockRejectedValue(new Error('This order changed in another session. Reload it before saving again.'));
  await render(); await click(button('Packing & QA')); await click(container.querySelector('input[type="checkbox"]')); await click(button('Save progress'));
  expect(container.querySelector('[role="alert"]').textContent).toContain('changed in another session');
  expect(container.querySelector('input[type="checkbox"]').checked).toBe(true);
  expect(container.textContent).toContain('Unsaved changes');
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
  expect(button('Submit for approval').disabled).toBe(true);
  await click(button('Packing & QA'));
  for (const checkbox of container.querySelectorAll('input[type="checkbox"]')) await click(checkbox);
  expect(button('Submit for approval').disabled).toBe(false);
});

test('displays the ordered product image and falls back if it cannot load', async () => {
  const actualOrder = order();
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
