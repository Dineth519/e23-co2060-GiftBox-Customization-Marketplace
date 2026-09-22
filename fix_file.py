import re

with open('/tmp/BoxBuilderPage.old.jsx', 'r') as f:
    content = f.read()

# 1. Add Stripe Imports and Promise
imports = """import { useCart } from '../../context/CartContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51UIPGXBkZFvVdDzSFdXK26Pho1vSKVLgw9SM6oAyXsdSfkfLW9NdH8ZyVWdmwcSxWqPqQcQrXQcVsFVocUM3J3Wv00Sf8i2Zgx');

const CheckoutForm = ({ grandTotal, onPaymentSuccess, onBack, submitting }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
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
          return_url: `${window.location.origin}/orders`,
          setup_future_usage: saveCard ? 'off_session' : undefined
        },
        redirect: 'if_required'
      });
      if (error) {
        setErrorMsg(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onPaymentSuccess();
      }
    } catch (err) {
      setErrorMsg('Payment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form id="bb-checkout-form" onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
      <PaymentElement options={{ wallets: { link: 'never' } }} />
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input 
          type="checkbox" 
          id="bbSaveCardOption" 
          checked={saveCard} 
          onChange={(e) => setSaveCard(e.target.checked)} 
        />
        <label htmlFor="bbSaveCardOption" style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
          Save card details securely for future purchases
        </label>
      </div>
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
"""
content = content.replace("import { useCart } from '../../context/CartContext';", imports)

# 2. Add clientSecret state and useEffect for Step 5
states = """  const [toastMessage, setToastMessage] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [savedDrafts, setSavedDrafts] = useState([]);
  
  useEffect(() => {
    if (activeStep === 5) {
      setClientSecret(null);
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
"""
content = content.replace("const [toastMessage, setToastMessage] = useState(null);", states)

# 3. Add Draft methods
draft_methods = """  // Restore Draft on mount
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
"""
# Replace empty save draft to the new one
content = re.sub(r'const handleSaveDraft = \(\) => \{[^}]+\};\s*triggerToast[^}]+\};\s*\}', draft_methods, content)
content = re.sub(r'const handleSaveDraft = \(\) => \{[^}]+\};\s*triggerToast\([^\)]+\);\s*\};', draft_methods, content)
content = re.sub(r'const handleSaveDraft = \(\) => \{[^}]+\}\)\);\s*triggerToast\([^\)]+\);\s*\};', draft_methods, content)

# 4. View Saved Drafts Button
draft_btn = """<h1 className="bb-hero-title">
            Gift Box <span className="bb-hero-accent">Craft Studio</span>
          </h1>
          <button className="bb-btn-drafts-top" onClick={() => setShowDraftsModal(true)}>
            📋 View Saved Drafts
          </button>"""
content = content.replace("""<h1 className="bb-hero-title">
            Gift Box <span className="bb-hero-accent">Craft Studio</span>
          </h1>""", draft_btn)

# 5. Lock navigation and add Step 5 to progress bar
nav_progress = """{[
          { step: 1, label: ' Framework' },
          { step: 2, label: ' Aesthetics' },
          { step: 3, label: ' Curate Items' },
          { step: 4, label: ' Personalization' },
          { step: 5, label: ' Checkout' }
        ].map((item) => (
          <button
            key={item.step}
            aria-label={`Step ${item.step}: ${item.label.trim()}`}
            aria-current={activeStep === item.step ? 'step' : undefined}
            className={`bb-step-btn ${activeStep === item.step ? 'active' : ''} ${activeStep > item.step ? 'completed' : ''}`}
            style={{ cursor: 'default' }}
          >"""
content = re.sub(r'\{\[\s*\{\s*step:\s*1[^\}]+\},\s*\{\s*step:\s*2[^\}]+\},\s*\{\s*step:\s*3[^\}]+\},\s*\{\s*step:\s*4[^\}]+\}\s*\]\.map\(\(item\) => \(\s*<button[^>]+onClick=\{[^}]+\}[^>]*>', nav_progress, content)

# 6. Update step buttons (Step 1, 2, 3)
content = content.replace('<button className="bb-btn-forward" onClick={() => setActiveStep(2)}>', 
'<div className="bb-step-nav-row" style={{ marginTop: "32px" }}><button className="bb-btn-forward" onClick={() => setActiveStep(2)}>Next: Wrap & Ribbon Styling →</button></div>')

content = content.replace('<div className="bb-step-nav-row">\n                <button className="bb-btn-secondary" onClick={() => setActiveStep(1)}>← Back</button>', 
'<div className="bb-step-nav-row" style={{ marginTop: "32px" }}>\n                <button className="bb-btn-back" onClick={() => setActiveStep(1)}><span>←</span><span>Back</span></button>')

content = content.replace('<div className="bb-step-nav-row" style={{ marginTop: \'32px\' }}>\n                <button className="bb-btn-secondary" onClick={() => setActiveStep(2)}>← Back</button>', 
'<div className="bb-step-nav-row" style={{ marginTop: \'32px\' }}>\n                <button className="bb-btn-back" onClick={() => setActiveStep(2)}><span>←</span><span>Back</span></button>')


# 7. Update Step 4 Button and Action
step4_btns = """<div className="bb-step-nav-row" style={{ marginTop: '32px' }}>
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
              </div>"""
content = re.sub(r'<div className="bb-step-nav-row" style=\{\{ marginTop: \'32px\' \}\}>\s*<button className="bb-btn-secondary" onClick=\{\(\) => setActiveStep\(3\)\}>← Back</button>\s*<button\s*className="bb-btn-secondary"\s*onClick=\{handleSaveDraft\}\s*style=\{\{ marginRight: \'16px\' \}\}\s*>\s*Save Draft\s*</button>\s*<button\s*className="bb-btn-submit"\s*disabled=\{submitting\}\s*onClick=\{handlePlaceOrder\}\s*>\s*\{submitting \? \'Processing Submission\.\.\.\' : `Complete Order • LKR \$\{grandTotal.toLocaleString\(\)\}`\}\s*</button>\s*</div>', step4_btns, content)


# 8. Add Step 5 JSX
step5 = """          {/* STEP 5: CHECKOUT & DISPATCH */}
          {activeStep === 5 && (
            <div className="bb-step-view">
              <div className="bb-step-header">
                <h3>Checkout & Dispatch</h3>
                <p>Provide consignment address and secure payment details.</p>
              </div>

              <div className="bb-form-layout">
                <div className="bb-field">
                  <label>Delivery Destination Address *</label>
                  <input
                    type="text"
                    placeholder="Street, City"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
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
          )}"""
content = content.replace("</main>", step5 + "\n        </main>")

# 9. Add Drafts Modal at the bottom
drafts_modal = """      {/* DRAFTS MODAL */}
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
  );"""
content = content.replace("</div>\n  );\n};", drafts_modal + "\n};\n")

with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'w') as f:
    f.write(content)
