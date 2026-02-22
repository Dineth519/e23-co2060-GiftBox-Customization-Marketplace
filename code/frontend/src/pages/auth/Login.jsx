import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

// Assets and resources
import { assets } from '../../assets/login/assets';

// Stylesheet
import './Login.css';

// ============================================================================
// LOGIN & SIGNUP COMPONENT (Main Component)
// ============================================================================
const Login = () => {
  // ── State Management ────────────────────────────────────────────────────
  const [state, setState] = useState('Login');
  const navigate = useNavigate();

  // Form field states for login and registration
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form validation errors
  const [errors, setErrors] = useState({});

  // ── Toggle between Login and Sign Up ────────────────────────────────────
  const toggleState = () => {
    setState(state === 'Sign Up' ? 'Login' : 'Sign Up');
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setErrors({});
  };

  // ── Form Validation ─────────────────────────────────────────────────────
  
  // Validate login form
  const validateLoginForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate signup form
  const validateSignupForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!username.trim()) newErrors.username = 'Username is required';
    if (username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Form Submit Handler ─────────────────────────────────────────────────
  const onSubmitHandler = async (e) => {
    e.preventDefault();

    // Validate form before submission
    if (state === 'Sign Up') {
      if (!validateSignupForm()) {
        return;
      }
    } else {
      if (!validateLoginForm()) {
        return;
      }
    }

    setLoading(true);

    try {
      if (state === 'Sign Up') {
        // ── REGISTRATION FLOW ───────────────────────────────────────────
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, email, password }),
        });

        const data = await response.json();

        if (data.success === true) {
          // Store email in sessionStorage for verification page
          sessionStorage.setItem('verifyEmail', email);

          // Add delay for smooth transition
          setTimeout(() => {
            navigate('/verify', { state: { email: email } });
          }, 500);
        } else {
          // Handle specific error messages from backend
          const errorMessage = data.message || 'Registration failed. Please try again.';

          // Set field-specific errors if applicable
          if (errorMessage.toLowerCase().includes('email')) {
            setErrors(prev => ({
              ...prev,
              email: errorMessage
            }));
          } else if (errorMessage.toLowerCase().includes('username')) {
            setErrors(prev => ({
              ...prev,
              username: errorMessage
            }));
          } else {
            // For other errors, show general error
            setErrors(prev => ({
              ...prev,
              general: errorMessage
            }));
          }
        }
      } else {
        // ── LOGIN FLOW ──────────────────────────────────────────────────
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success === true) {
          // Get user role from server response
          const userRole = data.role;
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('username', username);
          localStorage.setItem('token', data.token); // Store JWT token if provided
          localStorage.setItem('userId', data.userId); // Store user ID if provided

          // Route user to appropriate dashboard based on role
          if (userRole === 'ADMIN') {
            navigate('/admin');
          } else if (userRole === 'SELLER' || userRole === 'PARTNER') {
            navigate('/seller');
          } else if (userRole === 'CUSTOMER') {
            navigate('/home');
          } else if (userRole === 'ASSEMBLER') {
            navigate('/assembler-dashboard');
          } else {
            navigate('/');
          }
        } else {
          const errorMessage = data.message || 'Login failed. Please check your credentials.';

          // Reset password field for security
          setPassword('');

          // Set field-specific errors
          if (errorMessage.toLowerCase().includes('username')) {
            setErrors(prev => ({ ...prev, username: errorMessage }));
          } else if (errorMessage.toLowerCase().includes('password')) {
            setErrors(prev => ({ ...prev, password: errorMessage }));
          } else {
            setErrors(prev => ({ ...prev, general: errorMessage }));
          }
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error.message === 'Failed to fetch'
        ? 'Could not connect to server. Please check your internet connection.'
        : 'Something went wrong. Please try again.';
      
      setErrors(prev => ({
        ...prev,
        general: errorMessage
      }));
    } finally {
      setLoading(false);
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="login-page">
      {/* Logo */}
      <img src={assets.logo} alt="Giftora Logo" className="login-logo" />

      {/* 3D Flip Card */}
      <div className="login-card-wrapper">
        <div className={`login-card-inner ${state === 'Sign Up' ? 'flipped' : ''}`}>

          {/* ── LOGIN FORM (Front of card) ─────────────────────────────── */}
          <div className="login-card-front">
            <h2>Welcome Back</h2>
            <p className="login-sub">Login to your account</p>
            <form onSubmit={onSubmitHandler}>
              {/* General Error */}
              {errors.general && <p className="login-error login-general-error">{errors.general}</p>}

              {/* Username Input */}
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                  }}
                  value={username}
                  type="text"
                  placeholder="Username"
                  disabled={loading}
                  required
                />
              </div>
              {errors.username && <p className="login-error">{errors.username}</p>}

              {/* Password Input */}
              <div className="login-input-row">
                <img src={assets.lock_icon} alt="" />
                <input
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  value={password}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <img src={showPassword ? assets.Open_Eye : assets.Close_Eye} alt="Toggle Visibility" />
                </button>
              </div>
              {errors.password && <p className="login-error">{errors.password}</p>}

              {/* Forgot Password Link */}
              <p className="login-forgot" onClick={() => navigate('/email-verify')}>
                Forgot Password?
              </p>

              {/* Submit Button */}
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </form>

            {/* Toggle to Sign Up */}
            <p className="login-toggle-text">
              Don't have an account?{' '}
              <span className="login-toggle-link" onClick={toggleState}>
                Sign Up
              </span>
            </p>
          </div>

          {/* ── SIGNUP FORM (Back of card) ─────────────────────────────── */}
          <div className="login-card-back">
            <h2>Create Account</h2>
            <p className="login-sub">Join us to customize your gifts</p>
            <form onSubmit={onSubmitHandler}>
              {/* General Error */}
              {errors.general && <p className="login-error login-general-error">{errors.general}</p>}

              {/* Full Name Input */}
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
                  }}
                  value={name}
                  type="text"
                  placeholder="Full Name"
                  disabled={loading}
                  required
                />
              </div>
              {errors.name && <p className="login-error">{errors.name}</p>}

              {/* Username Input */}
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
                  }}
                  value={username}
                  type="text"
                  placeholder="Choose a Username"
                  disabled={loading}
                  required
                />
              </div>
              {errors.username && <p className="login-error">{errors.username}</p>}

              {/* Email Input */}
              <div className="login-input-row">
                <img src={assets.mail_icon} alt="" />
                <input
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  value={email}
                  type="email"
                  placeholder="Email"
                  disabled={loading}
                  required
                />
              </div>
              {errors.email && <p className="login-error">{errors.email}</p>}

              {/* Password Input */}
              <div className="login-input-row">
                <img src={assets.lock_icon} alt="" />
                <input
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  value={password}
                  type="password"
                  placeholder="Password"
                  disabled={loading}
                  required
                />
              </div>
              {errors.password && <p className="login-error">{errors.password}</p>}

              {/* Submit Button */}
              <button type="submit" className="login-submit-btn" disabled={loading}>
                {loading ? (
                  <>
                    <FaSpinner className="spinner-icon" /> Creating Account...
                  </>
                ) : (
                  'Sign Up'
                )}
              </button>
            </form>

            {/* Toggle to Login */}
            <p className="login-toggle-text">
              Already have an account?{' '}
              <span className="login-toggle-link" onClick={toggleState}>
                Login
              </span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;