// Core library
import React from 'react';

// Vendor components
import Sidebar from '../components/vendor/Sidebar';
import TopBar from '../components/vendor/TopBar';

// Stylesheet
import './AdminLayout.css';

// Vendor layout wrapper component providing sidebar and top navigation
const VendorLayout = ({ children }) => {
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
