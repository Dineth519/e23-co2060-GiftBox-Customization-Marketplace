import React, { useState } from 'react';
import { assets } from '../../assets/login/assets';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [state, setState] = useState('Login');
  const navigate = useNavigate();

  const [name, setName]               = useState('');
  const [username, setUsername]       = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Toggle between Login and Sign Up forms
  const toggleState = () => {
    setState(state === 'Sign Up' ? 'Login' : 'Sign Up');
    setName('');
    setUsername('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    try {
      if (state === 'Sign Up') {
        // Registration Flow
        const response = await fetch('http://localhost:8080/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, username, email, password }),
        });

        const data = await response.json();

        if (data.success === true) {
          alert('Registration Successful! Please check your email for the verification code.');
          // 👈 Redirect to verify page and pass the email state
          navigate('/verify', { state: { email: email } }); 
        } else {
          alert(data.message);
        }

      } else {
        // Login Flow
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        
        if (data.success === true) {
          alert(data.message);
          
          const userRole = data.role; 
          localStorage.setItem('userRole', userRole);
          localStorage.setItem('username', username);

          // Route user based on their role
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
          alert(data.message);
        }
      }
    } catch (error) {
      console.error('API Error:', error);
      alert('Something went wrong connecting to the server.');
    }
  };

  return (
    <div className="login-page">
      <img src={assets.logo} alt="Giftora Logo" className="login-logo" />

      <div className="login-card-wrapper">
        <div className={`login-card-inner ${state === 'Sign Up' ? 'flipped' : ''}`}>

          {/* ================= LOGIN SIDE ================= */}
          <div className="login-card-front">
            <h2>Welcome Back</h2>
            <p className="login-sub">Login to your account</p>
            <form onSubmit={onSubmitHandler}>
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input onChange={(e) => setUsername(e.target.value)} value={username} type="text" placeholder="Username" required />
              </div>
              <div className="login-input-row">
                <img src={assets.lock_icon} alt="" />
                <input onChange={(e) => setPassword(e.target.value)} value={password} type={showPassword ? 'text' : 'password'} placeholder="Password" required />
                <button type="button" className="login-eye-btn" onClick={() => setShowPassword(!showPassword)}>
                  <img src={showPassword ? assets.Open_Eye : assets.Close_Eye} alt="Toggle Visibility" />
                </button>
              </div>
              <p className="login-forgot" onClick={() => navigate('/email-verify')}>Forgot Password?</p>
              <button type="submit" className="login-submit-btn">Login</button>
            </form>
            <p className="login-toggle-text">Don't have an account? <span className="login-toggle-link" onClick={toggleState}>Sign Up</span></p>
          </div>

          {/* ================= SIGN UP SIDE ================= */}
          <div className="login-card-back">
            <h2>Create Account</h2>
            <p className="login-sub">Join us to customize your gifts</p>
            <form onSubmit={onSubmitHandler}>
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Full Name" required />
              </div>
              <div className="login-input-row">
                <img src={assets.person_icon} alt="" />
                <input onChange={(e) => setUsername(e.target.value)} value={username} type="text" placeholder="Choose a Username" required />
              </div>
              <div className="login-input-row">
                <img src={assets.mail_icon} alt="" />
                <input onChange={(e) => setEmail(e.target.value)} value={email} type="email" placeholder="Email" required />
              </div>
              <div className="login-input-row">
                <img src={assets.lock_icon} alt="" />
                <input onChange={(e) => setPassword(e.target.value)} value={password} type="password" placeholder="Password" required />
              </div>
              <button type="submit" className="login-submit-btn">Sign Up</button>
            </form>
            <p className="login-toggle-text">Already have an account? <span className="login-toggle-link" onClick={toggleState}>Login</span></p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;