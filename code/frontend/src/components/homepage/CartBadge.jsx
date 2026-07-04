// ═══════════════════════════════════════════════════════════════
// CartBadge.jsx — Task #44: Show Live Cart Item Count in Navbar
// ═══════════════════════════════════════════════════════════════
// Replaces the cart icon in Header.jsx with a live badge.
// Watches CartContext itemCount and auto-updates on every change.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartBadge.css';

const CartBadge = () => {
  const navigate          = useNavigate();
  const { itemCount }     = useCart(); // #44 — live count

  return (
    <button
      className="cart-badge-btn"
      onClick={() => navigate('/cart')}
      title="View Cart"
    >
      {/* Cart icon */}
      <span className="cart-badge-btn__icon">🛒</span>

      {/* Badge — only shown when itemCount is greater than 0 */}
      {itemCount > 0 && (
        <span className="cart-badge-btn__count">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartBadge;