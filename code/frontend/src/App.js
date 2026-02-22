import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

import HomePage from './pages/homepage/HomePage.jsx'; 

// --- COMPONENT IMPORTS ---
import Login from './pages/auth/Login.jsx'; 
import Register from './pages/auth/Register.jsx';
import Home from './pages/user/Home.jsx';
import UserDashboard from './pages/user/UserDashboard.jsx';

// --- ADMIN IMPORTS ---
import Sidebar from './components/admin/Sidebar.jsx';
import AdminLayout from './layouts/AdminLayout.jsx'; 
import Partners from './pages/admin/Partners.jsx'; 
import PendingPartners from './pages/admin/PendingPartners.jsx';
import Customers from './pages/admin/Customers.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Settings from './pages/admin/Settings.jsx'; // Make sure this file exists!

// --- SELLER IMPORTS ---
import SellerDashboard from './pages/seller/SellerDashboard.jsx';

/**
 * Layout Wrapper for General/User Routes
 */
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // Log the current path for debugging
  useEffect(() => {
    console.log("Current Path:", location.pathname);
    console.log("Is Admin View:", isAdminPath);
  }, [location]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Render Sidebar only on admin paths if not handled by AdminLayout */}
      {isAdminPath && <Sidebar />} 
      <div style={{ flex: 1, background: isAdminPath ? '#deebf7' : '#ffffff' }}>
        {children}
      </div>
    </div>
  );
};

/**
 * Main App Component
 * This component sets up the routing for the Admin, User, and Seller sections.
 */
function App() {
  return (
    <Router>
      <Routes>
        
        {/* --- PUBLIC & USER ROUTES --- */}
        <Route path="/" element={<LayoutWrapper><HomePage /></LayoutWrapper>} />
        <Route path="/home" element={<LayoutWrapper><HomePage /></LayoutWrapper>} />
        <Route path="/login" element={<LayoutWrapper><Login /></LayoutWrapper>} />
        <Route path="/register" element={<LayoutWrapper><Register /></LayoutWrapper>} />
        <Route path="/user-dashboard" element={<LayoutWrapper><UserDashboard /></LayoutWrapper>} />

        {/* --- SELLER ROUTES --- */}
        <Route path="/seller" element={<LayoutWrapper><SellerDashboard /></LayoutWrapper>} />

        {/* --- ADMIN ROUTES --- */}
        {/* We use AdminLayout to handle the Sidebar and styling for admin pages */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="partners" element={<Partners />} />
              <Route path="partners/pending" element={<PendingPartners />} />
              <Route path="customers" element={<Customers />} />
              <Route path="settings" element={<Settings />} />
            </Routes>
          </AdminLayout>
        } />

        {/* --- DEFAULT REDIRECT --- */}
        <Route path="*" element={<Navigate to="/" />} />
        
      </Routes>
    </Router>
  );
}

export default App;