import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

// ── Small reusable icon button ─────────────────────────────
const IconBtn = ({ children, label, badge }) => (
  <button className="icon-btn" aria-label={label} title={label}>
    {children}
    {badge > 0 && <span className="icon-btn__badge">{badge}</span>}
  </button>
);

// ── Navbar ─────────────────────────────────────────────────
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>

      {/* Logo */}
      <div className="navbar__logo" onClick={() => navigate('/')}>
        <div className="navbar__logo-icon">🎁</div>
        <span className="navbar__logo-text">Giftora</span>
      </div>

      {/* Search */}
      <div className="navbar__search">
        <span className="navbar__search-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A961" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="text"
          className="navbar__search-input"
          placeholder="Search gifts, boxes, or occasions..."
        />
        <button className="navbar__search-btn">Search</button>
      </div>

      {/* Right Actions */}
      <div className="navbar__actions">

        <IconBtn label="Wishlist">
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </IconBtn>

        <IconBtn label="Cart" badge={3}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </IconBtn>

        <div className="navbar__divider" />

        <button className="btn-login"    onClick={() => navigate('/login')}>Login</button>
        <button className="btn-register" onClick={() => navigate('/register')}>Register</button>

      </div>
    </nav>
  );
};

// ── Category Bar ───────────────────────────────────────────
const CategoryBar = () => {
  const navigate = useNavigate();

  const categories = [
    { label: 'Build Your Box',  icon: '📦' },
    { label: 'Gift Bundles',    icon: '🎀' },
    { label: 'For Him',         icon: '👔' },
    { label: 'For Her',         icon: '👑' },
    { label: 'Corporate Gifts', icon: '🏢' },
    { label: 'Our Vendors',     icon: '🏪', gold: true },
    { label: 'Join With Us',    icon: '✨', cta: true  },
  ];

  const getClass = (cat) => {
    if (cat.cta)  return 'category-bar__item category-bar__item--cta';
    if (cat.gold) return 'category-bar__item category-bar__item--gold';
    return 'category-bar__item';
  };

  return (
    <div className="category-bar">

      <button className="category-bar__all-btn">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <line x1="3" y1="6"  x2="21" y2="6"  />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        All Categories
      </button>

      <div className="category-bar__divider" />

      {categories.map((cat, i) => (
        <button
          key={i}
          className={getClass(cat)}
          onClick={() => cat.cta && navigate('/join-us')}
        >
          <span>{cat.icon}</span>
          {cat.label}
        </button>
      ))}

    </div>
  );
};

// ── Export ─────────────────────────────────────────────────
const Header = () => (
  <header>
    <Navbar />
    <CategoryBar />
  </header>
);

export default Header;