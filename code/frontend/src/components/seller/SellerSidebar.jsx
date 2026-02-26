import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../admin/Sidebar.css'; // Utilizing shared CSS classes from your teammates

const SellerSidebar = () => {
  const location = useLocation();

  // Navigation items for the seller panel
  const menuItems = [
    { name: 'Dashboard', path: '/seller' },
    { name: 'My Items', path: '/seller/items' },
    { name: 'Orders', path: '/seller/orders' },
    { name: 'Settings', path: '/seller/settings' }
  ];

  // Styling to match the premium dark theme of Giftora
  const sidebarStyle = {
    width: '260px',
    height: '100vh',
    background: '#0f172a', // Deep navy background from homepage
    color: '#fff',
    padding: '30px 20px',
    position: 'fixed'
  };

  const brandStyle = {
    color: '#d4af37', // Gold accent color for the brand
    fontSize: '1.8rem',
    fontWeight: 'bold',
    marginBottom: '40px',
    textAlign: 'center'
  };

  return (
    <div style={sidebarStyle}>
      <div style={brandStyle}>Giftora</div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {menuItems.map((item) => (
          <li 
            key={item.name} 
            style={{
              margin: '15px 0',
              padding: '12px 20px',
              borderRadius: '12px',
              // Highlight active link with a subtle transparent white
              background: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <Link to={item.path} style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SellerSidebar;