import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landingpage/Header';
import Footer from '../../components/landingpage/Footer';
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
  
  const [activeStep, setActiveStep] = useState(1);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [draft] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('giftora_box_draft')) || {}; }
    catch { return {}; }
  });
  const [occasion, setOccasion] = useState(draft.occasion || OCCASIONS[0].id);
  const [selectedItems, setSelectedItems] = useState(draft.selectedItems || {}); // { productId: quantity }
  const [boxSize, setBoxSize] = useState(BOX_SIZES.find(size => size.id === draft.boxSize?.id) || BOX_SIZES[1]);
  
  // Personalization State
  const [recipientName, setRecipientName] = useState(draft.recipientName || '');
  const [giftMessage, setGiftMessage] = useState(draft.giftMessage || '');
  const [wrappingStyle, setWrappingStyle] = useState(WRAPPING_STYLES.find(style => style.id === (draft.wrappingStyle?.id || draft.wrappingStyle)) || WRAPPING_STYLES[0]);
  const [ribbonColor, setRibbonColor] = useState(draft.ribbonColor || wrappingStyle.defaultRibbon);
  const [senderName, setSenderName] = useState(draft.senderName || '');
  const [cardTemplate, setCardTemplate] = useState(CARD_TEMPLATES.find(template => template.id === draft.cardTemplate?.id) || CARD_TEMPLATES[1]);
  const [hasWaxSeal, setHasWaxSeal] = useState(draft.hasWaxSeal ?? true);
  const [deliveryDate, setDeliveryDate] = useState(draft.deliveryDate || '');
  const [deliveryAddress, setDeliveryAddress] = useState(draft.deliveryAddress || '');

  // App UI Feedback States
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Auto-dismiss toast
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch product catalog on mount with fallback
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoadingCatalog(true);
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/products`);
        if (res.ok) {
          const data = await res.json();
          setCatalogProducts(data.length > 0 ? data : FALLBACK_PRODUCTS);
        } else {
          setCatalogProducts(FALLBACK_PRODUCTS);
        }
      } catch (err) {
        setCatalogProducts(FALLBACK_PRODUCTS);
      } finally {
        setIsLoadingCatalog(false);
      }
    };
    fetchCatalog();
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

  // Submit Order Process
  const canPlaceOrder = () => !isLoadingCatalog && totalItemsCount > 0 &&
    totalItemsCount <= boxSize.limit && recipientName.trim() && deliveryAddress.trim();

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder() || submitting) return;
    const token = localStorage.getItem('accessToken');
    const customerId = Number(localStorage.getItem('userId'));
    if (!token || !customerId || localStorage.getItem('role') !== 'CUSTOMER') {
      sessionStorage.setItem('giftora_box_draft', JSON.stringify({
        occasion, selectedItems, boxSize, recipientName, giftMessage, wrappingStyle, deliveryAddress,
        ribbonColor, senderName, cardTemplate, hasWaxSeal, deliveryDate
      }));
      sessionStorage.setItem('giftora_return_to', '/build-box');
      navigate('/login');
      return;
    }
    
    setSubmitting(true);
    const orderPayload = {
      customerId, deliveryAddress, occasion, boxSize: boxSize.id,
      giftMessage, recipientName, wrappingStyle: wrappingStyle.id,
      items: Object.entries(selectedItems).map(([id, qty]) => ({ productId: parseInt(id), quantity: qty }))
    };

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/orders/custom-box`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderPayload)
      });
      if (!res.ok) throw new Error('Failed to place order');
      sessionStorage.removeItem('giftora_box_draft');
      setSubmitSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      triggerToast('Could not place your order. Your selections are still here. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="bb-page public-box-builder">
        <Header />
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
              <button className="bb-btn-primary" onClick={() => navigate('/')}>Return to Storefront</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bb-page public-box-builder">
      <Header />

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bb-toast-notification">
          <span>⚠️ {toastMessage}</span>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="bb-hero">
        <div className="bb-hero-inner" ref={heroRef}>
          <span className="bb-hero-badge">A gift, made personal</span>
          <h1 className="bb-hero-title">
            A little thought.<br />
            An unforgettable <span className="bb-hero-accent">gift.</span>
          </h1>
          <p className="bb-hero-sub">Create something that feels like them. Choose your box, discover thoughtful gifts, and finish with a personal message.</p>
          <div className="public-builder-details"><span>Curated by you</span><span>Beautifully wrapped</span><span>Made for every occasion</span></div>
        </div>
      </section>

      {/* STEPPER PROGRESS NAVIGATION */}
      <div className="bb-stepper-bar">
        {[
          { step: 1, label: ' Framework & Size' },
          { step: 2, label: ' Wrap & Styling' },
          { step: 3, label: ' Select Inventory' },
          { step: 4, label: ' Card & Dispatch' }
        ].map((item) => (
          <button
            key={item.step}
            aria-label={`Step ${item.step}: ${item.label.trim()}`}
            aria-current={activeStep === item.step ? 'step' : undefined}
            className={`bb-step-btn ${activeStep === item.step ? 'active' : ''} ${activeStep > item.step ? 'completed' : ''}`}
            onClick={() => setActiveStep(item.step)}
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

              <button className="bb-btn-forward" onClick={() => setActiveStep(2)}>
                Next: Wrap & Ribbon Styling →
              </button>
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

              <div className="bb-step-nav-row">
                <button className="bb-btn-secondary" onClick={() => setActiveStep(1)}>← Back</button>
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
                      <span className="bb-empty-chip-text">No items packed yet</span>
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
                <div className="bb-loading-spinner">Loading curated catalog...</div>
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
                <button className="bb-btn-secondary" onClick={() => setActiveStep(2)}>← Back</button>
                <button
                  className="bb-btn-forward"
                  disabled={totalItemsCount === 0}
                  onClick={() => setActiveStep(4)}
                >
                  Next: Greeting & Dispatch →
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

                <div className="bb-field">
                  <label>Delivery Destination Address *</label>
                  <input
                    type="text"
                    placeholder="Street, City, Zip / Postal Code"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div className="bb-field">
                  <label>Preferred Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="bb-step-nav-row" style={{ marginTop: '32px' }}>
                <button className="bb-btn-secondary" onClick={() => setActiveStep(3)}>← Back</button>
                <button
                  className="bb-btn-submit"
                  disabled={submitting}
                  onClick={handlePlaceOrder}
                >
                  {submitting ? 'Processing Submission...' : `Complete Order • LKR ${grandTotal.toLocaleString()}`}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT LIVE PREVIEW & LEDGER PANEL */}
        <aside className="bb-preview-panel">
          <div className="bb-preview-header">
            <h4>Live Visual Preview</h4>
            <span className="bb-live-tag">Interactive</span>
          </div>

            <button 
              className="bb-btn-submit" 
              onClick={handlePlaceOrder}
              disabled={submitting || !canPlaceOrder()}
            >
              {submitting ? 'Processing...' : (localStorage.getItem('role') === 'CUSTOMER' && localStorage.getItem('accessToken') ? 'Place Order' : 'Sign in to place order')}
            </button>
            
          <div className="bb-box-canvas" style={{ backgroundColor: wrappingStyle.color }}>
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
                <p className="bb-empty-packed">No items packed yet.</p>
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

      <Footer />
    </div>
  );
};

export default BoxBuilderPage;
