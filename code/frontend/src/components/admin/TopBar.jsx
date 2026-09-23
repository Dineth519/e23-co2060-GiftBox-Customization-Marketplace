import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import './TopBar.css';
import logo from '../../assets/logo.png';

const TopBar = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'Admin';

  useEffect(() => {
    async function fetchName() {
      if (!userId) {
        setDisplayName(username.includes('@') ? username.split('@')[0] : username);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDisplayName(data.name || (username.includes('@') ? username.split('@')[0] : username));
        } else {
          setDisplayName(username.includes('@') ? username.split('@')[0] : username);
        }
      } catch (err) {
        setDisplayName(username.includes('@') ? username.split('@')[0] : username);
      }
    }
    fetchName();
  }, [userId, username]);

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

      {/* Right Section: Notifications, Profile & Logout */}
      <div className="topbar-actions">
        
        {/* Notification Button */}
        <button className="notification-btn">
          <Bell className="notification-icon" />
          <span className="notification-badge"></span>
        </button>


      </div>

    </header>
  );
};

export default TopBar;