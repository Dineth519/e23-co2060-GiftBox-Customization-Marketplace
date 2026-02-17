import React from 'react';
import logo from '../assets/logo.jpeg'; 

const LandingPage = () => {
  return (
    <div style={{ fontFamily: 'sans-serif' }}>
      
      {/* --- 1. TOP HEADER (Logo, Search, Icons) --- */}
      <nav style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '15px 40px', 
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #ddd'
      }}>
        
        {/* Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img src={logo} alt="Giftora Logo" style={{ height: '50px' }} />
          <span style={{ marginLeft: '10px', fontSize: '24px', fontWeight: 'bold', color: '#0e2a47' }}>
            Giftora
          </span>
        </div>

        {/* Search Bar Section */}
        <div style={{ display: 'flex', flex: 1, maxWidth: '600px', margin: '0 40px' }}>
          <input 
            type="text" 
            placeholder="Search for gifts, boxes, or items..." 
            style={{
              width: '100%', padding: '10px 15px', border: '2px solid #0e2a47',
              borderRadius: '5px 0 0 5px', outline: 'none', fontSize: '16px'
            }}
          />
          <button style={{
            padding: '10px 25px', backgroundColor: '#0e2a47', border: 'none',
            borderRadius: '0 5px 5px 0', cursor: 'pointer'
          }}>
            {/* Search Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>

        {/* Icons Section */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          
          {/* 1. Cart Button */}
          <button style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '5px', // පොඩි ඉඩක් දුන්නා click කරන්න ලේසි වෙන්න
            display: 'flex', 
            alignItems: 'center' 
          }}>
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0e2a47" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
             </svg>
          </button>

          {/* 2. User Profile Button */}
          <button style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            padding: '5px',
            display: 'flex', 
            alignItems: 'center' 
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0e2a47" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>

        </div>
      </nav>

      {/* --- 2. CATEGORIES BAR (The New Green/Blue Bar) --- */}
      <div style={{ 
        backgroundColor: '#0e2a47', // Dark Blue Theme Color
        color: 'white',
        padding: '10px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '30px', // Space between links
        fontSize: '16px',
        fontWeight: '500'
      }}>
        
        {/* The "All Categories" Dropdown Trigger */}
        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" style={{ marginRight: '10px' }}>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          All Categories
        </div>

        {/* Menu Links */}
        <span style={{ cursor: 'pointer' }}>Build Your Box</span> {/* Important for your project [cite: 11] */}
        <span style={{ cursor: 'pointer' }}>Gift Bundles</span>
        <span style={{ cursor: 'pointer' }}>For Him</span>
        <span style={{ cursor: 'pointer' }}>For Her</span>
        <span style={{ cursor: 'pointer' }}>Corporate Gifts</span>
        <span style={{ cursor: 'pointer', color: '#d4af37' }}>Our Vendors</span> {/* Highlighted Vendor Link */}

      </div>

      {/* --- 3. HERO / BODY SECTION --- */}
      <div style={{ 
        textAlign: 'center', 
        padding: '80px 20px', 
        background: 'linear-gradient(to bottom, #f0f4f8, #ffffff)' 
      }}>
        <h1 style={{ fontSize: '3rem', color: '#0e2a47', margin: '0' }}>Curate the Perfect Gift</h1>
        <p style={{ fontSize: '1.2rem', color: '#555', marginTop: '10px' }}>
          Choose items from multiple vendors and we'll pack them into one luxury box.
        </p>
        <button style={{
          marginTop: '20px',
          padding: '15px 40px',
          backgroundColor: '#d4af37', // Gold Color
          color: 'white',
          border: 'none',
          borderRadius: '30px',
          fontSize: '18px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}>
          Start Customizing Now
        </button>
      </div>

    </div>
  );
};

export default LandingPage;