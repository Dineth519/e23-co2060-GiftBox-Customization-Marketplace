import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaThLarge, FaStore, FaCog, FaShoppingBag, FaUsersCog, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div className="sidebar-container">
      

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        
        <NavLink 
          to="/admin" 
          end
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaThLarge size={18} /> 
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/admin/staff-management" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaUsersCog size={18} /> 
          <span>Staff Management</span>
        </NavLink>

        <NavLink 
          to="/admin/vendors" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaStore size={18} /> 
          <span>Vendors</span>
        </NavLink>
        
        <NavLink 
          to="/admin/customers" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaShoppingBag size={18} /> 
          <span>Customers</span>
        </NavLink>

        <NavLink 
          to="/admin/categories" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaThLarge size={18} /> 
          <span>Categories</span>
        </NavLink>

        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaCog size={18} /> 
          <span>Settings</span>
        </NavLink>

      </nav>

      {/* Profile & Logout Button */}
      {/* Profile & Logout Button */}
      <div style={{ padding: '16px 20px', marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.1)', flexShrink: 0 }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            backgroundColor: '#F3F4F6', 
            color: '#1A2340', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '15px',
            fontWeight: 'bold'
          }}>
            {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: '500', textTransform: 'capitalize' }}>
              {displayName || username || 'Admin'}
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '12px' }}>
              Administrator
            </span>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          style={{ 
            width: '100%', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer', 
            color: '#D1D5DB', 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            padding: '6px 0',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#EF4444'}
          onMouseOut={(e) => e.currentTarget.style.color = '#D1D5DB'}
        >
          <FaSignOutAlt size={16} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;