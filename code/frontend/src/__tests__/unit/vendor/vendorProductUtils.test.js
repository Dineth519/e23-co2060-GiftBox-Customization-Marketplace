import {
  buildProductEdit, buildVendorProductPayload, filterVendorProducts,
  inventoryStatus, validateVendorProduct, vendorProductStats,
} from '../../../utils/vendorProductUtils';

const validForm = {
  name: ' Chocolate ', description: ' Dark chocolate ', category: '2', subCategory: 'Sweets',
  price: '1000', discountPrice: '900', stock: '12', sku: ' CH-1 ', is_active: true,
};

test('validates all required vendor product information', () => {
  expect(validateVendorProduct(validForm, true)).toBeNull();
  expect(validateVendorProduct({ ...validForm, name: '' }, true)).toMatch(/name/);
  expect(validateVendorProduct({ ...validForm, price: '0' }, true)).toMatch(/positive price/);
  expect(validateVendorProduct({ ...validForm, stock: '1.5' }, true)).toMatch(/whole-number/);
  expect(validateVendorProduct({ ...validForm, discountPrice: '1000' }, true)).toMatch(/lower/);
  expect(validateVendorProduct(validForm, false)).toMatch(/photo/);
});

test('creates a normalized product payload', () => {
  expect(buildVendorProductPayload(validForm, 'https://image.test/item.jpg')).toEqual({
    name: 'Chocolate', description: 'Dark chocolate', price: 1000, discountPrice: 900,
    stockQuantity: 12, sku: 'CH-1', isActive: 1, imageUrl: 'https://image.test/item.jpg',
    categoryId: 2, subCategory: 'Sweets',
  });
});

test.each([[0, true, 'Out of Stock'], [4, true, 'Low Stock'], [11, true, 'Active'], [20, false, 'Out of Stock']])(
  'derives inventory status from stock and visibility', (stock, active, expected) => {
    expect(inventoryStatus(stock, active)).toBe(expected);
  });

test('creates an edit payload and calculated status', () => {
  expect(buildProductEdit({ name: ' Mug ', description: ' Ceramic ', subCategory: 'Home', price: '1500', stock: '5', status: 'Active' }))
    .toEqual({ stock: 5, status: 'Low Stock', payload: {
      name: 'Mug', description: 'Ceramic', subCategory: 'Home', price: 1500, stockQuantity: 5, isActive: 1,
    } });
});

test('filters products and calculates inventory statistics', () => {
  const products = [
    { name: 'Chocolate', category: 'Food', status: 'Active' },
    { name: 'Candle', category: 'Home', status: 'Low Stock' },
    { name: 'Mug', category: 'Home', status: 'Out of Stock' },
  ];
  expect(filterVendorProducts(products, { search: 'can', category: 'Home', status: 'Low Stock' })).toEqual([products[1]]);
  expect(vendorProductStats(products)).toEqual({ total: 3, active: 1, lowStock: 1, outOfStock: 1 });
});
