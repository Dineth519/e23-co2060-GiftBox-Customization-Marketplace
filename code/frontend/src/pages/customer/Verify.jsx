import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import './Verify.css';

const Verify = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const navigate = useNavigate();

  // Handle email verification submission
  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!email || !code) {
      setMessage('Please fill in all fields');
      setMessageType('error');
      return;
    }

    if (code.length !== 6 || isNaN(code)) {
      setMessage('Verification code must be 6 digits');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Email verified successfully! Redirecting to login...');
        setMessageType('success');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Verification failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Error connecting to server. Please try again.');
      setMessageType('error');
      console.error('Verification error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle resend verification code
  const handleResendCode = async () => {
    if (!email) {
      setMessage('Please enter your email first');
      setMessageType('error');
      return;
    }

    setResendDisabled(true);
    setResendCountdown(60);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Verification code sent to your email!');
        setMessageType('info');
      } else {
        setMessage(data.message || 'Failed to resend code');
        setMessageType('error');
        setResendDisabled(false);
      }
    } catch (error) {
      setMessage('Error sending code. Please try again.');
      setMessageType('error');
      setResendDisabled(false);
      console.error('Resend error:', error);
    }
  };

  // Countdown timer for resend button
  React.useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendCountdown, resendDisabled]);

  // Handle back to login
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="verify-page">
      {/* Logo */}
      <div className="verify-logo">
        <img src="/logo.png" alt="Giftora Logo" />
      </div>

      {/* Verification Card */}
      <div className="verify-container">
        <h2>Verify Your Email</h2>
        <p>Enter the 6-digit code we sent to your email address</p>

        {/* Message Display */}
        {message && (
          <div className={`verify-message ${messageType}`}>
            {message}
          </div>
        )}

        {/* Verification Form */}
        <form onSubmit={handleVerify} className="verify-form">
          {/* Email Input */}
          <div className="verify-input-row verify-email-input">
            <div className="verify-icon">
              <FaEnvelope />
            </div>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Verification Code Input */}
          <div className="verify-input-row verify-code-input">
            <div className="verify-icon">
              <FaLock />
            </div>
            <input
              type="text"
              placeholder="6-digit code"
              value={code}
              onChange={(e) => {
                // Only allow digits and limit to 6 characters
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
              }}
              maxLength="6"
              required
              disabled={loading}
              inputMode="numeric"
            />
          </div>

          <div className="verify-code-hint">
            {code.length}/6 digits
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="verify-submit-btn"
            disabled={loading || code.length !== 6}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Resend Code Section */}
        <div className="verify-resend-section">
          <p className="verify-resend-text">Didn't receive a code?</p>
          <button
            type="button"
            className="verify-resend-btn"
            onClick={handleResendCode}
            disabled={resendDisabled || loading}
          >
            {resendDisabled ? (
              <span className="verify-countdown">
                Resend in {resendCountdown}s
              </span>
            ) : (
              'Resend Code'
            )}
          </button>
        </div>

        {/* Back to Login Link */}
        <div className="verify-back-link">
          <p>
            Remember your password?{' '}
            <a onClick={handleBackToLogin}>Back to Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;