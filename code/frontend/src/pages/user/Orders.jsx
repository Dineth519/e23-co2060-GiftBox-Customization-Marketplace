// pages/user/Orders.jsx
// Route: /customer/orders
// GET /api/orders/customer — session based, returns Order[]
// Theme: dark navy + gold

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Orders.css';

// ── Status config ─────────────────────────────────────────────────────────────
const statusConfig = {
  'PENDING'          : { color: '#EF9F27', bg: 'rgba(239,159,39,0.1)',  emoji: '🕐', label: 'Pending'           },
  'CONFIRMED'        : { color: '#378ADD', bg: 'rgba(55,138,221,0.1)',  emoji: '⚙️', label: 'Confirmed'         },
  'OUT_FOR_DELIVERY' : { color: '#7F77DD', bg: 'rgba(127,119,221,0.1)', emoji: '🚚', label: 'Out for Delivery'  },
  'DELIVERED'        : { color: '#1D9E75', bg: 'rgba(29,158,117,0.1)',  emoji: '✅', label: 'Delivered'         },
  'CANCELLED'        : { color: '#E24B4A', bg: 'rgba(226,75,74,0.1)',   emoji: '❌', label: 'Cancelled'         },
};

const TAB_STATUSES = ['All', 'PENDING', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export default function Orders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [filter,  setFilter]  = useState('All');
  const navigate = useNavigate();

  // ── Fetch orders from backend ─────────────────────────────────────────────
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('http://localhost:8080/api/orders/customer', {
          credentials: 'include',  // session cookie
        });

        if (res.status === 401) {
          // Not logged in — redirect to login
          navigate('/login');
          return;
        }

        if (!res.ok) throw new Error(`Server error ${res.status}`);

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredOrders = filter === 'All'
    ? orders
    : orders.filter(o => o.status === filter);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="orders-page">

      {/* Header */}
      <div className="orders-header">
        <div>
          <h1 className="orders-title">My Orders</h1>
          <p className="orders-subtitle">Track and manage your gift box orders</p>
        </div>
        <button className="orders-new-btn" onClick={() => navigate('/customer/customize')}>
          🎁 Build New Box
        </button>
      </div>

      {/* Filter tabs */}
      <div className="orders-tabs">
        {TAB_STATUSES.map(tab => (
          <button
            key={tab}
            className={`orders-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab === 'All' ? 'All' : (statusConfig[tab]?.label ?? tab)}
            {tab === 'All' && (
              <span className="orders-tab-count">{orders.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="orders-loading">
          <div className="orders-spinner" />
          <p>Loading your orders…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="orders-empty">
          <div className="orders-empty-emoji">⚠️</div>
          <h3>Could not load orders</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="orders-empty">
          <div className="orders-empty-emoji">📦</div>
          <h3>No orders found</h3>
          <p>
            {filter === 'All'
              ? "You haven't placed any orders yet."
              : `No orders with status "${statusConfig[filter]?.label ?? filter}".`}
          </p>
          <button className="orders-new-btn" onClick={() => navigate('/customer/customize')}>
            Start Your First Box
          </button>
        </div>
      )}

      {/* Orders list */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const cfg = statusConfig[order.status] ?? statusConfig['PENDING'];

            return (
              <div
                key={order.id ?? order.orderId}
                className="order-card"
                onClick={() => navigate(`/customer/orders/${order.id ?? order.orderId}`)}
              >
                {/* Top row */}
                <div className="order-card-top">
                  <div className="order-id-group">
                    <span className="order-id">#{order.id ?? order.orderId}</span>
                    <span className="order-date">{formatDate(order.createdAt ?? order.orderDate)}</span>
                  </div>
                  <span className="order-status" style={{ color: cfg.color, background: cfg.bg }}>
                    {cfg.emoji} {cfg.label}
                  </span>
                </div>

                {/* Items */}
                {order.items && order.items.length > 0 && (
                  <div className="order-items-row">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="order-item-pill">
                        {item.name}
                        {item.quantity > 1 && (
                          <span className="order-item-qty">×{item.quantity}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom row */}
                <div className="order-card-bottom">
                  <div className="order-meta">
                    {order.deliveryAddress && (
                      <span className="order-meta-item">📍 {order.deliveryAddress}</span>
                    )}
                    {order.specialNotes && (
                      <span className="order-meta-item">
                        💬 "{order.specialNotes.slice(0, 30)}{order.specialNotes.length > 30 ? '…' : ''}"
                      </span>
                    )}
                  </div>
                  <div className="order-total">
                    LKR {Number(order.totalAmount ?? order.total ?? 0).toLocaleString()}
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