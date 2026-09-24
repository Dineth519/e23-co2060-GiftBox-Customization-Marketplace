// BoxBuilderPage.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51UIPGXBkZFvVdDzSFdXK26Pho1vSKVLgw9SM6oAyXsdSfkfLW9NdH8ZyVWdmwcSxWqPqQcQrXQcVsFVocUM3J3Wv00Sf8i2Zgx');

const CheckoutForm = ({ grandTotal, onPaymentSuccess, onBack, submitting }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);
    setErrorMsg('');
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/orders`
        },
        redirect: 'if_required'
      });
      if (error) {
        setErrorMsg(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
      }
    } catch (err) {
      console.error("Stripe confirm error:", err);
      setErrorMsg('Payment failed: ' + (err.message || 'An unexpected error occurred.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form id="bb-checkout-form" onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <PaymentElement options={{ wallets: { link: 'never' } }} />

      {errorMsg && <div style={{ color: 'red', marginTop: '12px' }}>{errorMsg}</div>}
      <div className="bb-step-nav-row" style={{ marginTop: '32px' }}>
        <button type="button" className="bb-btn-back" onClick={onBack} disabled={isProcessing || submitting}>
          <span>←</span>
          <span>Back</span>
        </button>
        <button type="submit" className="bb-btn-submit" disabled={!stripe || isProcessing || submitting}>
          {isProcessing || submitting ? 'Processing...' : `Pay • LKR ${grandTotal.toLocaleString()}`}
        </button>
      </div>
    </form>
  );
};

import './BoxBuilderPage.css';

// Safe helper to extract product ID regardless of backend field naming (_id, id, productId)
const getProdId = (p) => p?.productId ?? p?.id ?? p?._id;

// Master Static Data Definitions
const OCCASIONS = [
  { id: 'Birthday', icon: '🎂', label: 'Birthday', desc: 'Celebrate another trip around the sun' },
  { id: 'Anniversary', icon: '💑', label: 'Anniversary', desc: 'Commemorate cherished milestones' },
  { id: 'Wedding', icon: '💍', label: 'Wedding', desc: 'Elegant keepsakes for the newly married' },
  { id: 'Corporate', icon: '💼', label: 'Corporate', desc: 'Professional appreciation & VIP gifts' },
  { id: 'Just Because', icon: '🌸', label: 'Just Because', desc: 'Thoughtful surprises for any day' }
];

const BOX_SIZES = [
  { id: 'SMALL', title: 'Petit Box', limit: 3, fee: 800, desc: 'Compact & elegant. Ideal for 1-3 delicate treats.' },
  { id: 'MEDIUM', title: 'Signature Box', limit: 5, fee: 1200, desc: 'Our most popular framework. Fits up to 5 items.' },
  { id: 'LARGE', title: 'Grand Luxe Box', limit: 8, fee: 1800, desc: 'Spacious presentation for grand celebrations (Up to 8 items).' }
];

const WRAPPING_STYLES = [
  { id: 'Classic Gold', name: 'Royal Gold Foil', color: '#C9A961', defaultRibbon: '#FFFFFF' },
  { id: 'Rose Blush', name: 'Velvet Rose Pink', color: '#E8A0BF', defaultRibbon: '#4A2E35' },
  { id: 'Midnight Navy', name: 'Imperial Midnight', color: '#1A1A2E', defaultRibbon: '#C9A961' },
  { id: 'Emerald Luxe', name: 'Botanical Emerald', color: '#1B4332', defaultRibbon: '#D4AF37' },
  { id: 'Champagne Silk', name: 'Silk Champagne', color: '#F7E7CE', defaultRibbon: '#6B0F1A' },
  { id: 'Burgundy Reserve', name: 'Vintage Burgundy', color: '#6B0F1A', defaultRibbon: '#F7E7CE' },
  { id: 'Matte Onyx', name: 'Obsidian Noir', color: '#111111', defaultRibbon: '#C9A961' },
  { id: 'Pearl Ivory', name: 'Gilded Ivory', color: '#F5F5F0', defaultRibbon: '#C9A961' },
  { id: 'Sapphire Elegance', name: 'Deep Sapphire', color: '#0F2027', defaultRibbon: '#E0E0E0' },
  { id: 'Tuscan Terracotta', name: 'Warm Terracotta', color: '#C86D51', defaultRibbon: '#4A2E35' },
  { id: 'Sage Linen', name: 'Artisanal Sage', color: '#8A9A86', defaultRibbon: '#FFFFFF' },
  { id: 'Platinum Slate', name: 'Platinum Slate', color: '#708090', defaultRibbon: '#1A1A2E' },
  { id: 'Plum Opulence', name: 'Imperial Plum', color: '#3B1F2B', defaultRibbon: '#FCF6BA' },
  { id: 'Copper Metallic', name: 'Burnished Copper', color: '#B87333', defaultRibbon: '#1A1A2E' },
  { id: 'Muted Lavender', name: 'Dusty Lavender', color: '#96897B', defaultRibbon: '#3B1F2B' },
  { id: 'Celestial Azure', name: 'Midnight Azure', color: '#2C3E50', defaultRibbon: '#F7E7CE' },
  { id: 'Warm Cashmere', name: 'Soft Cashmere', color: '#D3B8AE', defaultRibbon: '#1B4332' },
  { id: 'Smoked Quartz', name: 'Espresso Quartz', color: '#4A3B32', defaultRibbon: '#C9A961' },
  { id: 'Frosted Silver', name: 'Sterling Silver', color: '#E0E0E0', defaultRibbon: '#111111' },
  { id: 'Olive Regency', name: 'Regency Olive', color: '#4A5335', defaultRibbon: '#F5F5F0' },
  { id: 'Coral Solstice', name: 'Sunken Coral', color: '#D07A60', defaultRibbon: '#F7E7CE' },
  { id: 'Cognac Leather', name: 'Artisan Cognac', color: '#8C5228', defaultRibbon: '#111111' }
];

const RIBBON_OPTIONS = [
  { id: 'Gold Ribbon', color: '#D4AF37', label: 'Metallic Gold' },
  { id: 'Silk White', color: '#F8F9FA', label: 'Ivory Silk' },
  { id: 'Satin Red', color: '#900C3F', label: 'Crimson Satin' },
  { id: 'Midnight Onyx', color: '#111111', label: 'Onyx Black' },
  { id: 'Rose Gold', color: '#B76E79', label: 'Rose Gold' },
  { id: 'Emerald Satin', color: '#1B4332', label: 'Botanical Emerald' },
  { id: 'Royal Navy', color: '#1B263B', label: 'Imperial Navy' },
  { id: 'Champagne Silk', color: '#F7E7CE', label: 'Champagne Silk' },
  { id: 'Sterling Silver', color: '#E0E0E0', label: 'Sterling Silver' },
  { id: 'Blush Pink', color: '#E8A0BF', label: 'Velvet Blush' }
];

const CARD_TEMPLATES = [
  { id: 'minimal', name: 'Studio Minimal', fontClass: 'font-sans' },
  { id: 'cursive', name: 'Handwritten Script', fontClass: 'font-script' },
  { id: 'serif', name: 'Classic Serif', fontClass: 'font-serif' }
];

const CATEGORIES = ['All', 'Gourmet', 'Wellness', 'Lifestyle'];

// Fallback Inventory items if live endpoint is unreachable
const FALLBACK_PRODUCTS = [
  { productId: 101, name: 'Artisanal Dark Chocolate Bar', category: 'Gourmet', price: 950, imageUrl: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&q=80' },
  { productId: 102, name: 'Scented Organic Soy Candle', category: 'Wellness', price: 2400, imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&q=80' },
  { productId: 103, name: 'Double-Walled Insulated Tumbler', category: 'Lifestyle', price: 3200, imageUrl: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=400&q=80' },
  { productId: 104, name: 'French Lavender Bath Salts', category: 'Wellness', price: 1850, imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80' },
  { productId: 105, name: 'Single-Origin Coffee Beans (250g)', category: 'Gourmet', price: 2100, imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80' },
  { productId: 106, name: 'Handcrafted Ceramic Mug', category: 'Lifestyle', price: 1600, imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80' },
  { productId: 107, name: 'Pure Mulberry Silk Eye Mask', category: 'Wellness', price: 2800, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&q=80' },
  { productId: 108, name: 'Gourmet Roasted Macadamia Nuts', category: 'Gourmet', price: 1450, imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&q=80' }
];

const BoxBuilderPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { cartItems, addToCart } = useCart();

  // Wizard Control
  const [activeStep, setActiveStep] = useState(1);

  // Catalog State
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Gift Configuration States
  const [occasion, setOccasion] = useState(OCCASIONS[0].id);
  const [boxSize, setBoxSize] = useState(BOX_SIZES[1]);
  const [wrappingStyle, setWrappingStyle] = useState(WRAPPING_STYLES[0]);
  const [ribbonColor, setRibbonColor] = useState(WRAPPING_STYLES[0].defaultRibbon);
  const [selectedItems, setSelectedItems] = useState({});

  // Personalization States
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [cardTemplate, setCardTemplate] = useState(CARD_TEMPLATES[1]);
  const [hasWaxSeal, setHasWaxSeal] = useState(true);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactName, setContactName] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');

  const [deliveryDate, setDeliveryDate] = useState('');

  // App UI Feedback States
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);
  


  // Auto-dismiss toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Use cart items as the only available inventory for the box builder

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.name) setContactName(data.name);
          const addrParts = [data.addressLine1, data.addressLine2].filter(p => p && p.trim() !== '');
          if (addrParts.length > 0) setDeliveryAddress(addrParts.join(', '));
          if (data.city) setCity(data.city);
          if (data.postalCode) setZipCode(data.postalCode);
          if (data.phoneNumber) setMobileNumber(data.phoneNumber);
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    setIsLoadingCatalog(true);
    setCatalogProducts(cartItems || []);
    setIsLoadingCatalog(false);
  }, [cartItems]);

  // Scroll to top of wizard on step change
  useEffect(() => {
    if (heroRef.current) {
      window.scrollTo({
        top: heroRef.current.offsetTop - 80,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeStep]);

  // Restore Draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('giftora_customer_draft_box');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.occasion) setOccasion(parsed.occasion);
        if (parsed.boxSize) setBoxSize(parsed.boxSize);
        if (parsed.selectedItems) setSelectedItems(parsed.selectedItems);
        if (parsed.recipientName) setRecipientName(parsed.recipientName);
        if (parsed.giftMessage) setGiftMessage(parsed.giftMessage);
        if (parsed.wrappingStyle) setWrappingStyle(parsed.wrappingStyle);
        if (parsed.deliveryAddress) setDeliveryAddress(parsed.deliveryAddress);
        if (parsed.ribbonColor) setRibbonColor(parsed.ribbonColor);
        if (parsed.senderName) setSenderName(parsed.senderName);
        if (parsed.cardTemplate) setCardTemplate(parsed.cardTemplate);
        if (parsed.hasWaxSeal !== undefined) setHasWaxSeal(parsed.hasWaxSeal);
        if (parsed.deliveryDate) setDeliveryDate(parsed.deliveryDate);
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Sync Item Trim Constraints when Box Size Decreases
  useEffect(() => {
    if (!boxSize) return;
    let currentTotal = Object.values(selectedItems).reduce((sum, q) => sum + q, 0);
    if (currentTotal <= boxSize.limit) return;

    const updated = { ...selectedItems };
    const keys = Object.keys(updated);
    for (let i = keys.length - 1; i >= 0 && currentTotal > boxSize.limit; i--) {
      const excess = currentTotal - boxSize.limit;
      const remove = Math.min(updated[keys[i]], excess);
      updated[keys[i]] -= remove;
      currentTotal -= remove;
      if (updated[keys[i]] <= 0) delete updated[keys[i]];
    }
    setSelectedItems(updated);
    triggerToast(`Capacity adjusted to match ${boxSize.title} limit (${boxSize.limit} items).`);
  }, [boxSize]);

  // Derived Values
  const availableItems = useMemo(() => {
    return catalogProducts.filter(p => {
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [catalogProducts, activeCategory, searchQuery]);

  const totalItemsCount = useMemo(() => {
    return Object.values(selectedItems).reduce((sum, q) => sum + q, 0);
  }, [selectedItems]);

  const itemsSubtotal = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const product = catalogProducts.find(p => String(getProdId(p)) === String(id));
      return sum + (product ? product.price * qty : 0);
    }, 0);
  }, [selectedItems, catalogProducts]);

  const waxSealFee = hasWaxSeal ? 250 : 0;
  const grandTotal = itemsSubtotal + (boxSize?.fee || 0) + waxSealFee;

  useEffect(() => {
    if (activeStep === 5) {
      setClientSecret(null);
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ amount: grandTotal })
      })
      .then(res => res.json())
      .then(data => {
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          triggerToast('Failed to initialize payment.');
        }
      })
      .catch(err => {
        console.error(err);
        triggerToast('Payment system offline.');
      });
    }
  }, [activeStep, grandTotal]);

  // Item Handlers
  const handleAddItem = (product) => {
    const prodId = getProdId(product);
    if (!prodId) return;

    if (totalItemsCount >= boxSize.limit) {
      triggerToast(`Limit reached (${boxSize.limit} items max). Upgrade box size for more.`);
      return;
    }
    setSelectedItems(prev => ({
      ...prev,
      [prodId]: (prev[prodId] || 0) + 1
    }));
  };

  const handleRemoveItem = (productId) => {
    setSelectedItems(prev => {
      const updated = { ...prev };
      if (updated[productId] > 1) {
        updated[productId] -= 1;
      } else {
        delete updated[productId];
      }
      return updated;
    });
  };

  const handleWrapStyleChange = (wrap) => {
    setWrappingStyle(wrap);
    setRibbonColor(wrap.defaultRibbon);
  };

    // Restore Draft on mount
  useEffect(() => {
    const stored = localStorage.getItem('giftora_customer_drafts');
    if (stored) {
      try {
        setSavedDrafts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse drafts', e);
      }
    }
  }, []);

  const handleSaveDraft = () => {
    const newDraft = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      occasion, selectedItems, boxSize, recipientName, giftMessage, wrappingStyle, deliveryAddress,
      ribbonColor, senderName, cardTemplate, hasWaxSeal, deliveryDate,
      totalItemsCount, grandTotal
    };
    const updatedDrafts = [newDraft, ...savedDrafts];
    setSavedDrafts(updatedDrafts);
    localStorage.setItem('giftora_customer_drafts', JSON.stringify(updatedDrafts));
    triggerToast('Draft saved successfully! You can load it later from the top menu.');
  };

  const loadDraft = (draft) => {
    if (draft.occasion) setOccasion(draft.occasion);
    if (draft.boxSize) setBoxSize(draft.boxSize);
    if (draft.selectedItems) setSelectedItems(draft.selectedItems);
    if (draft.recipientName) setRecipientName(draft.recipientName);
    if (draft.giftMessage) setGiftMessage(draft.giftMessage);
    if (draft.wrappingStyle) setWrappingStyle(draft.wrappingStyle);
    if (draft.deliveryAddress) setDeliveryAddress(draft.deliveryAddress);
    if (draft.ribbonColor) setRibbonColor(draft.ribbonColor);
    if (draft.senderName) setSenderName(draft.senderName);
    if (draft.cardTemplate) setCardTemplate(draft.cardTemplate);
    if (draft.hasWaxSeal !== undefined) setHasWaxSeal(draft.hasWaxSeal);
    if (draft.deliveryDate) setDeliveryDate(draft.deliveryDate);
    setShowDraftsModal(false);
    triggerToast('Draft loaded successfully!');
  };

  const deleteDraft = (draftId) => {
    const updatedDrafts = savedDrafts.filter(d => d.id !== draftId);
    setSavedDrafts(updatedDrafts);
    localStorage.setItem('giftora_customer_drafts', JSON.stringify(updatedDrafts));
  };


  // Submit Order Process for Authenticated Logged In Users
  const handlePlaceOrder = async () => {
    if (totalItemsCount === 0) {
      triggerToast('Your gift box is empty! Add items in Step 3.');
      setActiveStep(3);
      return;
    }
    if (!recipientName.trim()) {
      triggerToast('Please specify a recipient name.');
      return;
    }
    if (!deliveryAddress.trim()) {
      triggerToast('Please provide a complete delivery address.');
      return;
    }

    setSubmitting(true);
    
    const orderPayload = {
      customerId: parseInt(localStorage.getItem('userId')), 

      occasion,
      boxSize: boxSize.id,
      wrappingStyle: wrappingStyle.id,
      ribbonColor,
      hasWaxSeal,
      recipientName,
      senderName,
      giftMessage,
      cardTemplate: cardTemplate.id,
      deliveryAddress,
      deliveryDate,
      totalPrice: grandTotal,
      items: Object.entries(selectedItems).map(([id, qty]) => ({
        productId: parseInt(id),
        quantity: qty
      }))
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/orders/custom-box`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (!res.ok) throw new Error('Failed to place order');
      
      localStorage.removeItem('giftora_customer_draft_box');
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Error placing custom box order:', err);
      triggerToast('Failed to process order. Please contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bb-page customer-box-builder">
        <div className="bb-success-screen">
          <div className="bb-success-card">
            <div className="bb-success-icon">🎁</div>
            <h2 className="bb-success-title">Order Confirmed!</h2>
            <p className="bb-success-desc">
              Your customized <strong>{boxSize.title}</strong> is now being assembled with handcrafted care.
            </p>
            <div className="bb-success-meta">
              <div><span>Recipient:</span> <strong>{recipientName}</strong></div>
              <div><span>Occasion:</span> <strong>{occasion}</strong></div>
              <div><span>Total Paid:</span> <strong>LKR {grandTotal.toLocaleString()}</strong></div>
            </div>
            <div className="bb-success-actions">
              <button className="bb-btn-primary" onClick={() => navigate('/customer/orders')}>View My Orders</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bb-page customer-box-builder">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bb-toast-notification">
          <span>⚠️ {toastMessage}</span>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="bb-hero">
        <div className="bb-hero-inner" ref={heroRef}>
          <span className="bb-hero-badge">Giftora Studio</span>
          <h1 className="bb-hero-title">
            Gift Box <span className="bb-hero-accent">Craft Studio</span>
          </h1>
          <button className="bb-btn-drafts-top" onClick={() => setShowDraftsModal(true)}>
            📋 View Saved Drafts
          </button>
        </div>
      </section>

      {/* STEPPER PROGRESS NAVIGATION */}
      <div className="bb-stepper-bar">
        {[
          { step: 1, label: ' Framework & Size' },
          { step: 2, label: ' Wrap & Styling' },
          { step: 3, label: ' Select Inventory' },
          { step: 4, label: ' Personalization' },
          { step: 5, label: ' Checkout' }
        ].map((item) => (
          <button
            key={item.step}
            aria-label={`Step ${item.step}: ${item.label.trim()}`}
            aria-current={activeStep === item.step ? 'step' : undefined}
            className={`bb-step-btn ${activeStep === item.step ? 'active' : ''} ${activeStep > item.step ? 'completed' : ''}`}
            style={{ cursor: 'default' }}
          >
            <span className="bb-step-num">{item.step}</span>
            <span className="bb-step-lbl">{item.label}</span>
          </button>
        ))}
      </div>

      {/* WORKSPACE CONTENT AREA */}
      <div className="bb-workspace-container">
        
        {/* LEFT FORM PANEL */}
        <div className="bb-builder-panel">
          
          {/* STEP 1: OCCASION & BOX SIZE */}
          {activeStep === 1 && (
            <div className="bb-step-view">
              <div className="bb-step-header">
                <h3>Select Celebration Theme</h3>
                <p>Choose an occasion to set the mood for your gift presentation.</p>
              </div>

              <div className="bb-occasion-grid">
                {OCCASIONS.map(occ => (
                  <button
                    key={occ.id}
                    className={`bb-occ-card ${occasion === occ.id ? 'active' : ''}`}
                    onClick={() => setOccasion(occ.id)}
                  >
                    <span className="bb-occ-icon">{occ.icon}</span>
                    <span className="bb-occ-title">{occ.label}</span>
                    <span className="bb-occ-desc">{occ.desc}</span>
                  </button>
                ))}
              </div>

              <div className="bb-step-header" style={{ marginTop: '36px' }}>
                <h3>Select Box Capacity</h3>
                <p>Dimensions dictate maximum item allocation.</p>
              </div>

              <div className="bb-size-stack">
                {BOX_SIZES.map(sz => (
                  <div
                    key={sz.id}
                    className={`bb-size-card ${boxSize.id === sz.id ? 'active' : ''}`}
                    onClick={() => setBoxSize(sz)}
                  >
                    <div className="bb-size-info">
                      <h4>{sz.title}</h4>
                      <p>{sz.desc}</p>
                      <span className="bb-size-badge">Max Limit: {sz.limit} items</span>
                    </div>
                    <div className="bb-size-price">
                      <span>LKR {sz.fee.toLocaleString()}</span>
                      <small>Box Framework Fee</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bb-step-nav-row" style={{ marginTop: "32px" }}>
                <button className="bb-btn-forward" onClick={() => setActiveStep(2)}>Next: Wrap & Ribbon Styling →</button>
              </div>
              </div>
          )}

          {/* STEP 2: WRAPPING & RIBBON STYLING */}
          {activeStep === 2 && (
            <div className="bb-step-view">
              <div className="bb-step-header">
                <h3>Exterior Box Wrapping</h3>
                <p>Select heavy cardstock textured finishes for exterior casing.</p>
              </div>

              <div className="bb-wrap-grid">
                {WRAPPING_STYLES.map(wrap => (
                  <div
                    key={wrap.id}
                    className={`bb-wrap-card ${wrappingStyle.id === wrap.id ? 'active' : ''}`}
                    onClick={() => handleWrapStyleChange(wrap)}
                  >
                    <div className="bb-wrap-swatch" style={{ backgroundColor: wrap.color }} />
                    <div className="bb-wrap-details">
                      <h5>{wrap.name}</h5>
                      <small>Textured Matte Finish</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bb-step-header" style={{ marginTop: '32px' }}>
                <h3>Ribbon Accent Color</h3>
                <p>Select a satin cross-ribbon highlight.</p>
              </div>

              <div className="bb-ribbon-grid">
                {RIBBON_OPTIONS.map(rib => (
                  <button
                    key={rib.id}
                    className={`bb-ribbon-card ${ribbonColor === rib.color ? 'active' : ''}`}
                    onClick={() => setRibbonColor(rib.color)}
                  >
                    <span className="bb-ribbon-dot" style={{ backgroundColor: rib.color }} />
                    <span>{rib.label}</span>
                  </button>
                ))}
              </div>

              <div className="bb-step-nav-row" style={{ marginTop: "32px" }}>
                <button className="bb-btn-back" onClick={() => setActiveStep(1)}>
                  <span>←</span>
                  <span>Back</span>
                </button>
                <button className="bb-btn-forward" onClick={() => setActiveStep(3)}>Next: Select Items →</button>
              </div>
            </div>
          )}

          {/* STEP 3: CATALOG & ITEM PACKING */}
          {activeStep === 3 && (
            <div className="bb-step-view">
              <div className="bb-step-header">
                <h3>Pack Box Contents</h3>
                <p>Select items to pack inside your box framework.</p>
              </div>

              {/* Filter & Search Bar */}
              <div className="bb-catalog-toolbar">
                <div className="bb-search-box">
                  <input
                    type="text"
                    placeholder="Search boutique items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="bb-category-tabs">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`bb-cat-tab ${activeCategory === cat ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Items Meter */}
              <div className="bb-capacity-indicator">
                <div className="bb-capacity-text">
                  <span>Box Load Status</span>
                  <strong>{totalItemsCount} / {boxSize.limit} Items Filled</strong>
                </div>
                <div className="bb-meter-bar">
                  <div
                    className="bb-meter-fill"
                    style={{ width: `${(totalItemsCount / boxSize.limit) * 100}%` }}
                  />
                </div>

                {/* Selected Products Mini-List */}
                <div className="bb-selected-products-list">
                  <span className="bb-selected-label">Packed Items:</span>
                  <div className="bb-selected-chips">
                    {Object.entries(selectedItems).length === 0 ? (
                      <span className="bb-empty-chip-text">Your box is empty. Please select items from the catalog below.</span>
                    ) : (
                      Object.entries(selectedItems).map(([id, qty]) => {
                        if (qty <= 0) return null;
                        const prod = catalogProducts.find(p => String(getProdId(p)) === String(id));

                        return (
                          <div key={id} className="bb-selected-chip">
                            <span className="bb-chip-name">{prod ? prod.name : `Item #${id}`}</span>
                            <span className="bb-chip-qty">x{qty}</span>
                            <button
                              type="button"
                              className="bb-chip-remove"
                              onClick={() => handleRemoveItem(id)}
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Catalog Grid */}
              {isLoadingCatalog ? (
                <div className="bb-loading-spinner">Loading items...</div>
              ) : catalogProducts.length === 0 ? (
                <div className="bb-empty-catalog">
                  <p>Your shopping cart is empty. Please add items to your cart first before building a box.</p>
                  <button className="bb-btn-secondary" style={{marginTop: '16px'}} onClick={() => navigate('/customer/home')}>Go to Shop</button>
                </div>
              ) : availableItems.length === 0 ? (
                <div className="bb-empty-catalog">
                  <p>No products match your current search criteria.</p>
                </div>
              ) : (
                <div className="bb-catalog-grid">
                  {availableItems.map(prod => {
                    const prodId = getProdId(prod);
                    const qty = selectedItems[prodId] || 0;
                    const isFull = totalItemsCount >= boxSize.limit && qty === 0;

                    return (
                      <div key={prodId} className={`bb-item-card ${qty > 0 ? 'selected' : ''}`}>
                        <div className="bb-item-img-wrap">
                          <img src={prod.imageUrl} alt={prod.name} loading="lazy" />
                          {qty > 0 && <span className="bb-item-qty-badge">{qty}</span>}
                        </div>
                        <div className="bb-item-body">
                          <h5>{prod.name}</h5>
                          <span className="bb-item-price">LKR {prod.price ? prod.price.toLocaleString() : '0'}</span>
                          
                          <div className="bb-item-actions">
                            {qty > 0 ? (
                              <div className="bb-qty-stepper">
                                <button onClick={() => handleRemoveItem(prodId)}>−</button>
                                <span>{qty}</span>
                                <button onClick={() => handleAddItem(prod)} disabled={totalItemsCount >= boxSize.limit}>+</button>
                              </div>
                            ) : (
                              <button
                                className="bb-btn-add-item"
                                onClick={() => handleAddItem(prod)}
                                disabled={isFull}
                              >
                                {isFull ? 'Box Full' : '+ Pack Item'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="bb-step-nav-row" style={{ marginTop: '32px' }}>
                <button className="bb-btn-back" onClick={() => setActiveStep(2)}>
                  <span>←</span>
                  <span>Back</span>
                </button>
                <button
                  className="bb-btn-forward"
                  disabled={totalItemsCount === 0}
                  onClick={() => setActiveStep(4)}
                >
                  Next: Personalization →
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PERSONALIZATION & DISPATCH */}
          {activeStep === 4 && (
            <div className="bb-step-view">
              <div className="bb-step-header">
                <h3>Personalization & Delivery</h3>
                <p>Provide card details and consignment address.</p>
              </div>

              <div className="bb-form-layout">
                <div className="bb-field-row">
                  <div className="bb-field">
                    <label>Recipient Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Eleanor Vance"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="bb-field">
                    <label>Sender Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. With love, Arthur"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bb-field">
                  <label>
                    Gift Card Message
                    <small>{giftMessage.length}/180 characters</small>
                  </label>
                  <textarea
                    rows={4}
                    maxLength={180}
                    placeholder="Write a custom gift message to be printed inside the card..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                  />
                </div>

                <div className="bb-field">
                  <label>Gift Card Typography Style</label>
                  <div className="bb-template-selector">
                    {CARD_TEMPLATES.map(tpl => (
                      <button
                        key={tpl.id}
                        className={`bb-tpl-btn ${cardTemplate.id === tpl.id ? 'active' : ''}`}
                        onClick={() => setCardTemplate(tpl)}
                      >
                        {tpl.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bb-field-row align-center">
                  <div className="bb-checkbox-field">
                    <input
                      type="checkbox"
                      id="waxSeal"
                      checked={hasWaxSeal}
                      onChange={(e) => setHasWaxSeal(e.target.checked)}
                    />
                    <label htmlFor="waxSeal">
                      Add Hand-Stamped Gold Wax Seal (+LKR 250)
                    </label>
                  </div>
                </div>
              </div>

              <div className="bb-step-nav-row" style={{ marginTop: '32px' }}>
                <button className="bb-btn-back" onClick={() => setActiveStep(3)}>
                  <span>←</span>
                  <span>Back</span>
                </button>
                <button
                  className="bb-btn-secondary"
                  onClick={handleSaveDraft}
                  style={{ whiteSpace: 'nowrap', padding: '0 24px', display: 'flex', alignItems: 'center', fontWeight: '600' }}
                >
                  💾 Save Draft
                </button>
                <button
                  className="bb-btn-forward"
                  disabled={!recipientName.trim()}
                  onClick={() => {
                    if (!recipientName.trim()) {
                      triggerToast('Please specify a recipient name.');
                      return;
                    }
                    setActiveStep(5);
                  }}
                >
                  Next: Checkout & Dispatch →
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: CHECKOUT & DISPATCH */}
          {activeStep === 5 && (
            <div className="bb-step-view">
              <div className="bb-step-header">
                <h3>Checkout & Dispatch</h3>
                <p>Provide consignment address and secure payment details.</p>
              </div>

              <div className="bb-form-layout">
                <div className="bb-field-row">
                  <div className="bb-field">
                    <label>Contact Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div className="bb-field">
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 077 123 4567"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bb-field">
                  <label>Delivery Destination Address *</label>
                  <input
                    type="text"
                    placeholder="Street, Building, Apartment"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div className="bb-field-row">
                  <div className="bb-field">
                    <label>Town / City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Colombo 07"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="bb-field">
                    <label>Zip / Postal Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 00700"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bb-field-row">
                  <div className="bb-field">
                    <label>Preferred Delivery Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <CheckoutForm 
                    grandTotal={grandTotal} 
                    onPaymentSuccess={handlePlaceOrder} 
                    onBack={() => setActiveStep(4)} 
                    submitting={submitting} 
                  />
                </Elements>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading secure checkout...
                </div>
              )}
            </div>
          )}

        </div>

        {/* RIGHT LIVE PREVIEW & LEDGER PANEL */}
        <aside className="bb-preview-panel">
          <div className="bb-preview-header">
            <h4>Live Visual Preview</h4>
            <span className="bb-live-tag">Interactive</span>
          </div>

          {/* 3D Visual Box Canvas Mockup */}
          <div className="bb-box-canvas" style={{ backgroundColor: wrappingStyle.color }}>
            {/* Ribbons */}
            <div className="bb-canvas-ribbon-v" style={{ backgroundColor: ribbonColor }} />
            <div className="bb-canvas-ribbon-h" style={{ backgroundColor: ribbonColor }} />
            
            {/* Wax Seal Badge */}
            {hasWaxSeal && (
              <div className="bb-canvas-wax-seal">
                <span>G</span>
              </div>
            )}

            {/* Floating Gift Tag */}
            <div className="bb-canvas-tag">
              <span className="bb-tag-brand">GIFTORA PRESTIGE</span>
              <span className="bb-tag-to">
                {recipientName ? `To: ${recipientName}` : 'To: Recipient Name'}
              </span>
              <div className={`bb-tag-body ${cardTemplate.fontClass}`}>
                {giftMessage ? `"${giftMessage}"` : 'Your personalized greeting message will appear formatted here in real time.'}
              </div>
              {senderName && <span className="bb-tag-from">From: {senderName}</span>}
            </div>

            {/* Box Framework Label Badge */}
            <div className="bb-canvas-badge">
              <span>{boxSize.title} ({totalItemsCount}/{boxSize.limit})</span>
            </div>
          </div>

          {/* Ledger & Price Breakdown */}
          <div className="bb-ledger-card">
            <h5>Cost Breakdown</h5>

            <div className="bb-ledger-line">
              <span>Framework ({boxSize.title})</span>
              <span>LKR {boxSize.fee.toLocaleString()}</span>
            </div>

            <div className="bb-ledger-line">
              <span>Theme Wrap ({wrappingStyle.name})</span>
              <span className="bb-free-badge">INCLUDED</span>
            </div>

            {hasWaxSeal && (
              <div className="bb-ledger-line">
                <span>Hand-Stamped Wax Seal</span>
                <span>LKR {waxSealFee.toLocaleString()}</span>
              </div>
            )}

            <div className="bb-ledger-divider" />

            {/* Packed Items Sub-list */}
            <div className="bb-packed-items-list">
              <span className="bb-packed-title">Packed Items ({totalItemsCount})</span>
              {Object.keys(selectedItems).length === 0 ? (
                <p className="bb-empty-packed">Box is empty. Select items to add.</p>
              ) : (
                Object.entries(selectedItems).map(([id, qty]) => {
                  const prod = catalogProducts.find(p => String(getProdId(p)) === String(id));
                  if (!prod) return null;
                  return (
                    <div key={id} className="bb-packed-item-row">
                      <span>{prod.name} <strong>x{qty}</strong></span>
                      <span>LKR {(prod.price * qty).toLocaleString()}</span>
                    </div>
                  );
                })
              )}
            </div>

            <div className="bb-ledger-divider" />

            <div className="bb-ledger-total">
              <span>Grand Total</span>
              <span>LKR {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </aside>

      </div>
          {/* DRAFTS MODAL */}
      {showDraftsModal && (
        <div className="bb-drafts-overlay" onClick={() => setShowDraftsModal(false)}>
          <div className="bb-drafts-modal" onClick={e => e.stopPropagation()}>
            <div className="bb-drafts-header">
              <h3>Your Saved Drafts</h3>
              <button className="bb-drafts-close" onClick={() => setShowDraftsModal(false)}>✕</button>
            </div>

            <div className="bb-drafts-list">
              {savedDrafts.length === 0 ? (
                <div className="bb-empty-drafts">You have no saved drafts yet.</div>
              ) : (
                savedDrafts.map(draft => (
                  <div key={draft.id} className="bb-draft-card">
                    <div className="bb-draft-info">
                      <h4>{draft.occasion} • {draft.boxSize?.title || 'Unknown Box'}</h4>
                      <p>Saved on {draft.date} • {draft.totalItemsCount || 0} items packed</p>
                    </div>
                    <div className="bb-draft-actions">
                      <button className="bb-draft-load" onClick={() => loadDraft(draft)}>Load</button>
                      <button className="bb-draft-del" onClick={() => deleteDraft(draft.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default BoxBuilderPage;
