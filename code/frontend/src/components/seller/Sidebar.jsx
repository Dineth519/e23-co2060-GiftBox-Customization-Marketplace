import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaBoxes, FaThLarge, FaClipboardList, FaCog, FaGift } from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar-container">
      

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        
        <NavLink 
          to="/seller" 
          end
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaThLarge size={18} /> 
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/seller/orders" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaClipboardList size={18} /> 
          <span>Orders</span>
        </NavLink>
        
        <NavLink 
          to="/seller/my-items" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaBoxes size={18} /> 
          <span>My items</span>
        </NavLink>
      
        <NavLink 
          to="/seller/add-items" 
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
        >
          <FaGift size={18} /> 
          <span>Gift Sets</span>
        </NavLink>

        <NavLink 
          to="/seller/settings" 
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