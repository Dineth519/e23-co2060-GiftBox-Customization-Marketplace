import React from 'react';
import Sidebar from '../components/admin/Sidebar';
import TopBar from '../components/admin/TopBar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      
      <TopBar />

      <div className="layout-wrapper">
        
        <Sidebar />

        <main className="main-content">
          {children}
        </main>

      </div>
      
    </div>
  );
};

export default AdminLayout;