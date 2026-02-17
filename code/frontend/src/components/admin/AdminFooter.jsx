import React from 'react';
import './AdminFooter.css';

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="admin-footer">
      <div className="footer-content">
        
        {/* Left Side: Copyright */}
        <div className="footer-copyright">
          <p>
            © {currentYear} <span className="footer-brand">Giftore Marketplace</span>. 
            All rights reserved.
          </p>
        </div>

        {/* Right Side: Links */}
        <div className="footer-links">
          <a href="/help" className="footer-link">Help Center</a>
          <span className="footer-divider">|</span>
          <a href="/privacy" className="footer-link">Privacy Policy</a>
          <span className="footer-divider">|</span>
          <span className="footer-version">v1.0.0-beta</span>
        </div>

      </div>
    </footer>
  );
};

export default AdminFooter;