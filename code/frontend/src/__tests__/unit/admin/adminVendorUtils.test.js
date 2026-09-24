import { isVendorDecision, pendingVendorApplications, removeProcessedVendor } from '../../../utils/adminVendorUtils';

test('keeps and maps only pending vendor applications', () => {
  const result = pendingVendorApplications([
    { vendorId: 1, status: 'ACTIVE', shopName: 'Old Shop' },
    { vendorId: 2, status: 'PENDING', shopName: 'Gift Shop', fullName: 'Nimal', email: '', categories: null },
  ]);
  expect(result).toEqual([expect.objectContaining({
    id: 2, shop: 'Gift Shop', name: 'Nimal', email: 'No Email', categories: 'premium-gifts',
  })]);
});

test.each([['ACTIVE', true], ['REJECTED', true], ['PENDING', false], ['DELETED', false]])(
  'recognizes valid admin vendor decisions', (status, expected) => {
    expect(isVendorDecision(status)).toBe(expected);
  });

test('removes the processed application from the pending list', () => {
  expect(removeProcessedVendor([{ id: 1 }, { id: 2 }], 1)).toEqual([{ id: 2 }]);
});
