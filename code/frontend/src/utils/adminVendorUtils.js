export function pendingVendorApplications(vendors) {
  return vendors
    .filter(vendor => vendor.status === 'PENDING')
    .map(vendor => ({
      id: vendor.vendorId,
      shop: vendor.shopName,
      name: vendor.fullName,
      address: vendor.shopAddress,
      phone: vendor.phoneNumber,
      br_no: vendor.brNo,
      email: vendor.email || 'No Email',
      categories: vendor.categories || 'premium-gifts',
    }));
}

export const isVendorDecision = status => ['ACTIVE', 'REJECTED'].includes(status);

export const removeProcessedVendor = (vendors, vendorId) =>
  vendors.filter(vendor => vendor.id !== vendorId);
