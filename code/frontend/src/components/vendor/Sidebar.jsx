import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaBoxes, FaThLarge, FaClipboardList, FaCog, FaPlusCircle, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div className="sidebar-container">
      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        
        <NavLink 
          to="/vendor" 
          end
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaThLarge size={18} /> 
          <span>Dashboard</span>
        </NavLink>

        {/* අලුතින් එකතු කළ Create Box Link එක */}
        <NavLink 
          to="/vendor/create-box" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaPlusCircle size={18} /> 
          <span>Create Box</span>
        </NavLink>

        <NavLink 
          to="/vendor/orders" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaClipboardList size={18} /> 
          <span>Orders</span>
        </NavLink>
        
        <NavLink 
          to="/vendor/my-items" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaBoxes size={18} /> 
          <span>My items</span>
        </NavLink>
      
        <NavLink 
          to="/vendor/settings" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaCog size={18} /> 
          <span>Settings</span>
        </NavLink>

      </nav>

      {/* Profile & Logout Button */}
      <div style={{ padding: '24px 20px', marginTop: 'auto', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '50%', 
            backgroundColor: '#F3F4F6', 
            color: '#1A2340', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold'
          }}>
            {displayName ? displayName.charAt(0).toUpperCase() : 'V'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: '500', textTransform: 'capitalize' }}>
              {displayName || username || 'Vendor'}
            </span>
            <span style={{ color: '#9CA3AF', fontSize: '13px' }}>
              Vendor
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
            gap: '12px',
            fontSize: '15px',
            padding: '8px 0',
            transition: 'color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.color = '#FFFFFF'}
          onMouseOut={(e) => e.currentTarget.style.color = '#D1D5DB'}
        >
          <FaSignOutAlt size={18} />
          <span>Logout</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;
