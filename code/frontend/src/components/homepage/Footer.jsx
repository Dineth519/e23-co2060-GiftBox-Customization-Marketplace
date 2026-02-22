import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();

  const links = {
    Shop:    ['All Products', 'Build Your Box', 'Gift Bundles', 'For Him', 'For Her', 'Corporate Gifts'],
    Vendors: ['Join With Us', 'Vendor Login', 'Seller Guidelines', 'Vendor Dashboard', 'Commission Rates'],
    Support: ['FAQ', 'Contact Us', 'Track Your Order', 'Return Policy', 'Shipping Info'],
    Company: ['About Giftora', 'Our Story', 'Careers', 'Press', 'Privacy Policy', 'Terms of Service'],
  };

  const socials = [
    { icon: '📘', label: 'Facebook'  },
    { icon: '📸', label: 'Instagram' },
    { icon: '🐦', label: 'Twitter'   },
    { icon: '💼', label: 'LinkedIn'  },
  ];

  return (
    <footer className="footer">

      {/* ── Main content ── */}
      <div className="footer__main">
        <div className="footer__grid">

          {/* Brand column */}
          <div>
            <div className="footer__brand-logo" onClick={() => navigate('/')}>
              <div className="footer__brand-icon">🎁</div>
              <span className="footer__brand-name">Giftora</span>
            </div>
            <p className="footer__brand-desc">
              Sri Lanka's premier curated gift marketplace. Connecting thoughtful givers
              with local artisans and vendors.
            </p>
            <div className="footer__socials">
              {socials.map((s, i) => (
                <button key={i} className="footer__social-btn" title={s.label} aria-label={s.label}>
                  {s.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="footer__col-title">{title}</h4>
              <ul className="footer__link-list">
                {items.map((item, i) => (
                  <li key={i}>
                    <a href="#" className="footer__link">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Newsletter */}
        <div className="footer__newsletter">
          <div>
            <p className="footer__newsletter-title">Get exclusive gift ideas &amp; deals 🎁</p>
            <p className="footer__newsletter-sub">Subscribe to our newsletter. No spam, ever.</p>
          </div>
          <div className="footer__newsletter-form">
            <input
              type="email"
              className="footer__newsletter-input"
              placeholder="your@email.com"
            />
            <button className="footer__newsletter-btn">Subscribe</button>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer__bottom">
        <p className="footer__copyright">
          © 2025 Giftora. All rights reserved. Made with ❤️ in Sri Lanka.
        </p>
        <div className="footer__legal-links">
          {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t, i) => (
            <a key={i} href="#" className="footer__legal-link">{t}</a>
          ))}
        </div>
      </div>

    </footer>
  );
};

export default Footer;