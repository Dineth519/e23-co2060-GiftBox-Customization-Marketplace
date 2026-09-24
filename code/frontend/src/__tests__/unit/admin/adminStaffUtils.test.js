import {
  assemblerStats, buildAssemblerPayload, nextAssemblerStatus,
  normalizeAssemblers, validateAssembler,
} from '../../../utils/adminStaffUtils';

test('normalizes supported assembler API response formats', () => {
  const list = [{ assemblerId: 1 }];
  expect(normalizeAssemblers(list)).toBe(list);
  expect(normalizeAssemblers({ assemblers: list })).toBe(list);
  expect(normalizeAssemblers({ content: list })).toBe(list);
  expect(normalizeAssemblers({})).toEqual([]);
});

test('calculates assembler account statistics', () => {
  expect(assemblerStats([{ status: 'ACTIVE' }, { status: 'ACTIVE' }, { status: 'INACTIVE' }]))
    .toEqual({ total: 3, active: 2, inactive: 1 });
});

test('toggles assembler status in both directions', () => {
  expect(nextAssemblerStatus('ACTIVE')).toBe('INACTIVE');
  expect(nextAssemblerStatus('INACTIVE')).toBe('ACTIVE');
});

test('validates and normalizes a new assembler account', () => {
  const form = { fullName: ' Nimal Silva ', email: ' ADMIN@EXAMPLE.COM ', phone: ' 0771234567 ', password: 'password1' };
  expect(validateAssembler(form)).toBeNull();
  expect(buildAssemblerPayload(form)).toEqual({
    fullName: 'Nimal Silva', email: 'admin@example.com', phone: '0771234567', password: 'password1', status: 'ACTIVE',
  });
  expect(validateAssembler({ ...form, email: 'invalid' })).toMatch(/valid email/);
  expect(validateAssembler({ ...form, password: 'short' })).toMatch(/8 characters/);
});
