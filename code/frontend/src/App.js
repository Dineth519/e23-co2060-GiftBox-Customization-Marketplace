// Core libraries and routing
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Public and user pages
import HomePage from './pages/homepage/HomePage.jsx';
import CustomerHome from './pages/user/CustomerHome.jsx';
import Verify from './pages/user/Verify.jsx';

// Authentication pages
import Login from './pages/auth/Login.jsx';

// Admin components and pages
import Sidebar from './components/admin/Sidebar.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Partners from './pages/admin/Partners.jsx';
import PendingPartners from './pages/admin/PendingPartners.jsx';
import Customers from './pages/admin/Customers.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Settings from './pages/admin/Settings.jsx';

// Seller pages
import SellerDashboard from './pages/seller/SellerDashboard.jsx';

// Homepage
import ProductsPage from './pages/homepage/ProductsPage.jsx';
import AddressForm from './components/user/AddressForm.jsx';
import { CartProvider } from './context/CartContext.jsx';
import CartPage from './pages/homepage/CartPage.jsx';

// Layout wrapper component for general and user routes
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  // Log current path and admin status for debugging
  useEffect(() => {
    console.log("Current Path:", location.pathname);
    console.log("Is Admin View:", isAdminPath);
  }, [location]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Display sidebar on admin paths */}
      {isAdminPath && <Sidebar />} 
      <div style={{ flex: 1, background: isAdminPath ? '#deebf7' : '#ffffff' }}>
        {children}
      </div>
    </div>
  );
};

// Main application component that sets up routing for admin, user, and seller sections

function App() {
  return (
    <CartProvider>                                      
      <Router>
        <Routes>
          {/* Public and user routes */}
          <Route path="/" element={<LayoutWrapper><HomePage /></LayoutWrapper>} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/home" element={<LayoutWrapper><CustomerHome /></LayoutWrapper>} />
          <Route path="/login" element={<LayoutWrapper><Login /></LayoutWrapper>} />
          <Route path='/verify' element={<LayoutWrapper><Verify /></LayoutWrapper>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/test-address" element={<LayoutWrapper><AddressForm /></LayoutWrapper>} />

          {/* Seller routes */}
          <Route path="/seller" element={<LayoutWrapper><SellerDashboard /></LayoutWrapper>} />

          {/* Admin routes using AdminLayout for sidebar and styling */}
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

          {/* Catch-all route that redirects to home page */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </Router>
    </CartProvider>                                     
  );
}

export default App;