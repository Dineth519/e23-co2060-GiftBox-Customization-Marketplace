import React, { useState } from 'react';
import './VendorRegistration.css';

const VendorRegistration = () => {
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessRegNumber: '', 
    category: '',          
    address: '',           
    city: '',              
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    // Add your API call here
    setTimeout(() => {
      setLoading(false);
      console.log('Vendor Registered:', formData);
    }, 1500);
  };

  return (
    <div className="giftora-auth-page">
      <div className="giftora-vendor-card">
        <h2>Become a Vendor</h2>
        <p className="auth-sub">Join our marketplace and reach thousands of customers island-wide.</p>

        {error && (
          <div className="auth-error-box">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="vendor-form-grid">
            
            {/* --- Basic Info --- */}
            <div className="auth-input-row">
              <input
                type="text"
                name="shopName"
                placeholder="Shop / Store Name"
                value={formData.shopName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="auth-input-row">
              <input
                type="text"
                name="ownerName"
                placeholder="Owner Full Name"
                value={formData.ownerName}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="auth-input-row">
              <input
                type="email"
                name="email"
                placeholder="Business Email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="auth-input-row">
              <input
                type="tel"
                name="phone"
                placeholder="Business Phone Number"
                value={formData.phone}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* --- Business Details --- */}
            <div className="auth-input-row">
              <input
                type="text"
                name="businessRegNumber"
                placeholder="Business Registration Number (BRN)"
                value={formData.businessRegNumber}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="auth-input-row">
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange}
                disabled={loading}
                required
                className={formData.category === '' ? 'placeholder-active' : ''}
              >
                <option value="" disabled hidden>Select Business Category</option>
                <option value="flowers">Flowers & Plants</option>
                <option value="sweets">Sweets & Bakery</option>
                <option value="jewelry">Jewelry & Accessories</option>
                <option value="clothing">Clothing & Apparel</option>
                <option value="electronics">Electronics</option>
                <option value="custom_gifts">Custom / Handcrafted Gifts</option>
              </select>
            </div>

            <div className="auth-input-row">
              <input
                type="text"
                name="address"
                placeholder="Business Street Address"
                value={formData.address}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="auth-input-row">
              <input
                type="text"
                name="city"
                placeholder="City / District"
                value={formData.city}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            {/* --- Security --- */}
            <div className="auth-input-row">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 'bold' }}
              >
                {showPassword ? 'HIDE' : 'SHOW'}
              </button>
            </div>

            <div className="auth-input-row">
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="giftora-btn-primary" 
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-icon">↻</span>
            ) : (
              <>Submit Application &rarr;</>
            )}
          </button>
        </form>

        <p className="auth-toggle-text">
          Already a vendor? <span className="auth-toggle-link">Sign in here</span>
        </p>
      </div>
    </div>
  );
};

export default VendorRegistration;