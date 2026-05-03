// pages/user/CustomerCart.jsx
// Logged-in customer cart — renders inside CustomerLayout via <Outlet />
// NO own Header/Footer — CustomerLayout provides those
// Route: /customer/cart
// Theme: dark navy + gold (matches customer portal)

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CustomerCart.css';

const CustomerCart = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, itemCount, removeItem, updateQty, clearCart, loadCart } = useCart();

  useEffect(() => { loadCart(); }, []);

  // ── Empty State ──────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="cc-page">
        <div className="cc-empty">
          <div className="cc-empty__icon">🛒</div>
          <h2 className="cc-empty__title">Your cart is empty</h2>
          <p className="cc-empty__desc">Browse our collection and add something special</p>
          <div className="cc-empty__actions">
            <button className="cc-btn-gold" onClick={() => navigate('/home')}>
              Browse Gifts →
            </button>
            <button className="cc-btn-outline" onClick={() => navigate('/customer/build-box')}>
              Build a Box
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Cart ─────────────────────────────────────────────────────────────────
  return (
    <div className="cc-page">

      {/* Page title */}
      <div className="cc-top">
        <div className="cc-top__inner">
          <h1 className="cc-title">Shopping Cart</h1>
          <span className="cc-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="cc-body">

        {/* ── Items list ── */}
        <div className="cc-items">

          {/* Table header */}
          <div className="cc-items__header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          {/* Item rows */}
          {cartItems.map((item, i) => (
            <div
              key={item.productId}
              className="cc-item"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Product info */}
              <div className="cc-item__product">
                <div className="cc-item__img-wrap">
                  <img src={item.imageUrl} alt={item.name} className="cc-item__img" />
                </div>
                <div className="cc-item__info">
                  <div className="cc-item__name">{item.name}</div>
                  <div className="cc-item__vendor">Giftora Exclusive</div>
                </div>
              </div>

              {/* Price */}
              <div className="cc-item__price">
                LKR {Number(item.price).toLocaleString()}
              </div>

              {/* Qty stepper */}
              <div className="cc-item__qty">
                <button
                  className="cc-qty-btn"
                  onClick={() => updateQty(item.productId, item.quantity - 1)}
                >−</button>
                <span className="cc-qty-value">{item.quantity}</span>
                <button
                  className="cc-qty-btn"
                  onClick={() => updateQty(item.productId, item.quantity + 1)}
                >+</button>
              </div>

              {/* Subtotal */}
              <div className="cc-item__subtotal">
                LKR {Number(item.price * item.quantity).toLocaleString()}
              </div>

              {/* Remove */}
              <button
                className="cc-item__remove"
                onClick={() => removeItem(item.productId)}
                title="Remove item"
              >✕</button>
            </div>
          ))}

          {/* Footer actions */}
          <div className="cc-items__footer">
            <button className="cc-clear-btn" onClick={clearCart}>🗑️ Clear Cart</button>
            <button className="cc-continue-btn" onClick={() => navigate('/home')}>
              ← Continue Shopping
            </button>
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="cc-summary">
          <div className="cc-summary__title">Order Summary</div>

          <div className="cc-summary__rows">
            <div className="cc-summary__row">
              <span>Subtotal ({itemCount} items)</span>
              <span>LKR {Number(cartTotal).toLocaleString()}</span>
            </div>
            <div className="cc-summary__row">
              <span>Delivery</span>
              <span className="cc-free">FREE</span>
            </div>
            <div className="cc-summary__row">
              <span>Gift Wrapping</span>
              <span className="cc-free">Included</span>
            </div>
          </div>

          <div className="cc-summary__divider" />

          <div className="cc-summary__total">
            <span>Total</span>
            <span className="cc-summary__total-amt">
              LKR {Number(cartTotal).toLocaleString()}
            </span>
          </div>

          {/* Logged-in → go straight to checkout (no login redirect) */}
          <button
            className="cc-checkout-btn"
            onClick={() => navigate('/customer/cart')}
          >
            Proceed to Checkout →
          </button>

          <button
            className="cc-build-btn"
            onClick={() => navigate('/customer/build-box')}
          >
            + Build a Gift Box
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerCart;