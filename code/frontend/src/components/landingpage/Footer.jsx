import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = ({ customer = false }) => {
  const navigate = useNavigate();

  const FOOTER_COLS = [
    { heading: 'Shop',    links: [
      { label: 'Gift Bundles', path: '/products' },
      { label: 'Build a Box', path: customer ? '/customer/build-box' : '/build-box' },
      { label: 'Featured', path: '/products' },
      { label: 'New Arrivals', path: '/products' }
    ]},
    { heading: 'Vendors', links: [
      { label: 'Join Giftora', path: '/vendor-register' },
      { label: 'Vendor Login', path: '/login' },
      { label: 'Guidelines', path: '/vendor-landing' },
      { label: 'Benefits', path: '/vendor-landing' }
    ]},
    { heading: 'Support', links: [
      { label: 'About the Project', path: customer ? '/customer/about-us' : '/about-us' },
      { label: customer ? 'Track My Orders' : 'Sign In to Track Orders', path: customer ? '/customer/orders' : '/login' },
    ]},
  ];

  return (
    <footer className="giftora-footer">
      <div className="footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <div className="footer-logo" onClick={() => navigate(customer ? '/customer/home' : '/')}>
            <span className="footer-logo__icon">🎁</span>
            <span className="footer-logo__text">Giftora</span>
          </div>
          <p className="footer-tagline">
            Giftora is a student marketplace demonstration by Team Nexus. Vendors, products, and fulfillment may be simulated.
          </p>

        </div>

        {/* Link columns */}
        <div className="footer-links">
          {FOOTER_COLS.map(col => (
            <div key={col.heading} className="footer-col">
              <div className="footer-col__heading">{col.heading}</div>
              {col.links.map(link => (
                <button 
                  key={link.label} 
                  className="footer-col__link"
                  onClick={() => navigate(link.path)}
                >
                  {link.label}
                </button>
              ))}
            </div>
          ))}
        </div>

      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Giftora. All rights reserved.</span>
        <span>Made with 💛 in Sri Lanka</span>
      </div>
    </footer>
  );
};

export default Footer;
