import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaThLarge, FaStore, FaCog, FaShoppingBag, FaUsersCog, FaSignOutAlt } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/', { replace: true });
  };

  return (
    <div className="sidebar-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      

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

      {/* Logout Button */}
      <div style={{ padding: '24px', marginTop: 'auto' }}>
        <button 
          onClick={handleLogout}
          className="nav-link"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', justifyContent: 'flex-start' }}
        >
          <FaSignOutAlt size={18} />
          <span>Sign Out</span>
        </button>
      </div>

    </div>
  );
};

export default Sidebar;