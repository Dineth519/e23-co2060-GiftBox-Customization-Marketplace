// ═══════════════════════════════════════════════════════════════
// CartBadge.jsx — Task #44: Show Live Cart Item Count in Navbar
// ═══════════════════════════════════════════════════════════════
// Header.jsx වල cart icon replace කරන්නේ මේකෙන්.
// CartContext itemCount watch කරනවා — auto update වෙනවා.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContextHeader';
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

      {/* Badge — itemCount > 0 නම් විතරක් show කරනවා */}
      {itemCount > 0 && (
        <span className="cart-badge-btn__count">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartBadge;