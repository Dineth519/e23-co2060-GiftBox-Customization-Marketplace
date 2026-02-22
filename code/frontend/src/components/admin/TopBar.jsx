import React from 'react';
import { Bell, User } from 'lucide-react';
import './TopBar.css';
import logo from '../../assets/logo-removebg-preview.png'; // Adjust path to your logo

const TopBar = () => {
  return (
    <header className="topbar-container">

      {/* Left Section - Logo/Brand */}
      <div className="topbar-brand">
        <img src={logo} alt="Giftora Logo" className="topbar-logo" />
        <div className="brand-text-wrapper">
          <span className="topbar-title">Giftora</span>
          <span className="topbar-tagline">Admin Panel</span>
        </div>
      </div>

      {/* Right Section: Notifications & Profile */}
      <div className="topbar-actions">
        
        {/* Notification Button */}
        <button className="notification-btn">
          <Bell className="notification-icon" />
          <span className="notification-badge"></span>
        </button>
        
        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-info">
            <span className="profile-name">Mathew Anderson</span>
            <span className="profile-role">Administrator</span>
          </div>
          <div className="profile-avatar">
            <User size={18} />
          </div>
        </div>
        
      </div>

    </header>
  );
};

export default TopBar;