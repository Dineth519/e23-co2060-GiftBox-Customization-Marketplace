import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useAssemblyOrders } from './assemblyApi';

jest.mock('./assemblyApi', () => ({ useAssemblyOrders: jest.fn(), AssemblyLoadState: () => null }));
test('issues card counts each affected backend order once and links to Issues', () => {
  useAssemblyOrders.mockReturnValue({ orders: [
    { id: '1', status: 'hold', issue: 'Missing', workspace: { items: [{ condition: 'damaged' }] } },
    { id: '2', status: 'awaiting', workspace: { items: [{ condition: 'incorrect' }] } },
    { id: '3', status: 'assembling', issue: 'Broken ribbon' },
    { id: '4', status: 'ready', issue: '  ', workspace: { items: [{ condition: 'good' }] } },
  ], loading: false, error: '', reload: jest.fn() });
  const host = document.createElement('div');
  host.innerHTML = renderToStaticMarkup(<MemoryRouter><Dashboard /></MemoryRouter>);
  const card = host.querySelector('.ao-metric[href="/assembler/issues"]');
  expect(card.querySelector('strong').textContent).toBe('03');
  expect(card.textContent).toContain('Issues');
  expect(host.querySelector('.ao-metric[href*="status=ready"]')).toBeNull();
});
