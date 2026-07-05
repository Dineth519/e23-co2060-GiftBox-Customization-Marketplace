// Core library
import React from 'react';
import { Navigate } from 'react-router-dom';

// Admin components
import Sidebar from '../components/admin/Sidebar';
import TopBar from '../components/admin/TopBar';

// Stylesheet
import './AdminLayout.css';

// Admin layout wrapper component providing sidebar and top navigation
const AdminLayout = ({ children }) => {
  const userRole = localStorage.getItem('userRole');
  const userId = localStorage.getItem('userId');

  // Route Guard: Redirect to login if user is not authorized as an admin
  if (!userId || userRole !== 'ADMIN') {
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

export default AdminLayout;