// Orders.jsx
// This page shows the logged-in customer's past and current orders.
// Customer can see: order date, items, total price, and delivery status.
// They can also click on any order to see full details (OrderDetail page).

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
// This is fake/sample data so the page works without a backend.
// Later, replace this with a real API call to Spring Boot:
// GET /api/orders/customer/{customerId}

const sampleOrders = [
  {
    id: 'ORD-1001',
    date: '2026-04-20',
    status: 'Delivered',
    items: [
      { name: 'Chocolate Box', emoji: '🍫', qty: 2 },
      { name: 'Scented Candle', emoji: '🕯️', qty: 1 },
    ],
    ribbonColor: 'Gold',
    boxSize: 'Medium',
    message: 'Happy Birthday!',
    total: 2480,
  },
  {
    id: 'ORD-1002',
    date: '2026-04-25',
    status: 'Out for Delivery',
    items: [
      { name: 'Teddy Bear', emoji: '🧸', qty: 1 },
      { name: 'Dried Flowers', emoji: '💐', qty: 1 },
      { name: 'Cookie Tin', emoji: '🍪', qty: 1 },
    ],
    ribbonColor: 'Rose',
    boxSize: 'Large',
    message: 'Thinking of you!',
    total: 3310,
  },
  {
    id: 'ORD-1003',
    date: '2026-04-28',
    status: 'Processing',
    items: [
      { name: 'Wine Bottle', emoji: '🍷', qty: 1 },
      { name: 'Ceramic Mug', emoji: '☕', qty: 2 },
    ],
    ribbonColor: 'Ruby',
    boxSize: 'Medium',
    message: '',
    total: 4180,
  },
  {
    id: 'ORD-1004',
    date: '2026-04-29',
    status: 'Pending',
    items: [
      { name: 'Spa Kit', emoji: '🧴', qty: 1 },
      { name: 'Tea Collection', emoji: '🍵', qty: 1 },
    ],
    ribbonColor: 'Teal',
    boxSize: 'Small',
    message: 'Relax and enjoy!',
    total: 1870,
  },
];

// ─── STATUS CONFIG ────────────────────────────────────────────────────────────
// Each status has a colour and an emoji for easy visual reading
const statusConfig = {
  'Pending':          { color: '#EF9F27', bg: 'rgba(239,159,39,0.1)',  emoji: '🕐' },
  'Processing':       { color: '#378ADD', bg: 'rgba(55,138,221,0.1)',  emoji: '⚙️' },
  'Out for Delivery': { color: '#7F77DD', bg: 'rgba(127,119,221,0.1)', emoji: '🚚' },
  'Delivered':        { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)',  emoji: '✅' },
  'Cancelled':        { color: '#E24B4A', bg: 'rgba(226,75,74,0.1)',   emoji: '❌' },
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Orders() {
  // orders — list of orders to display
  // starts empty, gets filled by the API call in useEffect
  const [orders, setOrders] = useState([]);

  // loading — true while waiting for API response
  const [loading, setLoading] = useState(true);

  // filter — which status tab is active ('All', 'Pending', 'Delivered' etc.)
  const [filter, setFilter] = useState('All');

  // navigate — used to go to OrderDetail page when order is clicked
  const navigate = useNavigate();

  // ── Fetch orders from Spring Boot API ──────────────────────────────────────
  // useEffect runs once when the page first loads.
  // It calls your Spring Boot backend to get the customer's orders.
  useEffect(() => {
    async function fetchOrders() {
      try {
        // TODO: replace with your real Spring Boot URL
        // Also add Authorization header if you use JWT tokens:
        // headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        const response = await fetch('http://localhost:8080/api/orders/customer', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // If API responds successfully, use real data
          const data = await response.json();
          setOrders(data);
        } else {
          // If API fails, fall back to sample data so page still works
          console.warn('API not available, using sample data');
          setOrders(sampleOrders);
        }
      } catch (error) {
        // If backend is not running yet, use sample data
        console.error('Orders API error:', error);
        setOrders(sampleOrders);
      } finally {
        // Always stop the loading spinner whether API worked or not
        setLoading(false);
      }
    }

    fetchOrders();
  }, []); // empty [] means: run this only once when page loads

  // ── Filter orders based on active tab ─────────────────────────────────────
  // If filter is 'All', show everything.
  // Otherwise only show orders matching the selected status.
  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter((order) => order.status === filter);

  // ── Format date nicely ─────────────────────────────────────────────────────
  // Converts '2026-04-20' → 'April 20, 2026'
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="orders-page">

      {/* ── Page Header ── */}
      <div className="orders-header">
        <div>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">
            Track and manage your gift box orders
          </p>
        </div>

        {/* Button to go start a new order */}
        <button
          className="orders-new-btn"
          onClick={() => navigate('/customize')}
        >
          🎁 Build New Box
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      {/* These tabs let customer filter by order status */}
      <div className="orders-tabs">
        {['All', 'Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            className={`orders-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
            {/* Show count badge on 'All' tab */}
            {tab === 'All' && (
              <span className="orders-tab-count">{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Loading State ── */}
      {/* Shown while waiting for API response */}
      {loading && (
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Loading your orders...</p>
        </div>
      )}

      {/* ── Empty State ── */}
      {/* Shown when customer has no orders or filter matches nothing */}
      {!loading && filteredOrders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-emoji">📦</div>
          <h3>No orders found</h3>
          <p>
            {filter === 'All'
              ? "You haven't placed any orders yet."
              : `No orders with status "${filter}".`}
          </p>
          <button
            className="orders-new-btn"
            onClick={() => navigate('/customize')}
          >
            Start Your First Box
          </button>
        </div>
      )}

      {/* ── Orders List ── */}
      {/* Renders one card per order */}
      {!loading && filteredOrders.length > 0 && (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            // Get the colour/emoji config for this order's status
            const statusStyle = statusConfig[order.status] || statusConfig['Pending'];

            return (
              <div
                key={order.id}
                className="order-card"
                // Clicking the card navigates to OrderDetail page
                // passing the order id in the URL: /orders/ORD-1001
                onClick={() => navigate(`/orders/${order.id}`)}
              >

                {/* ── Card Top Row: Order ID + Status ── */}
                <div className="order-card-top">
                  <div className="order-id-group">
                    <span className="order-id">{order.id}</span>
                    <span className="order-date">{formatDate(order.date)}</span>
                  </div>
                  {/* Status badge with dynamic colour */}
                  <span
                    className="order-status"
                    style={{
                      color: statusStyle.color,
                      background: statusStyle.bg,
                    }}
                  >
                    {statusStyle.emoji} {order.status}
                  </span>
                </div>

                {/* ── Card Middle: Items list ── */}
                <div className="order-items-row">
                  {order.items.map((item, idx) => (
                    <span key={idx} className="order-item-pill">
                      {item.emoji} {item.name}
                      {item.qty > 1 && <span className="order-item-qty">×{item.qty}</span>}
                    </span>
                  ))}
                </div>

                {/* ── Card Bottom: Box details + Total ── */}
                <div className="order-card-bottom">
                  <div className="order-meta">
                    <span className="order-meta-item">📦 {order.boxSize}</span>
                    <span className="order-meta-item">🎀 {order.ribbonColor}</span>
                    {order.message && (
                      <span className="order-meta-item">
                        💬 "{order.message.slice(0, 25)}{order.message.length > 25 ? '…' : ''}"
                      </span>
                    )}
                  </div>
                  <div className="order-total">
                    Rs {order.total.toLocaleString()}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}