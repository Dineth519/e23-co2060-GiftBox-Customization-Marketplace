import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner, FaStore, FaUser, FaEnvelope, FaPhone, FaLock, FaMapMarkerAlt, FaBoxOpen, FaFileAlt, FaCheckCircle } from 'react-icons/fa';
import './VendorRegistration.css';

// ============================================================================
// STEPS CONFIG
// ============================================================================
const STEPS = [
  { id: 1, label: 'Account',  icon: <FaUser /> },
  { id: 2, label: 'Business', icon: <FaStore /> },
  { id: 3, label: 'Products', icon: <FaBoxOpen /> },
  { id: 4, label: 'Review',   icon: <FaFileAlt /> },
];

const BUSINESS_CATEGORIES = [
  'Artisan Food & Bakery', 'Chocolates & Confectionery', 'Flowers & Botanicals',
  'Candles & Aromatherapy', 'Handmade Crafts & Art', 'Jewellery & Accessories',
  'Skincare & Wellness', 'Stationery & Books', 'Toys & Games', 'Home Decor',
  'Tea & Coffee', 'Fashion & Apparel', 'Photography & Prints', 'Other',
];

const DISTRICTS = [
  'Colombo','Gampaha','Kalutara','Kandy','Matale','Nuwara Eliya',
  'Galle','Matara','Hambantota','Jaffna','Kilinochchi','Mannar',
  'Vavuniya','Mullaitivu','Batticaloa','Ampara','Trincomalee',
  'Kurunegala','Puttalam','Anuradhapura','Polonnaruwa','Badulla',
  'Monaragala','Ratnapura','Kegalle',
];

// ============================================================================
// VENDOR REGISTER COMPONENT
// ============================================================================
const VendorRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    // Step 1 - Account
    fullName: '',
    email: '',
    phone: '',
    password: '',
    // Step 2 - Business
    businessName: '',
    businessCategory: '',
    businessRegNo: '',
    businessAddress: '',
    district: '',
    website: '',
    instagram: '',
    // Step 3 - Products
    productDescription: '',
    avgPrice: '',
    monthlyCapacity: '',
    hasPackaging: '',
    agreeTerms: false,
  });

  const set = (field, value) => {
    setForm(p => ({ ...p, [field]: value }));
    if (errors[field]) setErrors(p => ({ ...p, [field]: '' }));
  };

  // ── Validation per step ──────────────────────────────────────────────────
  const validate = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.fullName.trim()) e.fullName = 'Full name is required';
      if (!form.email.trim()) e.email = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';
      if (!form.phone.trim()) e.phone = 'Phone is required';
      else if (!/^(?:\+94|0)[0-9]{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid Sri Lankan number';
      if (!form.password) e.password = 'Password is required';
      else if (form.password.length < 8) e.password = 'At least 8 characters required';
    }
    if (s === 2) {
      if (!form.businessName.trim()) e.businessName = 'Business name is required';
      if (!form.businessCategory) e.businessCategory = 'Please select a category';
      if (!form.businessAddress.trim()) e.businessAddress = 'Address is required';
      if (!form.district) e.district = 'Please select a district';
    }
    if (s === 3) {
      if (!form.productDescription.trim()) e.productDescription = 'Please describe your products';
      if (!form.avgPrice.trim()) e.avgPrice = 'Average price is required';
      if (!form.monthlyCapacity.trim()) e.monthlyCapacity = 'Monthly capacity is required';
      if (!form.hasPackaging) e.hasPackaging = 'Please select an option';
      if (!form.agreeTerms) e.agreeTerms = 'You must agree to the terms';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate(step)) setStep(s => s + 1); };
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // TODO: connect to backend API
      await new Promise(r => setTimeout(r, 1500));
      setSubmitted(true);
    } catch {
      setErrors({ general: 'Submission failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="vr-page">
      <div className="vr-bg-orb vr-orb1" /><div className="vr-bg-orb vr-orb2" />
      <div className="vr-success-card">
        <div className="vr-success-icon"><FaCheckCircle /></div>
        <h2>Application Submitted!</h2>
        <p>Thank you, <strong>{form.businessName}</strong>! Our team will review your application and get back to you within <strong>2–3 business days</strong> at <strong>{form.email}</strong>.</p>
        <button className="vr-btn-primary" onClick={() => navigate('/')}>Back to Home</button>
      </div>
    </div>
  );

  return (
    <div className="vr-page">
      {/* Background orbs */}
      <div className="vr-bg-orb vr-orb1" />
      <div className="vr-bg-orb vr-orb2" />
      <div className="vr-bg-orb vr-orb3" />

      {/* Logo */}
      <div className="vr-logo" onClick={() => navigate('/')}>
        <img src="/assets/login/logo.png" alt="Giftora" onError={e => { e.target.style.display='none'; }} />
        <span className="vr-logo-text">Giftora</span>
      </div>

      <div className="vr-container">
        {/* Header */}
        <div className="vr-header">
          <div className="vr-badge">🏪 Become a Partner</div>
          <h1>Join Giftora's <span className="vr-accent">Vendor Network</span></h1>
          <p>Reach thousands of buyers island-wide. Zero listing fees. We handle the packaging.</p>
        </div>

        {/* Step indicator */}
        <div className="vr-steps">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className={`vr-step ${step === s.id ? 'active' : ''} ${step > s.id ? 'done' : ''}`}>
                <div className="vr-step-circle">
                  {step > s.id ? '✓' : s.icon}
                </div>
                <span className="vr-step-label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`vr-step-line ${step > s.id ? 'done' : ''}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Card */}
        <div className="vr-card">
          {errors.general && <div className="vr-error-box">{errors.general}</div>}

          {/* ── STEP 1: Account ── */}
          {step === 1 && (
            <div className="vr-form-section">
              <h3 className="vr-section-title"><FaUser /> Personal Account Details</h3>
              <p className="vr-section-sub">This will be your login to the Seller Dashboard.</p>

              <div className="vr-grid-2">
                <div className="vr-field">
                  <label>Full Name *</label>
                  <div className="vr-input-row">
                    <FaUser className="vr-input-icon" />
                    <input value={form.fullName} onChange={e => set('fullName', e.target.value)} placeholder="Amal Perera" />
                  </div>
                  {errors.fullName && <p className="vr-err">{errors.fullName}</p>}
                </div>

                <div className="vr-field">
                  <label>Email Address *</label>
                  <div className="vr-input-row">
                    <FaEnvelope className="vr-input-icon" />
                    <input value={form.email} onChange={e => set('email', e.target.value)} type="email" placeholder="you@business.com" />
                  </div>
                  {errors.email && <p className="vr-err">{errors.email}</p>}
                </div>

                <div className="vr-field">
                  <label>Phone Number *</label>
                  <div className="vr-input-row">
                    <FaPhone className="vr-input-icon" />
                    <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0771234567" />
                  </div>
                  {errors.phone && <p className="vr-err">{errors.phone}</p>}
                </div>

                <div className="vr-field">
                  <label>Password *</label>
                  <div className="vr-input-row">
                    <FaLock className="vr-input-icon" />
                    <input value={form.password} onChange={e => set('password', e.target.value)} type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" />
                    <button type="button" className="vr-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  {errors.password && <p className="vr-err">{errors.password}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Business ── */}
          {step === 2 && (
            <div className="vr-form-section">
              <h3 className="vr-section-title"><FaStore /> Business Information</h3>
              <p className="vr-section-sub">Tell us about your brand so we can best showcase your products.</p>

              <div className="vr-grid-2">
                <div className="vr-field">
                  <label>Business / Shop Name *</label>
                  <div className="vr-input-row">
                    <FaStore className="vr-input-icon" />
                    <input value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Sweet Delights LK" />
                  </div>
                  {errors.businessName && <p className="vr-err">{errors.businessName}</p>}
                </div>

                <div className="vr-field">
                  <label>Business Category *</label>
                  <div className="vr-input-row">
                    <FaBoxOpen className="vr-input-icon" />
                    <select value={form.businessCategory} onChange={e => set('businessCategory', e.target.value)}
                      className={!form.businessCategory ? 'placeholder' : ''}>
                      <option value="">Select a category</option>
                      {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  {errors.businessCategory && <p className="vr-err">{errors.businessCategory}</p>}
                </div>

                <div className="vr-field">
                  <label>Business Reg. No. <span className="vr-optional">(Optional)</span></label>
                  <div className="vr-input-row">
                    <FaFileAlt className="vr-input-icon" />
                    <input value={form.businessRegNo} onChange={e => set('businessRegNo', e.target.value)} placeholder="PV 12345 (if registered)" />
                  </div>
                </div>

                <div className="vr-field">
                  <label>District *</label>
                  <div className="vr-input-row">
                    <FaMapMarkerAlt className="vr-input-icon" />
                    <select value={form.district} onChange={e => set('district', e.target.value)}
                      className={!form.district ? 'placeholder' : ''}>
                      <option value="">Select district</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  {errors.district && <p className="vr-err">{errors.district}</p>}
                </div>

                <div className="vr-field vr-full-width">
                  <label>Business Address *</label>
                  <div className="vr-input-row">
                    <FaMapMarkerAlt className="vr-input-icon" />
                    <input value={form.businessAddress} onChange={e => set('businessAddress', e.target.value)} placeholder="No. 45, Galle Road, Colombo 03" />
                  </div>
                  {errors.businessAddress && <p className="vr-err">{errors.businessAddress}</p>}
                </div>

                <div className="vr-field">
                  <label>Website <span className="vr-optional">(Optional)</span></label>
                  <div className="vr-input-row">
                    <span className="vr-input-icon vr-text-icon">🌐</span>
                    <input value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourbusiness.lk" />
                  </div>
                </div>

                <div className="vr-field">
                  <label>Instagram Handle <span className="vr-optional">(Optional)</span></label>
                  <div className="vr-input-row">
                    <span className="vr-input-icon vr-text-icon">📸</span>
                    <input value={form.instagram} onChange={e => set('instagram', e.target.value)} placeholder="@yourbrand" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Products ── */}
          {step === 3 && (
            <div className="vr-form-section">
              <h3 className="vr-section-title"><FaBoxOpen /> Product Details</h3>
              <p className="vr-section-sub">Help us understand what you sell so we can match you with the right gift boxes.</p>

              <div className="vr-grid-1">
                <div className="vr-field">
                  <label>Describe Your Products *</label>
                  <textarea
                    value={form.productDescription}
                    onChange={e => set('productDescription', e.target.value)}
                    placeholder="E.g. We make handmade dark chocolate truffles, chocolate bark, and seasonal gift sets using locally sourced cacao..."
                    rows={4}
                    className="vr-textarea"
                  />
                  {errors.productDescription && <p className="vr-err">{errors.productDescription}</p>}
                </div>
              </div>

              <div className="vr-grid-2">
                <div className="vr-field">
                  <label>Average Product Price (LKR) *</label>
                  <div className="vr-input-row">
                    <span className="vr-input-icon vr-text-icon">₨</span>
                    <input value={form.avgPrice} onChange={e => set('avgPrice', e.target.value)} placeholder="e.g. 1500" type="number" min="0" />
                  </div>
                  {errors.avgPrice && <p className="vr-err">{errors.avgPrice}</p>}
                </div>

                <div className="vr-field">
                  <label>Monthly Supply Capacity (units) *</label>
                  <div className="vr-input-row">
                    <FaBoxOpen className="vr-input-icon" />
                    <input value={form.monthlyCapacity} onChange={e => set('monthlyCapacity', e.target.value)} placeholder="e.g. 200" type="number" min="1" />
                  </div>
                  {errors.monthlyCapacity && <p className="vr-err">{errors.monthlyCapacity}</p>}
                </div>

                <div className="vr-field vr-full-width">
                  <label>Do your products come with individual packaging? *</label>
                  <div className="vr-radio-group">
                    {['Yes, fully packaged', 'Partially packaged', 'No packaging (raw items)'].map(opt => (
                      <label key={opt} className={`vr-radio-option ${form.hasPackaging === opt ? 'selected' : ''}`}>
                        <input type="radio" name="hasPackaging" value={opt} checked={form.hasPackaging === opt} onChange={e => set('hasPackaging', e.target.value)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                  {errors.hasPackaging && <p className="vr-err">{errors.hasPackaging}</p>}
                </div>

                <div className="vr-field vr-full-width">
                  <label className={`vr-checkbox-label ${form.agreeTerms ? 'checked' : ''}`}>
                    <input type="checkbox" checked={form.agreeTerms} onChange={e => set('agreeTerms', e.target.checked)} />
                    <span>I agree to Giftora's <span className="vr-link">Vendor Terms & Conditions</span> and <span className="vr-link">Partner Agreement</span></span>
                  </label>
                  {errors.agreeTerms && <p className="vr-err">{errors.agreeTerms}</p>}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review ── */}
          {step === 4 && (
            <div className="vr-form-section">
              <h3 className="vr-section-title"><FaFileAlt /> Review Your Application</h3>
              <p className="vr-section-sub">Please check all details before submitting.</p>

              <div className="vr-review-grid">
                <div className="vr-review-section">
                  <h4>👤 Personal Details</h4>
                  <div className="vr-review-row"><span>Name</span><strong>{form.fullName}</strong></div>
                  <div className="vr-review-row"><span>Email</span><strong>{form.email}</strong></div>
                  <div className="vr-review-row"><span>Phone</span><strong>{form.phone}</strong></div>
                </div>

                <div className="vr-review-section">
                  <h4>🏪 Business Details</h4>
                  <div className="vr-review-row"><span>Business</span><strong>{form.businessName}</strong></div>
                  <div className="vr-review-row"><span>Category</span><strong>{form.businessCategory}</strong></div>
                  <div className="vr-review-row"><span>District</span><strong>{form.district}</strong></div>
                  <div className="vr-review-row"><span>Address</span><strong>{form.businessAddress}</strong></div>
                  {form.website && <div className="vr-review-row"><span>Website</span><strong>{form.website}</strong></div>}
                </div>

                <div className="vr-review-section">
                  <h4>📦 Product Details</h4>
                  <div className="vr-review-row"><span>Avg. Price</span><strong>LKR {parseInt(form.avgPrice || 0).toLocaleString()}</strong></div>
                  <div className="vr-review-row"><span>Capacity</span><strong>{form.monthlyCapacity} units/month</strong></div>
                  <div className="vr-review-row"><span>Packaging</span><strong>{form.hasPackaging}</strong></div>
                </div>
              </div>

              <div className="vr-review-note">
                🎉 Our team will review your application and contact you at <strong>{form.email}</strong> within 2–3 business days.
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="vr-nav-btns">
            {step > 1 && (
              <button className="vr-btn-secondary" onClick={back} disabled={loading}>← Back</button>
            )}
            {step < 4 && (
              <button className="vr-btn-primary" onClick={next}>Continue →</button>
            )}
            {step === 4 && (
              <button className="vr-btn-primary vr-btn-submit" onClick={handleSubmit} disabled={loading}>
                {loading ? <><FaSpinner className="vr-spinner" /> Submitting...</> : '🚀 Submit Application'}
              </button>
            )}
          </div>
        </div>

        {/* Already have account */}
        <p className="vr-footer-text">
          Already a vendor? <span className="vr-link" onClick={() => navigate('/login')}>Sign in here</span>
        </p>
      </div>
    </div>
  );
};

export default VendorRegistration;
