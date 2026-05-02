// context/CartContext.jsx
// Universal cart context — synced to actual backend CartController endpoints:
//
//  GET    /api/cart                          → load cart
//  POST   /api/cart/add                      → add product OR gift box
//  DELETE /api/cart/remove/{productId}       → remove product
//  DELETE /api/cart/remove/giftbox/{id}      → remove gift box
//  PUT    /api/cart/update                   → update quantity  body: { productId, quantity }
//  DELETE /api/cart/clear                    → clear all
//
// Backend runs on :8080 — baseURL set here so Axios always hits Spring Boot

import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

// ── Point Axios at Spring Boot (React is on :3000, backend on :8080) ──────
axios.defaults.baseURL         = 'http://localhost:8080';
axios.defaults.withCredentials = true; // session cookie must travel with every request

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isGiftBox = (item) => item.giftBoxId != null;

  // Backend CartResponse shape:
  //   { items: CartItem[], total, itemCount, message }
  // CartItem shape (from CartItem model):
  //   { productId?, giftBoxId?, name, price, imageUrl, quantity }

  const normalise = (raw) => ({
    productId : raw.productId  ?? null,
    giftBoxId : raw.giftBoxId  ?? null,
    name      : raw.name       ?? (raw.giftBoxId ? 'Custom Gift Box' : 'Product'),
    imageUrl  : raw.imageUrl   ?? '/placeholder.png',
    unitPrice : raw.price      ?? raw.unitPrice ?? 0,  // backend field is "price"
    quantity  : raw.quantity,
  });

  // Computed totals (derived — no extra API call)
  const itemCount = cartItems.reduce((s, i) => s + i.quantity,               0);
  const cartTotal = cartItems.reduce((s, i) => s + i.unitPrice * i.quantity,  0);

  // ── Load Cart ─────────────────────────────────────────────────────────────
  // GET /api/cart  →  CartResponse { items, total, itemCount, message }
  const loadCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get('/api/cart');
      setCartItems((data.items ?? []).map(normalise));
    } catch (err) {
      setError('Failed to load cart. Please try again.');
      console.error('[CartContext] loadCart:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Add Product ───────────────────────────────────────────────────────────
  // POST /api/cart/add   body: { productId, quantity }
  const addProduct = useCallback(async (productId, quantity = 1) => {
    setError(null);
    try {
      const { data } = await axios.post('/api/cart/add', { productId, quantity });
      setCartItems((data.items ?? []).map(normalise));
      return data;
    } catch (err) {
      setError('Could not add product to cart.');
      console.error('[CartContext] addProduct:', err);
      throw err;
    }
  }, []);

  // ── Add Gift Box ──────────────────────────────────────────────────────────
  // POST /api/cart/add   body: { giftBoxId, quantity }
  const addGiftBox = useCallback(async (giftBoxId, quantity = 1) => {
    setError(null);
    try {
      const { data } = await axios.post('/api/cart/add', { giftBoxId, quantity });
      setCartItems((data.items ?? []).map(normalise));
      return data;
    } catch (err) {
      setError('Could not add gift box to cart.');
      console.error('[CartContext] addGiftBox:', err);
      throw err;
    }
  }, []);

  // ── Remove Item ───────────────────────────────────────────────────────────
  // Product  → DELETE /api/cart/remove/{productId}
  // Gift Box → DELETE /api/cart/remove/giftbox/{giftBoxId}
  const removeItem = useCallback(async (item) => {
    setError(null);
    // Optimistic remove
    setCartItems((prev) => prev.filter((i) =>
      isGiftBox(item)
        ? i.giftBoxId !== item.giftBoxId
        : i.productId !== item.productId
    ));
    try {
      if (isGiftBox(item)) {
        await axios.delete(`/api/cart/remove/giftbox/${item.giftBoxId}`);
      } else {
        await axios.delete(`/api/cart/remove/${item.productId}`);
      }
    } catch (err) {
      setError('Could not remove item.');
      console.error('[CartContext] removeItem:', err);
      await loadCart(); // rollback
    }
  }, [loadCart]);

  // ── Update Quantity ───────────────────────────────────────────────────────
  // PUT /api/cart/update   body: { productId, quantity }  (or giftBoxId)
  const updateQty = useCallback(async (item, newQty) => {
    if (newQty < 1) return removeItem(item);
    setError(null);
    setCartItems((prev) =>
      prev.map((i) => {
        const match = isGiftBox(item)
          ? i.giftBoxId === item.giftBoxId
          : i.productId === item.productId;
        return match ? { ...i, quantity: newQty } : i;
      })
    );
    try {
      const idField = isGiftBox(item)
        ? { giftBoxId: item.giftBoxId }
        : { productId: item.productId };
      const { data } = await axios.put('/api/cart/update', { ...idField, quantity: newQty });
      setCartItems((data.items ?? []).map(normalise));
    } catch (err) {
      setError('Could not update quantity.');
      console.error('[CartContext] updateQty:', err);
      await loadCart();
    }
  }, [removeItem, loadCart]);

  // ── Clear Cart ────────────────────────────────────────────────────────────
  // DELETE /api/cart/clear
  const clearCart = useCallback(async () => {
    setError(null);
    setCartItems([]);
    try {
      await axios.delete('/api/cart/clear');
    } catch (err) {
      setError('Could not clear cart.');
      console.error('[CartContext] clearCart:', err);
      await loadCart();
    }
  }, [loadCart]);

  // ── Context Value ─────────────────────────────────────────────────────────
  const value = {
    cartItems,
    itemCount,
    cartTotal,
    loading,
    error,
    isGiftBox,
    loadCart,
    addProduct,
    addGiftBox,
    removeItem,  // takes full item object { productId?, giftBoxId?, ... }
    updateQty,   // takes full item object + newQty
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ── Hook ──────────────────────────────────────────────────────────────────
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};

export default CartContext;