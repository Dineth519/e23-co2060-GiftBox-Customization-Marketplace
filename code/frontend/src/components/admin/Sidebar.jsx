import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaThLarge, FaStore, FaCog, FaShoppingBag, FaUsersCog, FaGift } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      
      {/* Sidebar Branding/Header */}
      <div className="sidebar-header">
        <FaGift className="sidebar-logo-icon" />
        <span className="sidebar-brand">Giftore</span>
      </div>
      
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
          to="/admin/partners" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaStore size={18} /> 
          <span>Partners</span>
        </NavLink>
        
        <NavLink 
          to="/admin/customers" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaShoppingBag size={18} /> 
          <span>Customers</span>
        </NavLink>

        <NavLink 
          to="/admin/settings" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaCog size={18} /> 
          <span>Settings</span>
        </NavLink>

      </nav>
    </div>
  );
};

export default Sidebar;