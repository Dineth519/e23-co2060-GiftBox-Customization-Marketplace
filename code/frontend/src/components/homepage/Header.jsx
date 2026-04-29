import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import CartBadge from './CartBadge.jsx';


const Header = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`giftora-header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-inner">
        <div className="header-logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🎁</span>
          <span className="logo-text">Giftora</span>
        </div>
        <nav className="header-nav">
          {[
            { label: 'Products',    route: '/products' },
            { label: 'How It Works', route: '/how-it-works'    },
            { label: 'Vendors',     route: '/vendors'  },
            { label: 'About Us',       route: '/about-us'    },
          ].map(item => (
            <button
              key={item.label}
              className="nav-link"
              onClick={() => navigate(item.route)}
            >
              {item.label}
            </button>
          ))}

          {/* #44 — Cart badge button */}
          <CartBadge />
        </nav>
        <div className="header-actions">
          <button className="header-btn-ghost" onClick={() => navigate('/login')}>Sign In / Sign Up</button>
          <button className="header-btn-gold" onClick={() => navigate('/build')}>🎀 Start Building</button>
        </div>
      </div>
    </header>
  );
};

export default Header;