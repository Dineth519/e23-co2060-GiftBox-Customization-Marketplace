import React from 'react';
import { Search, Bell, Menu } from 'lucide-react'; 

const TopBar = () => {
  return (
    <header style={{
      height: '64px',
      backgroundColor: '#111827',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      borderBottom: '1px solid #1f2937',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      color: 'white',
      position: 'fixed',
      top: 0,
      left: 0,           // Changed: starts from left edge
      right: 0,
      zIndex: 50,
      width: '100%'      // Changed: full width
    }}>

      {/* Left Section - Logo/Brand */}
      <div style={{
        fontSize: '24px',
        fontWeight: 'bold'
      }}>
        Giftore
      </div>

      {/* Right Section: Notifications & Profile */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px'
      }}>
        <button style={{
          position: 'relative',
          padding: '8px',
          borderRadius: '9999px',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#9ca3af',
          transition: 'background-color 0.3s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bell style={{ height: '20px', width: '20px' }} />
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            height: '8px',
            width: '8px',
            borderRadius: '9999px',
            backgroundColor: '#ef4444',
            border: '2px solid #111827'
          }}></span>
        </button>
        
        {/* Profile Avatar */}
        <div style={{
          height: '32px',
          width: '32px',
          borderRadius: '9999px',
          background: 'linear-gradient(to bottom right, #6366f1, #9333ea)',
          border: '1px solid #4b5563',
          cursor: 'pointer',
          marginRight: '50px' 
        }}></div>
      </div>

    </header>
  );
};

export default TopBar;