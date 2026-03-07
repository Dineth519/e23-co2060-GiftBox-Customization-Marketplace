import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const FOOTER_COLS = [
    { heading: 'Shop',    links: ['Gift Bundles', 'Build a Box', 'Featured', 'New Arrivals'] },
    { heading: 'Vendors', links: ['Join Giftora', 'Vendor Login', 'Guidelines', 'Benefits']  },
    { heading: 'Support', links: ['Help Center', 'Order Tracking', 'Returns', 'Contact Us']  },
  ];

  return (
    <footer className="giftora-footer">
      <div className="footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <div className="footer-logo" onClick={() => navigate('/')}>
            <span className="footer-logo__icon">🎁</span>
            <span className="footer-logo__text">Giftora</span>
          </div>
          <p className="footer-tagline">
            Sri Lanka's premium gift marketplace — curating joy since 2023.
          </p>
          <div className="footer-socials">
            {['Instagram', 'Facebook', 'TikTok'].map(s => (
              <button key={s} className="social-btn" title={s}>{s[0]}</button>
            ))}
          </div>
        </div>

        {/* Link columns */}
        <div className="footer-links">
          {FOOTER_COLS.map(col => (
            <div key={col.heading} className="footer-col">
              <div className="footer-col__heading">{col.heading}</div>
              {col.links.map(link => (
                <button key={link} className="footer-col__link">{link}</button>
              ))}
            </div>
          ))}
        </div>

      </div>

      <div className="footer-bottom">
        <span>© 2025 Giftora. All rights reserved.</span>
        <span>Made with 💛 in Sri Lanka</span>
      </div>
    </footer>
  );
};

export default Footer;