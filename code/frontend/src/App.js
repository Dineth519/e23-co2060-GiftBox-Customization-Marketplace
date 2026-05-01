// Core libraries and routing
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Public and user pages
import HomePage from './pages/homepage/HomePage.jsx';
import HowItWorksPage from './pages/homepage/HowItWorksPage.jsx';
import AboutUsPage from './pages/homepage/AboutUsPage.jsx';
import CustomerHome from './pages/user/CustomerHome.jsx';
import Verify from './pages/user/Verify.jsx';
import VendorLanding from './pages/homepage/VendorLanding.jsx';

//Customer
import GiftCustomizer from './pages/user/GiftCustomizer.jsx';
import CustomerOrders from './pages/user/Orders.jsx';
import OrderDetail from './pages/user/OrderDetail.jsx';
import Profile from './pages/user/Profile.jsx';

// Authentication pages
import Login from './pages/auth/Login.jsx';
import VendorRegistration from './pages/auth/VendorRegistration.jsx';

// Admin components and pages
import Sidebar from './components/admin/Sidebar.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Partners from './pages/admin/Partners.jsx';
import PendingPartners from './pages/admin/PendingPartners.jsx';
import Customers from './pages/admin/Customers.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Settings from './pages/admin/Settings.jsx';
import StaffManagement from './pages/admin/StaffManagement.jsx';

// Seller components and pages
import SellerDashboard from './pages/seller/SellerDashboard.jsx';
import SellerLayout from './layouts/SellerLayout.jsx';
import MyItems from './pages/seller/MyItems.jsx';
import AddItems from './pages/seller/AddItems.jsx';
import Orders from './pages/seller/Orders.jsx';
import SellerSettings from './pages/seller/Settings.jsx';

// Homepage
import ProductsPage from './pages/homepage/ProductsPage.jsx';
import AddressForm from './components/user/AddressForm.jsx';
import { CartProvider } from './context/CartContext.jsx';
import CartPage from './pages/homepage/CartPage.jsx';

// Box Builder
import BoxBuilderPage from './pages/box_build/BoxBuilderPage.jsx';

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
          <Route path="/how-it-works" element={<LayoutWrapper><HowItWorksPage /></LayoutWrapper>} />
          <Route path="/about-us" element={<LayoutWrapper><AboutUsPage /></LayoutWrapper>} />
          <Route path="/home" element={<LayoutWrapper><CustomerHome /></LayoutWrapper>} />
          <Route path="/login" element={<LayoutWrapper><Login /></LayoutWrapper>} />
          <Route path="/vendor-landing" element={<VendorLanding />} />
          <Route path="/vendor-register" element={<VendorRegistration />} />
          <Route path='/verify' element={<LayoutWrapper><Verify /></LayoutWrapper>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/test-address" element={<LayoutWrapper><AddressForm /></LayoutWrapper>} />

          {/* Customer routes */}
          <Route path="/customize" element={<LayoutWrapper><GiftCustomizer /></LayoutWrapper>} />
          <Route path="/orders" element={<LayoutWrapper><Orders /></LayoutWrapper>} />
          <Route path="/orders/:orderId" element={<LayoutWrapper><OrderDetail /></LayoutWrapper>} />
          <Route path="/profile" element={<LayoutWrapper><Profile /></LayoutWrapper>} />
          <Route path="/build-box" element={<BoxBuilderPage />} />

          {/* Seller routes */}
          <Route path="/seller/*" element={
            <SellerLayout>
              <Routes>
                <Route path="/" element={<SellerDashboard />} />
                <Route path="my-items" element={<MyItems />} />
                <Route path="add-items" element={<AddItems />} />
                <Route path="orders" element={<Orders />} />
                <Route path="settings" element={<SellerSettings />} />
              </Routes>
            </SellerLayout>
          } />

          {/* Admin routes using AdminLayout for sidebar and styling */}
          <Route path="/admin/*" element={
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="partners" element={<Partners />} />
                <Route path="partners/pending" element={<PendingPartners />} />
                <Route path="customers" element={<Customers />} />
                <Route path="settings" element={<Settings />} />
                <Route path="staff-management" element={<StaffManagement />} />
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