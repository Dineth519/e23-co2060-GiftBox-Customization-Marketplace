// pages/user/CustomerCart.jsx
// Route: /customer/cart
// Theme: dark navy + gold
// removeItem(item)        — full item object
// updateQty(item, newQty) — full item object + qty

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CustomerCart.css';

const CustomerCart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartTotal,
    itemCount,
    removeItem,
    updateQty,
    clearCart,
    loadCart,
    isGiftBox,
    loading,
    error,
  } = useCart();

  useEffect(() => { loadCart(); }, []);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cc-page">
        <div className="cc-empty">
          <div className="cc-empty__icon cc-spin">⟳</div>
          <h2 className="cc-empty__title">Loading your cart…</h2>
        </div>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (cartItems.length === 0) {
    return (
      <div className="cc-page">
        <div className="cc-empty">
          <div className="cc-empty__icon">🛒</div>
          <h2 className="cc-empty__title">Your cart is empty</h2>
          <p className="cc-empty__desc">Browse our collection and add something special</p>
          <div className="cc-empty__actions">
            <button className="cc-btn-gold" onClick={() => navigate('/home')}>Browse Gifts →</button>
            <button className="cc-btn-outline" onClick={() => navigate('/customer/build-box')}>Build a Box</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Cart ──────────────────────────────────────────────────────────────────
  return (
    <div className="cc-page">

      {error && <div className="cc-error-banner">⚠️ {error}</div>}

      <div className="cc-top">
        <div className="cc-top__inner">
          <h1 className="cc-title">Shopping Cart</h1>
          <span className="cc-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="cc-body">

        {/* ── Items ── */}
        <div className="cc-items">

          <div className="cc-items__header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span></span>
          </div>

          {cartItems.map((item, i) => (
            <div
              key={isGiftBox(item) ? `gb-${item.giftBoxId}` : `p-${item.productId}`}
              className={`cc-item ${isGiftBox(item) ? 'cc-item--giftbox' : ''}`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {/* Image + name */}
              <div className="cc-item__product">
                <div className="cc-item__img-wrap">
                  <img src={item.imageUrl} alt={item.name} className="cc-item__img" />
                  {isGiftBox(item) && <span className="cc-item__type-badge">🎁</span>}
                </div>
                <div className="cc-item__info">
                  <div className="cc-item__name">{item.name}</div>
                  <div className="cc-item__vendor">
                    {isGiftBox(item) ? '✨ Custom Gift Box' : 'Giftora Exclusive'}
                  </div>
                </div>
              </div>

              {/* Unit price */}
              <div className="cc-item__price">
                LKR {Number(item.unitPrice).toLocaleString()}
              </div>

              {/* Qty — FIX: pass full item object */}
              <div className="cc-item__qty">
                <button
                  className="cc-qty-btn"
                  onClick={() => updateQty(item, item.quantity - 1)}
                  aria-label="Decrease"
                >−</button>
                <span className="cc-qty-value">{item.quantity}</span>
                <button
                  className="cc-qty-btn"
                  onClick={() => updateQty(item, item.quantity + 1)}
                  aria-label="Increase"
                >+</button>
              </div>

              {/* Subtotal */}
              <div className="cc-item__subtotal">
                LKR {Number(item.unitPrice * item.quantity).toLocaleString()}
              </div>

              {/* Remove — FIX: pass full item object */}
              <button
                className="cc-item__remove"
                onClick={() => removeItem(item)}
                title="Remove item"
                aria-label={`Remove ${item.name}`}
              >✕</button>
            </div>
          ))}

          <div className="cc-items__footer">
            <button className="cc-clear-btn" onClick={clearCart}>🗑️ Clear Cart</button>
            <button className="cc-continue-btn" onClick={() => navigate('/products')}>← Continue Shopping</button>
          </div>
        </div>

        {/* ── Summary ── */}
        <div className="cc-summary">
          <div className="cc-summary__title">Order Summary</div>

          <div className="cc-summary__rows">
            <div className="cc-summary__row">
              <span>Subtotal ({itemCount} items)</span>
              <span>LKR {Number(cartTotal).toLocaleString()}</span>
            </div>

            {cartItems.some(isGiftBox) && (
              <div className="cc-summary__row cc-summary__row--sub">
                <span>🎁 Gift Boxes ({cartItems.filter(isGiftBox).length})</span>
                <span>LKR {Number(
                  cartItems.filter(isGiftBox).reduce((s, i) => s + i.unitPrice * i.quantity, 0)
                ).toLocaleString()}</span>
              </div>
            )}

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
            <span className="cc-summary__total-amt">LKR {Number(cartTotal).toLocaleString()}</span>
          </div>

          <button className="cc-checkout-btn" onClick={() => navigate('/customer/checkout')}>
            Proceed to Checkout →
          </button>

          <button className="cc-build-btn" onClick={() => navigate('/customer/customize')}>
            + Build a Gift Box
          </button>
        </div>

      </div>
    </div>
  );
};

export default CustomerCart;