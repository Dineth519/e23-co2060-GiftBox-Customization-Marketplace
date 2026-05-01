// Core library
import React from 'react';

// Admin components
import Sidebar from '../components/seller/Sidebar';
import TopBar from '../components/seller/TopBar';

// Stylesheet
import './AdminLayout.css';

// Admin layout wrapper component providing sidebar and top navigation
const SellerLayout = ({ children }) => {
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

export default SellerLayout;
