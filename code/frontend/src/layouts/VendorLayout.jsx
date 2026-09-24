// Core library
import React, { useEffect, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';

// Vendor components
import Sidebar from '../components/vendor/Sidebar';
import TopBar from '../components/vendor/TopBar';

// Stylesheet
import './AdminLayout.css';

const VendorLayout = () => {
  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');
  const location = useLocation();
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  // Route Guard: Redirect to login if user is not authorized as a vendor
  if (!userId || (userRole !== 'VENDOR' && userRole !== 'SELLER' && userRole !== 'PARTNER')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      {/* Top navigation bar */}
      <TopBar />

      <div className="layout-wrapper">
        {/* Sidebar navigation */}
        <Sidebar />

        {/* Main content area */}
        <main className="main-content" ref={mainContentRef}>
          {/* Child Route Components will be rendered here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;