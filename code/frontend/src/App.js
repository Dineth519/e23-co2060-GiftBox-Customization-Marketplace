import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// --- COMPONENT IMPORTS ---
import Login from './pages/auth/Login.jsx'; 
import Register from './pages/auth/Register.jsx';
// --- ADMIN IMPORTS ---
import Sidebar from './components/admin/Sidebar.jsx';
import AdminLayout from './layouts/AdminLayout.jsx'; 
import Partners from './pages/admin/Partners.jsx'; 
import Dashboard from './pages/admin/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Home from './pages/user/Home.jsx';
import UserDashboard from './pages/user/UserDashboard.jsx';

const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // This will print the current path in your Browser Console (F12)
  useEffect(() => {
    console.log("Current Path:", location.pathname);
    console.log("Is Admin View:", isAdminPath);
  }, [location]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* If this doesn't show, check if Sidebar.jsx has errors */}
      {isAdminPath && <Sidebar />} 
import PendingPartners from './pages/admin/PendingPartners.jsx';
import Customers from './pages/admin/Customers.jsx';

// --- SELLER IMPORTS ---

import SellerDashboard from './pages/seller/SellerDashboard.jsx';

/**
 * Main App Component
  * This component sets up the routing for both the Admin and Seller sections of the application.
 */
function App() {
  return (
    <Router>
      <Routes>
        
        {/* --- PUBLIC ROUTE --- */}
        {/* This is the first page users will see (http://localhost:5173/) */}
        {/* It does NOT have the Sidebar */}
        <Route path="/" element={<LandingPage />} />


        {/* --- ADMIN ROUTES --- */}
        {/* Any URL starting with "/admin" will be handled here.
            We wrap these routes in the Sidebar layout.
        */}
        <Route path="/admin/*" element={
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            
            {/* Sidebar is only visible for admin routes */}
            <Sidebar /> 

            {/* Main Content Area for Admin */}
            <div style={{ flex: 1, background: '#deebf7' }}>
              <Routes>
                {/* Default Admin Page (Dashboard) - matches "/admin" */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Other Admin Pages - matches "/admin/partners", etc. */}
                <Route path="partners" element={<Partners />} />
                <Route path="settings" element={<Settings />} />
              </Routes>
            </div>

          </div>
        } />

      <div style={{ minHeight: '100vh' }}>
        
        <Routes>
          {/* --- ADMIN SECTION --- */}
          {/* / */}
          <Route 
            path="/admin/*" 
            element={
              <div style={{ display: 'flex' }}>
                <Sidebar /> 
                <div style={{ flex: 1, background: '#deebf7' }}>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="partners" element={<Partners />} />
                    <Route path="settings" element={<Settings />} />
                  </Routes>
                </div>
              </div>
            } 
          />

          {/* --- SELLER SECTION --- */}
          <Route path="/seller" element={<SellerDashboard />} />

          {/* --- DEFAULT REDIRECT --- */}

          <Route path="/" element={<Navigate to="/admin" />} />
          
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

      <div style={{ 
        flex: 1, 
        background: isAdminPath ? '#deebf7' : '#ffffff' 
      }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/partners" element={<Partners />} />
          <Route path="/admin/settings" element={<Settings />} />
        </Routes>
      </LayoutWrapper>
function App() {
  return (
    <Router>
      <Routes>

        {/* Admin Routes with AdminLayout */}
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="partners" element={<Partners />} />
              <Route path="partners/pending" element={<PendingPartners />} />
              <Route path="customers" element={<Customers />} />
            </Routes>
          </AdminLayout>
        } />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/admin" />} />
      </Routes>
    </Router>
  );
}

export default App;