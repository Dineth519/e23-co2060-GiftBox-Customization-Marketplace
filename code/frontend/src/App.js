// Core libraries and routing
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Public and user pages
import LandingPage from './pages/landingpage/LandingPage.jsx';
import AboutUsPage from './pages/landingpage/AboutUsPage.jsx';
import CustomerHome from './pages/customer/CustomerHome.jsx';
import Verify from './pages/customer/Verify.jsx';
import VendorLanding from './pages/landingpage/VendorLanding.jsx';
import ProductsPage from './pages/landingpage/ProductsPage.jsx';
import CartPage from './pages/landingpage/CartPage.jsx';
import AddressForm from './components/user/AddressForm.jsx';
import BoxBuilderPage from './pages/box_build/BoxBuilderPage.jsx';

// Customer
import GiftCustomizer from './pages/customer/GiftCustomizer.jsx';
import CustomerOrders from './pages/customer/Orders.jsx';
import OrderDetail from './pages/customer/OrderDetail.jsx';
import CustomerLayout from './layouts/CustomerLayout.jsx';  
import CustomerCart from './pages/customer/CustomerCart.jsx';
import CustomerProfile from './pages/customer/Profile.jsx';
import AboutUs from './pages/customer/AboutUsPage.jsx';
import BoxBuilder from './pages/customer/BoxBuilderPage.jsx';
import Checkout from './pages/customer/Checkout.jsx';
import CustomerSettings from './pages/customer/Settings.jsx';

// Authentication pages
import Login from './pages/auth/Login.jsx';
import VendorRegistration from './pages/auth/VendorRegistration.jsx';

// Admin components and pages
import Sidebar from './components/admin/Sidebar.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Vendors from './pages/admin/Vendors.jsx';
import PendingVendors from './pages/admin/PendingVendors.jsx';
import Customers from './pages/admin/Customers.jsx';
import Dashboard from './pages/admin/Dashboard.jsx';
import Settings from './pages/admin/Settings.jsx';
import StaffManagement from './pages/admin/StaffManagement.jsx';

// Vendor components and pages
import VendorDashboard from './pages/vendor/VendorDashboard.jsx';
import VendorLayout from './layouts/VendorLayout.jsx';
import MyItems from './pages/vendor/MyItems.jsx';
import AddItems from './pages/vendor/AddItems.jsx';
import Orders from './pages/vendor/Orders.jsx';
import VendorSettings from './pages/vendor/Settings.jsx';
import CreateGiftBox from './pages/vendor/CreateGiftBox.jsx';

// Context
import { CartProvider } from './context/CartContext.jsx';

// Scroll to top helper on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout wrapper component for general and user routes
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {isAdminPath && <Sidebar />} 
      <div style={{ flex: 1, background: isAdminPath ? '#deebf7' : '#ffffff' }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <CartProvider>                                      
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public and user routes */}
          <Route path="/" element={<LayoutWrapper><LandingPage /></LayoutWrapper>} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/about-us" element={<LayoutWrapper><AboutUsPage /></LayoutWrapper>} />
          <Route path="/home" element={<LayoutWrapper><CustomerHome /></LayoutWrapper>} />
          <Route path="/login" element={<LayoutWrapper><Login /></LayoutWrapper>} />
          <Route path="/vendor-landing" element={<VendorLanding />} />
          <Route path="/vendor-register" element={<VendorRegistration />} />
          <Route path="/verify" element={<LayoutWrapper><Verify /></LayoutWrapper>} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/build-box" element={<BoxBuilderPage />} />
          <Route path="/test-address" element={<LayoutWrapper><AddressForm /></LayoutWrapper>} />

          {/* Customer routes */}
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<Navigate to="home" replace />} />
            <Route path="home" element={<CustomerHome />} />
            <Route path="customize" element={<GiftCustomizer />} />
            <Route path="orders" element={<CustomerOrders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="cart" element={<CustomerCart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="about-us" element={<AboutUs />} />
            <Route path="build-box" element={<BoxBuilder />} />
            <Route path="settings" element={<CustomerSettings />} />
          </Route>

          {/* Vendor routes */}
          <Route path="/vendor" element={<VendorLayout />}>
            <Route index element={<VendorDashboard />} />
            <Route path="create-box" element={<CreateGiftBox />} />
            <Route path="my-items" element={<MyItems />} />
            <Route path="add-items" element={<AddItems />} />
            <Route path="orders" element={<Orders />} />
            <Route path="settings" element={<VendorSettings />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="vendors/pending" element={<PendingVendors />} />
            <Route path="customers" element={<Customers />} />
            <Route path="settings" element={<Settings />} />
            <Route path="staff-management" element={<StaffManagement />} />
          </Route>

          {/* Catch-all route that redirects to home page */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </CartProvider>                                      
  );
}

export default App;