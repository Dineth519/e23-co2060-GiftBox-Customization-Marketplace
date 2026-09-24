export function normalizeAssemblers(data) {
  if (Array.isArray(data)) return data;
  return data?.assemblers || data?.content || [];
}

export function assemblerStats(assemblers) {
  return {
    total: assemblers.length,
    active: assemblers.filter(assembler => assembler.status === 'ACTIVE').length,
    inactive: assemblers.filter(assembler => assembler.status === 'INACTIVE').length,
  };
}

export const nextAssemblerStatus = currentStatus =>
  currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

export function buildAssemblerPayload(form) {
  return {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    password: form.password,
    status: 'ACTIVE',
  };
}

export function validateAssembler(form) {
  if (!form.fullName?.trim() || !form.email?.trim() || !form.password) return 'Name, email and password are required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Enter a valid email address.';
  if (form.password.length < 8) return 'Password must contain at least 8 characters.';
  return null;
}
