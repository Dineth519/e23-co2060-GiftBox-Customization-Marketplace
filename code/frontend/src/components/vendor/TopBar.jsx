import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, LogOut } from 'lucide-react';
import './TopBar.css';
import logo from '../../assets/logo.png';

const TopBar = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'Vendor';

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

  // Function to handle session termination
  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true }); 
  };

  return (
    <header className="topbar-container">

      {/* Left Section - Logo/Brand */}
      <div className="topbar-brand">
        <img src={logo} alt="Giftora Logo" className="topbar-logo" />
        <div className="brand-text-wrapper">
          <span className="topbar-title">Giftora</span>
          <span className="topbar-tagline">Vendor Panel</span>
        </div>
      </div>

      {/* Right Section: Notifications, Profile & Logout */}
      <div className="topbar-actions">

        {/* Profile Section — click to go to Settings */}
        <div
          className="profile-section"
          onClick={() => navigate('/vendor/settings')}
          style={{ cursor: 'pointer' }}
        >
          <div className="profile-info">
            <span className="profile-name" style={{ textTransform: 'capitalize' }}>{displayName}</span> 
            <span className="profile-role">Vendor</span>
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