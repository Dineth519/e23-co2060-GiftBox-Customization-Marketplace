// Core library
import React from 'react';
import { Navigate } from 'react-router-dom';

// Vendor components
import Sidebar from '../components/vendor/Sidebar';
import TopBar from '../components/vendor/TopBar';

// Stylesheet
import './AdminLayout.css';

// Vendor layout wrapper component providing sidebar and top navigation
const VendorLayout = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');

  // Route Guard: Redirect to login if user is not authorized as a vendor
  if (!userId || (userRole !== 'VENDOR' && userRole !== 'SELLER' && userRole !== 'PARTNER')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Top navigation bar */}
      <TopBar />

      <div className="layout-wrapper">
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Main content area */}
        <main className="main-content">
          {children}
        </main>

      </div>
      
    </div>
  );
};

export default VendorLayout;
