import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- ADMIN IMPORTS ---
import Sidebar from './components/admin/Sidebar.jsx';
import AdminLayout from './layouts/AdminLayout.jsx'; 
import Partners from './pages/admin/Partners.jsx'; 
import Dashboard from './pages/admin/Dashboard.jsx';
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

      </div>
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