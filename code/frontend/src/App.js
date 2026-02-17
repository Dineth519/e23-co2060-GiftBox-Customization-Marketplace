import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- COMPONENT IMPORTS ---
// Ensure these paths match your actual folder structure
import Sidebar from './components/admin/Sidebar.jsx';
import Partners from './pages/admin/Partners.jsx'; 
import Settings from './pages/admin/Settings.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import LandingPage from './pages/LandingPage.jsx';

/**
 * Main App Component
 * Uses React Router to manage navigation and a Flexbox layout 
 * to keep the Sidebar fixed on the left.
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

      </Routes>
    </Router>
  );
}

export default App;