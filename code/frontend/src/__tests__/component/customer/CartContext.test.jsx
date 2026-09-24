import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { CartProvider, cartStorageKey, useCart } from '../../../context/CartContext';

global.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
let cart;

function CartProbe() {
  cart = useCart();
  return (
    <div>
      <span data-testid="count">{cart.itemCount}</span>
      <span data-testid="total">{cart.cartTotal}</span>
    </div>
  );
}

async function renderCart() {
  await act(async () => {
    root.render(<CartProvider><CartProbe /></CartProvider>);
  });
}

async function update(action) {
  await act(async () => {
    await action();
  });
}

beforeEach(() => {
  jest.useFakeTimers();
  localStorage.clear();
  localStorage.setItem('userId', '42');
  cart = null;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  await act(async () => root.unmount());
  jest.clearAllTimers();
  jest.useRealTimers();
  container.remove();
});

test('adds a selected product and calculates quantity and total', async () => {
  await renderCart();
  const product = { id: 10, name: 'Chocolate', price: 950, stockQuantity: 3, isActive: 1 };

  await update(() => cart.addToCart(product));
  await update(() => cart.addToCart(product));

  expect(cart.cartItems).toEqual([expect.objectContaining({ productId: 10, quantity: 2 })]);
  expect(cart.itemCount).toBe(2);
  expect(cart.cartTotal).toBe(1900);
  expect(JSON.parse(localStorage.getItem(cartStorageKey('42')))[0].quantity).toBe(2);
});

test.each([
  ['out-of-stock', { id: 10, price: 950, stockQuantity: 0, isActive: 1 }],
  ['inactive', { id: 20, price: 500, stockQuantity: 2, isActive: 0 }],
])('does not add an %s product', async (_description, product) => {
  await renderCart();
  await update(() => cart.addToCart(product));
  expect(cart.cartItems).toEqual([]);
  expect(cart.itemCount).toBe(0);
});

test('caps quantity at stock and removes an item when quantity reaches zero', async () => {
  await renderCart();
  await update(() => cart.addToCart({
    id: 10, name: 'Chocolate', price: 950, stockQuantity: 2, isActive: 1,
  }));

  await update(() => cart.updateQty(10, 10));
  expect(cart.cartItems[0].quantity).toBe(2);
  expect(cart.cartTotal).toBe(1900);

  await update(() => cart.updateQty(10, 0));
  expect(cart.cartItems).toEqual([]);
  expect(cart.itemCount).toBe(0);
  expect(cart.cartTotal).toBe(0);
});

test('restores saved cart items and clears the complete cart', async () => {
  localStorage.setItem(cartStorageKey('42'), JSON.stringify([
    { productId: 30, name: 'Mug', price: 1600, quantity: 2 },
  ]));
  await renderCart();

  expect(cart.itemCount).toBe(2);
  expect(cart.cartTotal).toBe(3200);

  await update(() => cart.clearCart());
  expect(cart.cartItems).toEqual([]);
  expect(JSON.parse(localStorage.getItem(cartStorageKey('42')))).toEqual([]);
});

test('keeps each customer cart in separate persistent storage', async () => {
  localStorage.setItem(cartStorageKey('42'), JSON.stringify([
    { productId: 10, name: 'Chocolate', price: 950, quantity: 1 },
  ]));
  localStorage.setItem(cartStorageKey('77'), JSON.stringify([
    { productId: 30, name: 'Mug', price: 1600, quantity: 2 },
  ]));
  await renderCart();
  expect(cart.cartItems[0].productId).toBe(10);

  localStorage.setItem('userId', '77');
  await update(() => cart.loadCart());
  expect(cart.cartItems).toEqual([
    expect.objectContaining({ productId: 30, quantity: 2 }),
  ]);
  expect(cart.itemCount).toBe(2);
  expect(cart.cartTotal).toBe(3200);
  expect(JSON.parse(localStorage.getItem(cartStorageKey('42')))[0].productId).toBe(10);
});
