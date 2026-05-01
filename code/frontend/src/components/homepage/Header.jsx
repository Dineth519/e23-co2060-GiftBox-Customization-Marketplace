// Header.jsx
// Updated to add a profile dropdown menu for logged-in customers.
// When customer clicks "👤 My Account" → dropdown shows:
//   - My Profile
//   - My Orders
//   - Build a Box
//   - Logout

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import CartBadge from './CartBadge.jsx';

const Header = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled]           = useState(false);

  // Controls whether the profile dropdown is open or closed
  const [dropdownOpen, setDropdownOpen]   = useState(false);

  // Scroll effect for header background
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

  // Logout — clears token and goes back to login page
  function handleLogout() {
    localStorage.removeItem('token');  // remove JWT token
    setDropdownOpen(false);
    navigate('/login');
  }

  return (
    <header className={`giftora-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">

        {/* Logo */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🎁</span>
          <span className="logo-text">Giftora</span>
        </div>

        {/* Nav links */}
        <nav className="header-nav">
          {[
            { label: 'Products',    route: '/products' },
            { label: 'Build a Box', route: '/customize' },
            { label: 'Vendors',     route: '/vendors'  },
            { label: 'About',       route: '/about'    },
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

        {/* Header right side actions */}
        <div className="header-actions">

          {/* ✅ PROFILE DROPDOWN
              Replaces the old "Sign In / Sign Up" button for logged-in users.
              Shows a dropdown with profile, orders, and logout links. */}
          <div className="header-profile">

            {/* Trigger button — click to open/close dropdown */}
            <button
              className="header-profile-btn"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {/* Avatar circle with initial — like Daraz */}
              <span className="header-avatar">N</span>
              <span className="header-profile-name">My Account</span>
              {/* Arrow rotates when dropdown is open */}
              <span className={`header-arrow ${dropdownOpen ? 'open' : ''}`}>▾</span>
            </button>

            {/* Dropdown menu — only shown when dropdownOpen is true */}
            {dropdownOpen && (
              <div className="header-dropdown">

                {/* Profile link */}
                <button
                  className="dropdown-item"
                  onClick={() => goTo('/profile')}
                >
                  👤 My Profile
                </button>

                {/* Orders link */}
                <button
                  className="dropdown-item"
                  onClick={() => goTo('/orders')}
                >
                  📦 My Orders
                </button>

                {/* Build a Box link */}
                <button
                  className="dropdown-item"
                  onClick={() => goTo('/customize')}
                >
                  🎁 Build a Box
                </button>

                {/* Divider line */}
                <div className="dropdown-divider" />

                {/* Logout */}
                <button
                  className="dropdown-item danger"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>

              </div>
            )}
          </div>

          {/* Start Building gold button */}
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