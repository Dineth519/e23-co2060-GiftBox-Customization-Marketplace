// CustomerLayout.jsx
// This is the wrapper layout for all logged-in customer pages.
// It works exactly like SellerLayout — it wraps the Header on top
// and the page content in the middle.
//
// Every customer page (BoxBuilderPage, Orders, OrderDetail, Profile)
// will be wrapped by this layout automatically through the router.

import React, { useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';  // Outlet renders the current page
import Header from '../components/customer/Header';
import Footer from '../components/landingpage/Footer';
import './CustomerWorkspace.css';

const workspacePages = {
  '/customer/build-box': { label: 'YOUR GIFT STUDIO', title: 'Build something thoughtful.', description: 'Choose the little details. We’ll bring them together in one beautiful box.' },
  '/customer/orders': { label: 'YOUR GIFTING JOURNEY', title: 'Every gift, in one place.', description: 'Follow your deliveries, revisit your favourites, and keep track of every thoughtful gesture.' },
  '/customer/settings': { label: 'YOUR ACCOUNT', title: 'Make yourself at home.', description: 'Manage your personal details, delivery addresses, and account security.' },
  '/customer/about-us': { label: 'THE PEOPLE BEHIND THE BOX', title: 'Thoughtful gifting. Made together.', description: 'Meet Team Nexus and discover the story behind Giftora.' },
};

export default function CustomerLayout() {
  const location = useLocation();
  const page = workspacePages[location.pathname.replace(/\/$/, '')];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  const userRole = localStorage.getItem('role');
  const userId = localStorage.getItem('userId');

  // Route Guard: Redirect to landing page if user is not authorized as a customer
  if (!userId || userRole !== 'CUSTOMER') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className={`customer-workspace${page ? ' customer-workspace--headed' : ''}`} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header shown at top of every customer page */}
      <Header />

      {/* Outlet renders whichever customer page is active:
          /build-box  → BoxBuilderPage
          /orders     → Orders
          /orders/:id → OrderDetail
          /profile    → Profile */}
      <main style={{ flex: 1, paddingTop: '64px' }}>
        {page && <section className="workspace-heading">
          <div className="workspace-heading__inner">
            <div className="workspace-heading__row">
              <div><p className="workspace-eyebrow">{page.label}</p><h1>{page.title}</h1><p className="workspace-description">{page.description}</p></div>

            </div>
          </div>
        </section>}
        <Outlet />
      </main>

      {/* Footer shown at bottom of every customer page */}
      <Footer customer />

    </div>
  );
}
