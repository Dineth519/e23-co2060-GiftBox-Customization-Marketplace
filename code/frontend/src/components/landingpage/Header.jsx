import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import CartBadge from './CartBadge.jsx';
import logoMarkImg from '../../assets/logo_mark.png';

const Header = () => {
  const navigate = useNavigate();

  // Scroll state — makes header background appear when scrolling down
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll listener — adds background effect on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`giftora-header header-dynamic ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">

        {/* ── Logo ── */}
        <div className="header-logo" onClick={() => navigate('/')}>
          <img src={logoMarkImg} alt="Giftora Logo" className="logo-mark-img" />
          <span className="logo-text">Giftora</span>
        </div>

        {/* ── Nav Links ── */}
        <button className="public-menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} aria-controls="public-navigation" onClick={() => setMenuOpen(!menuOpen)}>Menu</button>
        <nav id="public-navigation" className={`header-nav ${menuOpen ? 'public-nav-open' : ''}`} onKeyDown={event => { if (event.key === 'Escape') setMenuOpen(false); }}>
          {[
            { label: 'Products',    route: '/products' },
            { label: 'About Us',    route: '/about-us' },
            { label: 'Build a Box', route: '/build-box' },
            { label: 'Join as Vendor', route: '/vendor-landing' },
          ].map(item => (
            <button
              key={item.label}
              className="nav-link"
              onClick={() => { setMenuOpen(false); navigate(item.route); }}
            >
              {item.label}
            </button>
          ))}

          {/* Cart badge icon */}
          <CartBadge />
        </nav>

        {/* ── Right Side Actions ── */}
        <div className="header-actions">
          {/* Sign In / Sign Up Button (Ghost style) */}
          <button
            className="header-btn-ghost"
            onClick={() => navigate('/login')}
          >
            Sign In / Sign Up
          </button>

          {/* Gold "Start Building" button */}
          <button
            className="header-btn-gold"
            onClick={() => navigate('/build-box')}
          >
            🎀 Start Building
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
