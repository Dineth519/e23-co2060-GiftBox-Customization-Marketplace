// This Context is wrapped in App.jsx
// Any component can access cart via useCart hook

import React, { createContext, useContext, useState, useCallback } from 'react';

// Create React Context for cart state management
const CartContext = createContext(null);

// ── Provider ─────────────────────────────────────────────────
export const CartProvider = ({ children }) => {

  const [cartItems,  setCartItems]  = useState([]);   // list of items in cart
  const [itemCount,  setItemCount]  = useState(0);    // total item quantity (for badge)
  const [cartTotal,  setCartTotal]  = useState(0);    // total price in LKR
  const [isOpen,     setIsOpen]     = useState(false); // cart drawer visibility
  const [addedId,    setAddedId]    = useState(null);  // product ID for add button feedback

  // ── Helpers ─────────────────────────────────────────────────

  // Recalculate total price and item count from cart items
  const recalculate = (items) => {
    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    setCartTotal(Math.round(total * 100) / 100);
    setItemCount(count); // #44 — update navbar badge count
  };

  // ── Add to Cart (#43) ────────────────────────────────────────
  const addToCart = useCallback(async (product) => {
    try {
      const res = await fetch('http://localhost:8080/api/cart/add', {
        method:      'POST',
        credentials: 'include',           // session cookie
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          name:      product.name,
          price:     product.price,
          imageUrl:  product.imageUrl,
        }),
      });

      const data = await res.json();
      setCartItems(data.items);
      recalculate(data.items);

      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 1500);

    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  }, []);

  // ── Remove item ──────────────────────────────────────────────
  const removeItem = useCallback(async (productId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/cart/remove/${productId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      const data = await res.json();
      setCartItems(data.items);
      recalculate(data.items);
    } catch (err) {
      console.error('Remove failed:', err);
    }
  }, []);

  // ── Update quantity ──────────────────────────────────────────
  const updateQty = useCallback(async (productId, quantity) => {
    try {
      const res = await fetch('http://localhost:8080/api/cart/update', {
        method:      'PUT',
        credentials: 'include',
        headers:     { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json();
      setCartItems(data.items);
      recalculate(data.items);
    } catch (err) {
      console.error('Update qty failed:', err);
    }
  }, []);

  // ── Clear cart ───────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    try {
      await fetch('http://localhost:8080/api/cart/clear',
        { method: 'DELETE', credentials: 'include' }
      );
      setCartItems([]);
      setItemCount(0);
      setCartTotal(0);
    } catch (err) {
      console.error('Clear cart failed:', err);
    }
  }, []);

  // ── Load cart on mount ───────────────────────────────────────
  const loadCart = useCallback(async () => {
    try {
      const res  = await fetch('http://localhost:8080/api/cart',
        { credentials: 'include' }
      );
      const data = await res.json();
      setCartItems(data.items  || []);
      recalculate(data.items   || []);
    } catch (err) {
      console.error('Load cart failed:', err);
    }
  }, []);

  return (
    <CartContext.Provider value={{
      cartItems,
      itemCount,  
      cartTotal,  
      isOpen,
      addedId,    
      setIsOpen,
      addToCart,
      removeItem,
      updateQty,
      clearCart,
      loadCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart context in any component
export const useCart = () => useContext(CartContext);