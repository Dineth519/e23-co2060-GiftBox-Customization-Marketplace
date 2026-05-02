import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartBadge.css';

const CartBadge = () => {
  const navigate          = useNavigate();
  const { itemCount }     = useCart(); 

  return (
    <button
      className="cart-badge-btn"
      onClick={() => navigate('/customer/cart')}
      title="View Cart"
    >
      <span className="cart-badge-btn__icon">🛒</span>

      {itemCount > 0 && (
        <span className="cart-badge-btn__count">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
};

export default CartBadge;