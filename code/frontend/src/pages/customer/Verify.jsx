import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import AuthLayout from '../auth/AuthLayout';
import './Verify.css';

const Verify = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success', 'error', 'info'
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  // Get email from location state or session storage
  const email = location.state?.email || sessionStorage.getItem('verifyEmail');

  useEffect(() => {
    if (!email) {
      navigate('/login'); // If no email context, send back to login
    }
  }, [email, navigate]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    // Take only the last character if multiple are entered (e.g., autocomplete)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
    if (!pasteData.length) return;
    
    const newOtp = [...otp];
    pasteData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    const nextIndex = Math.min(pasteData.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length !== 6) {
      setMessage('Please enter all 6 digits');
      setMessageType('error');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Email verified successfully! Redirecting to login...');
        setMessageType('success');
        sessionStorage.removeItem('verifyEmail');
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

  const handleResendCode = async () => {
    setResendDisabled(true);
    setResendCountdown(60);
    setMessage('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/auth/resend-code?email=${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Verification code sent to your email!');
        setMessageType('info');
      } else {
        setMessage(data.message || 'Failed to resend code');
        setMessageType('error');
        setResendDisabled(false);
        setResendCountdown(0);
      }
    } catch (error) {
      setMessage('Error sending code. Please try again.');
      setMessageType('error');
      setResendDisabled(false);
      setResendCountdown(0);
    }
  };

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [resendCountdown, resendDisabled]);

  if (!email) return null; // Wait for redirect if no email

  return (
    <AuthLayout>
      <div className="login-card-front" style={{marginTop: '20px'}}>
        <span className="auth-kicker">Security</span>
        <h2>Verify Your Email</h2>
        <p className="login-sub">
          We've sent a 6-digit code to <strong>{email}</strong>.<br />
          Enter it below to confirm your account.
        </p>

        <form onSubmit={handleVerify} className="otp-form">
          {message && (
            <p className={`login-error login-general-error ${messageType === 'success' ? 'success' : ''}`} style={{backgroundColor: messageType==='success'?'rgba(46, 204, 113, 0.1)':'', borderColor: messageType==='success'?'rgba(46, 204, 113, 0.2)':'', color: messageType==='success'?'#2ecc71':''}}>
              {message}
            </p>
          )}

          <div className="otp-container">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onPaste={handlePaste}
                disabled={loading}
                className="otp-input"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={loading || otp.join('').length !== 6}
            style={{marginTop: '32px'}}
          >
            {loading ? <><FaSpinner className="spinner-icon" /> Verifying...</> : 'Verify Email'}
          </button>
        </form>

        <p className="login-toggle-text" style={{marginTop: '32px'}}>
          Didn't receive a code?{' '}
          <button 
            type="button" 
            className="login-toggle-link" 
            onClick={handleResendCode} 
            disabled={resendDisabled || loading}
          >
            {resendDisabled ? `Resend in ${resendCountdown}s` : 'Resend Code'}
          </button>
        </p>
        
        <p className="login-toggle-text">
          Remember your password?{' '}
          <button 
            type="button" 
            className="login-toggle-link" 
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Verify;
