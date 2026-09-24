import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { X, MapPin, Phone, CreditCard, Banknote, ShieldCheck } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './CheckoutModal.css';

const stripePromise = loadStripe('pk_test_51UIPGXBkZFvVdDzSFdXK26Pho1vSKVLgw9SM6oAyXsdSfkfLW9NdH8ZyVWdmwcSxWqPqQcQrXQcVsFVocUM3J3Wv00Sf8i2Zgx');

const StripeCheckoutForm = ({ orderPayload, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMessage(null);

    // 1. Process Stripe Payment
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // 2. Process Backend Order
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/orders/standard`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(orderPayload)
        });

        if (!res.ok) throw new Error('Failed to save order to database.');
        await clearCart();
        onSuccess();
      } catch (err) {
        setErrorMessage(err.message);
        setIsProcessing(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
      <PaymentElement options={{ wallets: { link: 'never' } }} />


      {errorMessage && <div className="co-modal-error" style={{ marginTop: '16px' }}>{errorMessage}</div>}
      <div className="co-modal-footer" style={{ marginTop: '24px' }}>
        <button type="button" className="co-modal-btn-cancel" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </button>
        <button type="submit" className="co-modal-btn co-modal-btn--gold" disabled={!stripe || isProcessing}>
          {isProcessing ? 'Processing...' : 'Complete & Pay'}
        </button>
      </div>
    </form>
  );
};

const CheckoutModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, clearCart, cartTotal } = useCart();

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [clientSecret, setClientSecret] = useState(null);

  const userId = localStorage.getItem('userId') ? parseInt(localStorage.getItem('userId')) : 5;

  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setClientSecret(null);
      
      const fetchUserData = async () => {
        setLoadingData(true);
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.name) setName(data.name);
            
            const addrParts = [data.addressLine1, data.addressLine2].filter(p => p && p.trim() !== '');
            if (addrParts.length > 0) setDeliveryAddress(addrParts.join(', '));
            
            if (data.city) setCity(data.city);
            if (data.postalCode) setZipCode(data.postalCode);
            if (data.phoneNumber) setMobileNumber(data.phoneNumber);
          }
        } catch (err) {
          console.error("Failed to fetch user profile", err);
        } finally {
          setLoadingData(false);
        }
      };
      fetchUserData();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    // Fetch PaymentIntent when method is card and secret doesn't exist
    if (isOpen && paymentMethod === 'card' && cartTotal > 0 && !clientSecret) {
      const fetchIntent = async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/payments/create-intent`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify({ amount: cartTotal })
          });
          const data = await res.json();
          if (data.clientSecret) {
            setClientSecret(data.clientSecret);
          } else {
            setError(data.error || 'Failed to load secure payment gateway.');
          }
        } catch (err) {
          setError(err.message || 'Network error loading payment gateway.');
        }
      };
      fetchIntent();
    }
  }, [isOpen, paymentMethod, cartTotal, clientSecret]);

  if (!isOpen) return null;

  const getOrderPayload = () => {
    const finalAddress = `${name.trim()} | ${deliveryAddress.trim()}, ${city.trim()} ${zipCode.trim()} | Phone: ${mobileNumber.trim()} | Method: ${paymentMethod.toUpperCase()}`;
    return {
      customerId: userId,
      deliveryAddress: finalAddress,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };
  };

  const handlePlaceCODOrder = async (e) => {
    e.preventDefault();
    if (!name.trim() || !deliveryAddress.trim() || !city.trim() || !mobileNumber.trim()) {
      setError('Please fill out all required shipping details.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/orders/standard`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(getOrderPayload())
      });

      if (!res.ok) throw new Error('Failed to place order');
      await clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeAndNavigate = (path) => {
    onClose();
    if (path) navigate(path);
  };

  return (
    <div className="co-modal-overlay">
      <div className="co-modal-content" onClick={e => e.stopPropagation()}>
        <button className="co-modal-close" onClick={onClose}><X size={20} /></button>

        {success ? (
          <div className="co-modal-success">
            <div className="co-modal-success-icon">✨</div>
            <h2>Order Placed Successfully!</h2>
            <p>Thank you for shopping with Giftora. Your order has been sent to our premium vendors for assembly.</p>
            <div className="co-modal-success-actions">
              <button className="co-modal-btn co-modal-btn--gold" onClick={() => closeAndNavigate('/customer/orders')}>
                View My Orders
              </button>
              <button className="co-modal-btn co-modal-btn--outline" onClick={() => closeAndNavigate('/home')}>
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="co-modal-body">
            <div className="co-modal-header">
              <h2>Secure Checkout</h2>
              <p>Review your details and complete the order.</p>
            </div>

            {loadingData ? (
              <div className="co-modal-loading">Loading your details...</div>
            ) : (
              <form onSubmit={paymentMethod === 'cash' ? handlePlaceCODOrder : (e) => e.preventDefault()} className="co-modal-form-split">
                
                <div className="co-modal-left">
                  <div className="co-form-section">
                    <h3>Delivery Details</h3>
                  
                  <div className="co-form-group">
                    <label><MapPin size={16} /> Full Name</label>
                    <input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      required
                    />
                  </div>
                  
                  <div className="co-form-group">
                    <label>Street Address</label>
                    <textarea 
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Enter street address"
                      rows="2"
                      required
                    ></textarea>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="co-form-group" style={{ flex: 1 }}>
                      <label>Town / City</label>
                      <input 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Colombo"
                        required
                      />
                    </div>
                    <div className="co-form-group" style={{ flex: 1 }}>
                      <label>Zip Code</label>
                      <input 
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="e.g. 00100"
                        required
                      />
                    </div>
                  </div>

                  <div className="co-form-group">
                    <label>
                      <Phone size={16} /> Mobile Number
                    </label>
                    <input 
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      required
                    />
                  </div>
                </div>
              </div>

                <div className="co-modal-right">
                  <div className="co-form-section">
                    <h3>Payment Method</h3>
                  <div className="co-payment-methods">
                    <label className={`co-payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="card"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                      />
                      <CreditCard size={20} />
                      <span>Credit/Debit Card</span>
                    </label>

                    <label className={`co-payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}>
                      <input 
                        type="radio" 
                        name="payment" 
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={() => setPaymentMethod('cash')}
                      />
                      <Banknote size={20} />
                      <span>Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                {error && <div className="co-modal-error">{error}</div>}

                {paymentMethod === 'card' ? (
                  clientSecret ? (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripeCheckoutForm 
                        orderPayload={getOrderPayload()}
                        onSuccess={() => setSuccess(true)}
                        onCancel={onClose}
                      />
                    </Elements>
                  ) : (
                    <div className="co-modal-loading" style={{ margin: '24px 0' }}>Initializing secure payment gateway...</div>
                  )
                ) : (
                  <div className="co-modal-footer">
                    <button type="button" className="co-modal-btn-cancel" onClick={onClose}>
                      Cancel
                    </button>
                    <button type="submit" className="co-modal-btn co-modal-btn--gold" disabled={submitting}>
                      {submitting ? 'Processing...' : 'Confirm COD Order'}
                    </button>
                  </div>
                )}
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
