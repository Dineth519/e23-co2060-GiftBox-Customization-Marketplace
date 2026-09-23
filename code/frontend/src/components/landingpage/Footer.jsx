import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = ({ customer = false }) => {
  const navigate = useNavigate();

  const LANDING_COLS = [
    { heading: 'Shop', links: [
      { label: 'Gift Bundles',  path: '/products' },
      { label: 'Build a Box',   path: '/build-box' },
      { label: 'New Arrivals',  path: '/products' },
      { label: 'My Cart',       path: '/cart' },
    ]},
    { heading: 'Vendors', links: [
      { label: 'Join Giftora',     path: '/vendor-register' },
      { label: 'Vendor Login',     path: '/login' },
      { label: 'Vendor Dashboard', path: '/vendor' },
    ]},
    { heading: 'Support', links: [
      { label: 'About the Project', path: '/about-us' },
      { label: 'Sign In',           path: '/login' },
      { label: 'Contact Us',        path: '/about-us' },
    ]},
  ];

  const CUSTOMER_COLS = [
    { heading: 'Shop', links: [
      { label: 'Gift Bundles',  path: '/customer/home' },
      { label: 'Build a Box',   path: '/customer/build-box' },
      { label: 'New Arrivals',  path: '/customer/home' },
      { label: 'My Cart',       path: '/customer/cart' },
    ]},
    { heading: 'My Account', links: [
      { label: 'My Orders',   path: '/customer/orders' },
      { label: 'My Profile',  path: '/customer/profile' },
      { label: 'Settings',    path: '/customer/settings' },
      { label: 'Checkout',    path: '/customer/checkout' },
    ]},
    { heading: 'Support', links: [
      { label: 'About the Project', path: '/customer/about-us' },
      { label: 'Contact Us',        path: '/customer/about-us' },
    ]},
  ];

  const FOOTER_COLS = customer ? CUSTOMER_COLS : LANDING_COLS;


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
