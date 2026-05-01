import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './BoxBuilderPage.css';

const CATEGORY_MAP = { 1: 'Wine', 2: 'Watches', 3: 'Perfume', 4: 'Teddy Bears', 5: 'Bangles', 6: 'Chocolates' };

const OCCASIONS = [
  { id: 'Birthday', icon: '🎂', label: 'Birthday' },
  { id: 'Anniversary', icon: '💑', label: 'Anniversary' },
  { id: 'Wedding', icon: '💍', label: 'Wedding' },
  { id: 'Corporate', icon: '💼', label: 'Corporate' },
  { id: 'Just Because', icon: '🌸', label: 'Just Because' }
];

const BOX_SIZES = [
  { id: 'SMALL', title: 'Small Box', limit: 3, fee: 500, desc: 'Up to 3 items' },
  { id: 'MEDIUM', title: 'Medium Box', limit: 5, fee: 800, desc: 'Up to 5 items' },
  { id: 'LARGE', title: 'Large Box', limit: 8, fee: 1200, desc: 'Up to 8 items' }
];

const WRAPPING_STYLES = [
  { id: 'Classic Gold', color: '#C9A84C' },
  { id: 'Rose Pink', color: '#E8A0BF' },
  { id: 'Midnight Blue', color: '#1A2340' }
];

const BoxBuilderPage = () => {
  const navigate = useNavigate();

  // API State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Flow State
  const [currentStep, setCurrentStep] = useState(1);
  const [occasion, setOccasion] = useState(null);
  const [boxSize, setBoxSize] = useState(null);
  const [selectedItems, setSelectedItems] = useState({}); // { productId: quantity }
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Personalization State
  const [recipientName, setRecipientName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [wrappingStyle, setWrappingStyle] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Derived Values
  const categories = useMemo(() => ['All', ...new Set(products.map(p => CATEGORY_MAP[p.categoryId] || 'Other'))], [products]);
  
  const displayedProducts = useMemo(() => {
    if (activeCategory === 'All') return products;
    return products.filter(p => (CATEGORY_MAP[p.categoryId] || 'Other') === activeCategory);
  }, [products, activeCategory]);

  const totalItemsCount = Object.values(selectedItems).reduce((sum, q) => sum + q, 0);
  
  const subtotal = useMemo(() => {
    return Object.entries(selectedItems).reduce((sum, [id, qty]) => {
      const product = products.find(p => p.id === parseInt(id));
      return sum + (product ? product.price * qty : 0);
    }, 0);
  }, [selectedItems, products]);

  const total = subtotal + (boxSize?.fee || 0);

  // Handlers
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleAddItem = (product) => {
    if (totalItemsCount >= boxSize.limit) return;
    setSelectedItems(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1
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

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    const orderPayload = {
      customerId: 5,
      partnerId: 2,
      deliveryAddress,
      occasion,
      boxSize: boxSize.id,
      giftMessage,
      recipientName,
      wrappingStyle,
      items: Object.entries(selectedItems).map(([id, qty]) => ({
        productId: parseInt(id),
        quantity: qty
      }))
    };

    try {
      const res = await fetch('http://localhost:8080/api/orders/custom-box', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      if (!res.ok) throw new Error('Failed to place order');
      setSubmitSuccess(true);
    } catch (err) {
      alert('Error placing order: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Validation
  const canProceed = () => {
    if (currentStep === 1) return !!occasion;
    if (currentStep === 2) return !!boxSize;
    if (currentStep === 3) return totalItemsCount > 0;
    if (currentStep === 4) return recipientName.trim() && giftMessage.trim() && wrappingStyle && deliveryAddress.trim();
    return true;
  };

  if (submitSuccess) {
    return (
      <div className="bb-success-screen">
        <div className="bb-success-icon">🎁</div>
        <h2>Your box is being prepared!</h2>
        <p>Thank you for choosing Giftora. We're carefully assembling your personalized gift box.</p>
        <button className="bb-btn-primary" onClick={() => navigate('/')}>Return to Home</button>
      </div>
    );
  }

  return (
    <div className="bb-container">
      {/* Progress Bar */}
      <div className="bb-progress-bar">
        {['Occasion', 'Box Size', 'Pick Items', 'Personalize', 'Preview'].map((label, idx) => {
          const stepNum = idx + 1;
          return (
            <div key={stepNum} className={`bb-step-indicator ${currentStep >= stepNum ? 'active' : ''}`}>
              <div className="bb-step-circle">{stepNum}</div>
              <span className="bb-step-label">{label}</span>
            </div>
          );
        })}
      </div>

      <div className="bb-main-layout">
        <div className="bb-content-area">
          {/* Step 1 */}
          {currentStep === 1 && (
            <div className="bb-step-content slide-in">
              <h2 className="bb-step-title">What are we celebrating?</h2>
              <div className="bb-grid bb-grid-occasion">
                {OCCASIONS.map(occ => (
                  <div 
                    key={occ.id} 
                    className={`bb-card ${occasion === occ.id ? 'selected' : ''}`}
                    onClick={() => setOccasion(occ.id)}
                  >
                    <div className="bb-card-icon">{occ.icon}</div>
                    <div className="bb-card-label">{occ.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {currentStep === 2 && (
            <div className="bb-step-content slide-in">
              <h2 className="bb-step-title">Choose your box size</h2>
              <div className="bb-grid bb-grid-size">
                {BOX_SIZES.map(size => (
                  <div 
                    key={size.id} 
                    className={`bb-card bb-size-card ${boxSize?.id === size.id ? 'selected' : ''}`}
                    onClick={() => setBoxSize(size)}
                  >
                    <h3>{size.title}</h3>
                    <p className="bb-size-desc">{size.desc}</p>
                    <div className="bb-size-fee">+LKR {size.fee} box fee</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {currentStep === 3 && (
            <div className="bb-step-content slide-in">
              <div className="bb-step-header">
                <h2 className="bb-step-title">Pick your items</h2>
                <div className="bb-capacity-badge">
                  {totalItemsCount} / {boxSize.limit} Items Selected
                </div>
              </div>

              {loading && <div className="bb-spinner">Loading products...</div>}
              {error && <div className="bb-error">Error: {error}</div>}

              {!loading && !error && (
                <>
                  <div className="bb-category-tabs">
                    {categories.map(cat => (
                      <button 
                        key={cat} 
                        className={`bb-tab ${activeCategory === cat ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="bb-grid bb-grid-products">
                    {displayedProducts.map(p => {
                      const qty = selectedItems[p.id] || 0;
                      const isMaxedOut = totalItemsCount >= boxSize.limit && qty === 0;

                      return (
                        <div key={p.id} className="bb-product-card">
                          <img src={p.imageUrl} alt={p.name} className="bb-product-img" />
                          <div className="bb-product-info">
                            <h4>{p.name}</h4>
                            <div className="bb-product-price">LKR {p.price.toLocaleString()}</div>
                            
                            {qty > 0 ? (
                              <div className="bb-qty-controls">
                                <button onClick={() => handleRemoveItem(p.id)}>-</button>
                                <span>{qty}</span>
                                <button onClick={() => handleAddItem(p)} disabled={totalItemsCount >= boxSize.limit}>+</button>
                              </div>
                            ) : (
                              <button 
                                className="bb-btn-add" 
                                onClick={() => handleAddItem(p)}
                                disabled={isMaxedOut}
                              >
                                {isMaxedOut ? 'Limit Reached' : 'Add Item'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4 */}
          {currentStep === 4 && (
            <div className="bb-step-content slide-in">
              <h2 className="bb-step-title">Personalize your gift</h2>
              <div className="bb-form">
                <div className="bb-form-group">
                  <label>Recipient Name</label>
                  <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="Who is this for?" />
                </div>
                
                <div className="bb-form-group">
                  <label>Gift Message <span className="bb-char-count">{giftMessage.length}/150</span></label>
                  <textarea 
                    maxLength={150} 
                    value={giftMessage} 
                    onChange={e => setGiftMessage(e.target.value)} 
                    placeholder="Write a heartfelt message..."
                    rows={4}
                  />
                </div>

                <div className="bb-form-group">
                  <label>Wrapping Style</label>
                  <div className="bb-wrapping-options">
                    {WRAPPING_STYLES.map(style => (
                      <div 
                        key={style.id}
                        className={`bb-wrap-card ${wrappingStyle === style.id ? 'selected' : ''}`}
                        onClick={() => setWrappingStyle(style.id)}
                      >
                        <div className="bb-color-swatch" style={{ backgroundColor: style.color }}></div>
                        <span>{style.id}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bb-form-group">
                  <label>Delivery Address</label>
                  <input type="text" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} placeholder="Full delivery address" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5 */}
          {currentStep === 5 && (
            <div className="bb-step-content slide-in bb-preview-step">
              <h2 className="bb-step-title">Review your custom box</h2>
              
              <div className="bb-preview-grid">
                <div className="bb-preview-section">
                  <h3>Box Details</h3>
                  <p><strong>Occasion:</strong> {occasion}</p>
                  <p><strong>Size:</strong> {boxSize.title}</p>
                  <p><strong>Wrapping:</strong> {wrappingStyle}</p>
                  <p><strong>Deliver To:</strong> {recipientName} ({deliveryAddress})</p>
                  <div className="bb-preview-message">
                    " {giftMessage} "
                  </div>
                </div>

                <div className="bb-preview-section">
                  <h3>Selected Items</h3>
                  <div className="bb-preview-items">
                    {Object.entries(selectedItems).map(([id, qty]) => {
                      const p = products.find(prod => prod.id === parseInt(id));
                      if (!p) return null;
                      return (
                        <div key={id} className="bb-preview-item">
                          <span>{qty}x {p.name}</span>
                          <span>LKR {(p.price * qty).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="bb-preview-breakdown">
                    <div className="bb-breakdown-row">
                      <span>Items Subtotal</span>
                      <span>LKR {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="bb-breakdown-row">
                      <span>Box Fee ({boxSize.title})</span>
                      <span>LKR {boxSize.fee.toLocaleString()}</span>
                    </div>
                    <div className="bb-breakdown-row bb-total-row">
                      <span>Total</span>
                      <span>LKR {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="bb-nav-buttons">
            {currentStep > 1 ? (
              <button className="bb-btn-secondary" onClick={handleBack} disabled={submitting}>Back</button>
            ) : <div/>}

            {currentStep < 5 ? (
              <button className="bb-btn-primary" onClick={handleNext} disabled={!canProceed()}>Next Step</button>
            ) : (
              <button className="bb-btn-primary bb-btn-submit" onClick={handlePlaceOrder} disabled={submitting}>
                {submitting ? 'Processing...' : 'Place Order 🎁'}
              </button>
            )}
          </div>
        </div>

        {/* Sticky Sidebar (Steps 3-5) */}
        {currentStep >= 3 && currentStep <= 4 && (
          <div className="bb-sidebar">
            <div className="bb-sidebar-sticky">
              <h3>Box Summary</h3>
              <div className="bb-summary-stats">
                <p>Capacity: {totalItemsCount} / {boxSize.limit}</p>
                <div className="bb-summary-items">
                  {Object.entries(selectedItems).map(([id, qty]) => {
                    const p = products.find(prod => prod.id === parseInt(id));
                    return p ? <div key={id} className="bb-summary-item-tiny">{qty}x {p.name}</div> : null;
                  })}
                </div>
              </div>
              <div className="bb-summary-total">
                <span>Total Estim.</span>
                <h4>LKR {total.toLocaleString()}</h4>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoxBuilderPage;