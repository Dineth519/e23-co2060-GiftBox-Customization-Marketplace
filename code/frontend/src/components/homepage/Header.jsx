// Header.jsx
// Updated with login state check:
// - NOT logged in → shows "Sign In / Sign Up" button
// - Logged in     → shows "My Account" dropdown with profile, orders, logout

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import CartBadge from './CartBadge.jsx';

const Header = () => {
  const navigate = useNavigate();

  // Scroll state — makes header background appear when scrolling down
  const [scrolled, setScrolled] = useState(false);

  // Dropdown open/close state
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ Login check
  // Reads the token from localStorage.
  // If token exists → customer is logged in → show "My Account"
  // If no token    → customer is not logged in → show "Sign In / Sign Up"
  // Also checks that the value is not the string "undefined"
  // useState so header re-renders when login status changes
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check userRole since backend doesn't send token yet
    const role = localStorage.getItem('userRole');
    setIsLoggedIn(!!role && role !== 'undefined' && role !== 'null');
  }, []); // runs once when header loads

  // Scroll listener — adds dark background to header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown when customer clicks anywhere outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.header-profile')) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigate to a page and close the dropdown
  function goTo(route) {
    setDropdownOpen(false);
    navigate(route);
  }

  // Logout — removes token from localStorage and goes to login page
  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');  
    localStorage.removeItem('username');   
    localStorage.removeItem('userId');  
    setIsLoggedIn(false); // ← update state immediately   
    setDropdownOpen(false);
    navigate('/login');
  }

  return (
    <header className={`giftora-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">

        {/* ── Logo ── */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🎁</span>
          <span className="logo-text">Giftora</span>
        </div>

        {/* ── Nav Links ── */}
        <nav className="header-nav">
          {[
            { label: 'Products',    route: '/products'  },
            { label: 'Build a Box', route: '/customize' },
            { label: 'Vendors',     route: '/vendors'   },
            { label: 'About',       route: '/about'     },
          ].map(item => (
            <button
              key={item.label}
              className="nav-link"
              onClick={() => navigate(item.route)}
            >
              {item.label}
            </button>
          ))}

          {/* Cart badge */}
          <CartBadge />
        </nav>

        {/* ── Right Side Actions ── */}
        <div className="header-actions">

          {isLoggedIn ? (

            // ════ LOGGED IN — show My Account dropdown ════
            // This only appears after the customer has logged in
            // and a token is saved in localStorage
            <div className="header-profile">

              {/* Trigger button */}
              <button
                className="header-profile-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {/* Gold avatar circle with first letter of name */}
                <span className="header-avatar">N</span>
                <span className="header-profile-name">My Account</span>
                {/* Arrow rotates when dropdown opens */}
                <span className={`header-arrow ${dropdownOpen ? 'open' : ''}`}>▾</span>
              </button>

              {/* Dropdown menu — only visible when dropdownOpen is true */}
              {dropdownOpen && (
                <div className="header-dropdown">

                  <button className="dropdown-item" onClick={() => goTo('/profile')}>
                    👤 My Profile
                  </button>

                  <button className="dropdown-item" onClick={() => goTo('/orders')}>
                    📦 My Orders
                  </button>

                  <button className="dropdown-item" onClick={() => goTo('/customize')}>
                    🎁 Build a Box
                  </button>

                  {/* Divider line before logout */}
                  <div className="dropdown-divider" />

                  <button className="dropdown-item danger" onClick={handleLogout}>
                    🚪 Logout
                  </button>

                </div>
              )}
            </div>

          ) : (

            // ════ NOT LOGGED IN — show Sign In / Sign Up button ════
            // This is the original button shown to guests
            <button
              className="header-btn-ghost"
              onClick={() => navigate('/login')}
            >
              Sign In / Sign Up
            </button>

          )}

          {/* Gold "Start Building" button — always visible */}
          <button
            className="header-btn-gold"
            onClick={() => navigate('/customize')}
          >
            🎀 Start Building
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;