import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AssemblerSidebar from '../../components/assembler/AssemblerSidebar';
import Profile from './Profile';
import { apiCall } from '../../utils/api';

jest.mock('../../utils/api', () => ({ apiCall: jest.fn() }));
global.IS_REACT_ACT_ENVIRONMENT = true;
let container, root;
beforeEach(() => {
  jest.clearAllMocks();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});
const success = { ok: true, json: async () => ({ name: 'Assembly User', username: 'assembler', email: 'assembler@example.com', verified: true }) };

test('sidebar account link opens the profile and loads the authenticated account', async () => {
  apiCall.mockResolvedValue(success);
  await act(async () => root.render(<MemoryRouter initialEntries={['/assembler']}>
    <AssemblerSidebar /><Routes><Route path="/assembler" element={<p>Overview</p>} /><Route path="/assembler/profile" element={<Profile />} /></Routes>
  </MemoryRouter>));
  await act(async () => container.querySelector('[aria-label="View my profile"]').click());
  expect(apiCall).toHaveBeenCalledWith('/api/auth/me');
  expect(document.querySelector('dialog h1').textContent).toBe('My profile');
  expect(document.querySelector('dialog').textContent).toContain('assembler@example.com');
  expect(container.textContent).toContain('Overview');
  await act(async () => document.querySelector('[aria-label="Close profile"]').click());
  expect(document.querySelector('dialog')).toBeNull();
});

test('failed profile load can be retried', async () => {
  apiCall.mockResolvedValueOnce({ ok: false }).mockResolvedValueOnce(success);
  await act(async () => root.render(<MemoryRouter><Profile isOpen onClose={() => {}} /></MemoryRouter>));
  expect(document.querySelector('[role="alert"]').textContent).toContain('Unable to load');
  await act(async () => document.querySelector('.asm-account-retry').click());
  expect(document.querySelector('dialog').textContent).toContain('Assembly User');
  expect(document.querySelector('[role="alert"]')).toBeNull();
});
