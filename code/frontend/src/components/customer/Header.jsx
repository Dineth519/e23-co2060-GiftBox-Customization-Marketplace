import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, User, ChevronDown, LogOut } from 'lucide-react'; // Added LogOut icon
import CartBadge from './CartBadge.jsx';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');

  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'Customer';

  useEffect(() => {
    async function fetchName() {
      if (!userId) {
        setDisplayName(username.includes('@') ? username.split('@')[0] : username);
        return;
      }
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
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


  // Handle logout logic
  const handleExit = () => {
    localStorage.clear();
    console.log("User logged out");
    navigate('/'); 
  };

  return (
    <header className="topbar-container">
      {/* Left — Logo & Brand */}
      <div className="topbar-brand" onClick={() => navigate('/customer/home')} style={{ cursor: 'pointer' }}>
        <div className="brand-text-wrapper">
          <span className="topbar-title">Giftora</span>
          <span className="topbar-tagline">Customer Portal</span>
        </div>
      </div>

      {/* Center — Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {[
          { label: 'Build a Box',  route: '/customer/build-box' },
          { label: 'About Us',     route: '/customer/about-us' },
          { label: 'Order History', route: '/customer/orders' },
        ].map(item => (
          <button
            key={item.label}
            onClick={() => navigate(item.route)}
            className="nav-link-btn" // Recommended: move inline styles to CSS
            style={{
              background: 'none',
              border: 'none',
              color: '#E8E8E8',
              fontSize: '14px',
              fontWeight: '500',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              letterSpacing: '0.3px',
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(201, 169, 97, 0.12)';
              e.target.style.color = '#C9A961';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'none';
              e.target.style.color = '#E8E8E8';
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right — Notifications, Profile & Exit */}
      <div className="topbar-actions">
        <CartBadge />
        
        <button className="notification-btn">
          <Bell className="notification-icon" size={20} />
          <span className="notification-badge"></span>
        </button>

        <div className="profile-section" onClick={() => navigate('/customer/profile')}>
          <div className="profile-info">
            <span className="profile-name" style={{ textTransform: 'capitalize' }}>{displayName}</span>
            <span className="profile-role">Customer</span>
          </div>
          <div className="profile-avatar">
            <User size={18} />
          </div>
          <ChevronDown size={14} style={{ color: '#5DADE2' }} />
        </div>

        {/* Exit Button */}
        <button 
          className="exit-btn" 
          onClick={handleExit}
          title="Exit"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(231, 76, 60, 0.1)', // Subtle red background
            border: 'none',
            borderRadius: '8px',
            padding: '8px',
            cursor: 'pointer',
            color: '#E74C3C',
            marginLeft: '8px',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(231, 76, 60, 0.1)'}
        >
          <LogOut size={20} />
        </button>

      </div>
    </header>
  );
};

export default Header;