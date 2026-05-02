// pages/user/Checkout.jsx
// Route: /customer/checkout
// Theme: dark navy + gold (matches customer portal)
// Flow: Cart summary → Address form → Place Order → Success → redirect /customer/orders

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, itemCount, clearCart, isGiftBox } = useCart();

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    fullName     : '',
    phone        : '',
    addressLine1 : '',
    addressLine2 : '',
    city         : '',
    specialNotes : '',
  });

  const [placing, setPlacing]   = useState(false);  // loading while API call
  const [error,   setError]     = useState(null);
  const [success, setSuccess]   = useState(false);
  const [orderIds, setOrderIds] = useState([]);

  // ── Redirect if cart is empty ─────────────────────────────────────────────
  if (!placing && !success && cartItems.length === 0) {
    return (
      <div className="co-page">
        <div className="co-empty">
          <div className="co-empty__icon">🛒</div>
          <h2 className="co-empty__title">Your cart is empty</h2>
          <button className="co-btn-gold" onClick={() => navigate('/home')}>
            Browse Gifts →
          </button>
        </div>
      </div>
    );
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="co-page">
        <div className="co-success">
          <div className="co-success__icon">🎁</div>
          <h2 className="co-success__title">Order Placed!</h2>
          <p className="co-success__sub">
            Your gift{orderIds.length > 1 ? 's are' : ' is'} on the way.<br />
            Order{orderIds.length > 1 ? 's' : ''}: {orderIds.map(id => `#${id}`).join(', ')}
          </p>
          <div className="co-success__actions">
            <button className="co-btn-gold" onClick={() => navigate('/customer/orders')}>
              View My Orders →
            </button>
            <button className="co-btn-outline" onClick={() => navigate('/home')}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const validate = () => {
    if (!form.fullName.trim())     return 'Full name required.';
    if (!form.phone.trim())        return 'Phone number required.';
    if (!form.addressLine1.trim()) return 'Address required.';
    if (!form.city.trim())         return 'City required.';
    return null;
  };

  const handlePlaceOrder = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setPlacing(true);
    setError(null);

    try {
      const deliveryAddress = [
        form.addressLine1,
        form.addressLine2,
        form.city,
      ].filter(Boolean).join(', ');

      const response = await fetch('http://localhost:8080/api/orders/checkout', {
        method      : 'POST',
        credentials : 'include',           // session cookie
        headers     : { 'Content-Type': 'application/json' },
        body        : JSON.stringify({
            fullName: form.fullName,           
            phone: form.phone,               
            addressLine1: form.addressLine1,    
            addressLine2: form.addressLine2,    
            city: form.city,                    
            specialNotes: form.specialNotes,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Checkout failed. Please try again.');
      }

      // Backend clears cart — sync frontend state too
      clearCart();
      setOrderIds(data.orderIds ?? []);
      setSuccess(true);

    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="co-page">

      {/* Page header */}
      <div className="co-top">
        <button className="co-back-btn" onClick={() => navigate('/customer/cart')}>
          ← Back to Cart
        </button>
        <h1 className="co-title">Checkout</h1>
      </div>

      <div className="co-body">

        {/* ── Left: Delivery form ── */}
        <div className="co-form-panel">
          <div className="co-section-title">Delivery Details</div>

          <div className="co-form">
            <div className="co-field-row">
              <div className="co-field">
                <label className="co-label">Full Name *</label>
                <input
                  className="co-input"
                  name="fullName"
                  placeholder="Kavindi Perera"
                  value={form.fullName}
                  onChange={handleChange}
                />
              </div>
              <div className="co-field">
                <label className="co-label">Phone *</label>
                <input
                  className="co-input"
                  name="phone"
                  placeholder="07X XXX XXXX"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="co-field">
              <label className="co-label">Address Line 1 *</label>
              <input
                className="co-input"
                name="addressLine1"
                placeholder="No. 12, Galle Road"
                value={form.addressLine1}
                onChange={handleChange}
              />
            </div>

            <div className="co-field">
              <label className="co-label">Address Line 2</label>
              <input
                className="co-input"
                name="addressLine2"
                placeholder="Apartment, floor (optional)"
                value={form.addressLine2}
                onChange={handleChange}
              />
            </div>

            <div className="co-field">
              <label className="co-label">City *</label>
              <input
                className="co-input"
                name="city"
                placeholder="Colombo"
                value={form.city}
                onChange={handleChange}
              />
            </div>

            <div className="co-field">
              <label className="co-label">Special Notes</label>
              <textarea
                className="co-input co-textarea"
                name="specialNotes"
                placeholder="Gift message, delivery instructions..."
                value={form.specialNotes}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </div>

          {/* Error */}
          {error && <div className="co-error">⚠️ {error}</div>}
        </div>

        {/* ── Right: Order summary ── */}
        <div className="co-summary">
          <div className="co-section-title">Order Summary</div>

          {/* Items list */}
          <div className="co-summary__items">
            {cartItems.map((item) => (
              <div
                key={isGiftBox(item) ? `gb-${item.giftBoxId}` : `p-${item.productId}`}
                className="co-summary__item"
              >
                <div className="co-summary__item-info">
                  <span className="co-summary__item-name">
                    {isGiftBox(item) ? '🎁 ' : ''}{item.name}
                  </span>
                  <span className="co-summary__item-qty">× {item.quantity}</span>
                </div>
                <span className="co-summary__item-price">
                  LKR {Number(item.unitPrice * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="co-summary__divider" />

          {/* Totals */}
          <div className="co-summary__rows">
            <div className="co-summary__row">
              <span>Subtotal ({itemCount} items)</span>
              <span>LKR {Number(cartTotal).toLocaleString()}</span>
            </div>
            <div className="co-summary__row">
              <span>Delivery</span>
              <span className="co-free">FREE</span>
            </div>
            <div className="co-summary__row">
              <span>Gift Wrapping</span>
              <span className="co-free">Included</span>
            </div>
          </div>

          <div className="co-summary__divider" />

          <div className="co-summary__total">
            <span>Total</span>
            <span className="co-summary__total-amt">
              LKR {Number(cartTotal).toLocaleString()}
            </span>
          </div>

          {/* Place Order button */}
          <button
            className={`co-place-btn ${placing ? 'co-place-btn--loading' : ''}`}
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? '⟳ Placing Order…' : '🎁 Place Order'}
          </button>

          <p className="co-secure-note">🔒 Secure checkout · Free delivery island-wide</p>
        </div>

      </div>
    </div>
  );
};

export default Checkout;