export function validateVendorProduct(form, hasImage) {
  if (!form.name?.trim() || !form.category || !form.description?.trim()
      || !form.subCategory?.trim() || !hasImage) {
    return 'Add a name, description, category, product type, and product photo.';
  }
  if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) <= 0
      || form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) {
    return 'Enter a positive price and a whole-number stock quantity of zero or more.';
  }
  if (form.discountPrice !== '' && (!Number.isFinite(Number(form.discountPrice))
      || Number(form.discountPrice) <= 0 || Number(form.discountPrice) >= Number(form.price))) {
    return 'Discount price must be positive and lower than the regular price.';
  }
  return null;
}

export function buildVendorProductPayload(form, imageUrl) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    price: Number(form.price),
    discountPrice: form.discountPrice === '' ? null : Number(form.discountPrice),
    stockQuantity: Number(form.stock),
    sku: form.sku?.trim() || null,
    isActive: form.is_active ? 1 : 0,
    imageUrl: imageUrl || 'https://via.placeholder.com/220x150?text=No+Image',
    categoryId: Number(form.category),
    subCategory: form.subCategory.trim(),
  };
}

export function inventoryStatus(stock, active = true) {
  if (!active || Number(stock) <= 0) return 'Out of Stock';
  if (Number(stock) <= 10) return 'Low Stock';
  return 'Active';
}

export function buildProductEdit(editForm) {
  const stock = Number.parseInt(editForm.stock, 10);
  const active = editForm.status === 'Active';
  return {
    stock,
    status: inventoryStatus(stock, active),
    payload: {
      name: editForm.name.trim(),
      description: editForm.description?.trim() || '',
      subCategory: editForm.subCategory?.trim() || '',
      price: Number(editForm.price),
      stockQuantity: stock,
      isActive: active ? 1 : 0,
    },
  };
}

export function filterVendorProducts(products, { search = '', category = 'All', status = 'All' } = {}) {
  const query = search.toLowerCase();
  return products.filter(product =>
    (category === 'All' || product.category === category)
    && (status === 'All' || product.status === status)
    && (product.name || '').toLowerCase().includes(query));
}

export function vendorProductStats(products) {
  return {
    total: products.length,
    active: products.filter(product => product.status === 'Active').length,
    lowStock: products.filter(product => product.status === 'Low Stock').length,
    outOfStock: products.filter(product => product.status === 'Out of Stock').length,
  };
}
