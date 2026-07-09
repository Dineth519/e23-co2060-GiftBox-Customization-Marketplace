// CustomerLayout.jsx
// This is the wrapper layout for all logged-in customer pages.
// It works exactly like SellerLayout — it wraps the Header on top
// and the page content in the middle.
//
// Every customer page (GiftCustomizer, Orders, OrderDetail, Profile)
// will be wrapped by this layout automatically through the router.

import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';  // Outlet renders the current page
import Header from '../components/customer/Header';
import Footer from '../components/landingpage/Footer';

export default function CustomerLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header shown at top of every customer page */}
      <Header />

      {/* Outlet renders whichever customer page is active:
          /customize  → GiftCustomizer
          /orders     → Orders
          /orders/:id → OrderDetail
          /profile    → Profile */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer shown at bottom of every customer page */}
      <Footer />

    </div>
  );
}