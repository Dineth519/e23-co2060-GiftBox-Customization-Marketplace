import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VendorRegistration.css';

const VendorRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    businessRegNumber: '', 
    category: 'General',          
    address: '',           
    city: '',              
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

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
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || '';
      const response = await fetch(`${apiUrl}/api/partners/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: formData.shopName,
          ownerName: formData.ownerName,
          email: formData.email,
          phone: formData.phone,
          businessRegNumber: formData.businessRegNumber,
          category: formData.category,
          address: formData.address,
          city: formData.city,
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="giftora-auth-page">
      <div className="giftora-vendor-card">
        {submitted ? (
          <div className="vendor-success-view">
            <div className="success-icon">🎉</div>
            <h2>Application Submitted!</h2>
            <p className="success-desc">
              Thank you for applying to join the Giftora marketplace. Your business profile (BRN: <strong>{formData.businessRegNumber}</strong>) is currently pending admin verification.
            </p>
            <p className="success-sub">
              We've registered your partner account under <strong>{formData.email}</strong>. Once our administrators approve your application, you will receive a confirmation email and will be able to log in to access your dashboard.
            </p>
            <div className="success-actions">
              <button className="giftora-btn-primary" onClick={() => navigate('/login')}>
                Go to Sign In
              </button>
              <button className="giftora-btn-secondary" onClick={() => navigate('/')}>
                Back to Home Page
              </button>
            </div>
          </div>
        ) : (
          <>
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
              Already a vendor? <span className="auth-toggle-link" onClick={() => navigate('/login')}>Sign in here</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default VendorRegistration;