import React, { useState, useEffect, useMemo } from 'react';
import { FaBoxOpen, FaCoins, FaRegStickyNote, FaUser } from 'react-icons/fa';
import {
  filterVendorOrders,
  resolveVendorOrderImageUrl,
  vendorOrderStats,
} from '../../utils/vendorOrderUtils';
import { updateVendorOrderStatus } from '../../utils/vendorApi';
import './Orders.css';
import './CreateGiftBox.css'; // Import CreateGiftBox CSS for the common header layout
// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = `${process.env.REACT_APP_API_URL}/api`;

// Status progression order as defined in the database
const STATUS_ORDER = ['PENDING_VENDOR_ACCEPTANCE', 'ACCEPTED_BY_VENDOR', 'SENT_TO_ASSEMBLY'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name) {
  if (!name) return '??';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function fmtLKR(n) {
  return Number(n || 0).toLocaleString('en-LK');
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatCard({ label, value, badge, badgeType }) {
  return (
    <div className="orders-stat-card">
      <div className="orders-stat-label">{label}</div>
      <div className="orders-stat-value">{value}</div>
      {badge && <div className={`orders-stat-badge badge-${badgeType}`}>{badge}</div>}
    </div>
  );
}

function StatusPill({ status }) {
  const label = (status || 'Pending')
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return <span className={`orders-status-pill status-${status?.toLowerCase()}`}>{label}</span>;
}

function Avatar({ name, index }) {
  const AVATAR_BG = ['#e8b84b', '#4a90d9', '#e07b5a', '#5ab88a', '#9b7ee0'];
  const i = index % AVATAR_BG.length;
  return (
    <div className="orders-avatar" style={{ background: AVATAR_BG[i], color: '#fff' }}>
      {initials(name)}
    </div>
  );
}

function OrderItemImage({ item }) {
  const [failed, setFailed] = useState(false);
  if (!item.imageUrl || failed) {
    return <div className="orders-modal-item-img-placeholder"><FaBoxOpen /></div>;
  }
  return (
    <img
      src={resolveVendorOrderImageUrl(item.imageUrl)}
      alt={item.name || 'Order item'}
      className="orders-modal-item-img"
      onError={() => setFailed(true)}
    />
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange }) {
  if (!order) return null;

  // Get the current step index to highlight the timeline correctly
  const step = STATUS_ORDER.indexOf(order.status);
  const timelineSteps = ['Order received', 'Accepted', 'Sent to assembly'];

  return (
    <div className="orders-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal">
        <div className="orders-modal-head">
          <div className="orders-modal-head-left">
            <div className="orders-modal-heading">
              <span className="orders-modal-eyebrow">Order details</span>
              <span className="orders-modal-id">Order #{order.order_id}</span>
            </div>
            <StatusPill status={order.status} />
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="orders-modal-body">
          <div className="orders-modal-section">
            <div className="orders-modal-section-title">Order Info</div>
            <div className="orders-modal-summary-grid">
              <div className="orders-modal-summary-card">
                <span className="orders-modal-summary-icon"><FaUser /></span>
                <span className="orders-modal-summary-copy">
                  <span className="orders-modal-info-label">Customer</span>
                  <strong className="orders-modal-info-val">{order.customer_name || 'Customer'}</strong>
                </span>
              </div>
              <div className="orders-modal-summary-card">
                <span className="orders-modal-summary-icon"><FaCoins /></span>
                <span className="orders-modal-summary-copy">
                  <span className="orders-modal-info-label">Vendor total</span>
                  <strong className="orders-modal-info-val">LKR {fmtLKR(order.total_amount)}</strong>
                </span>
              </div>
              <div className="orders-modal-summary-card orders-modal-summary-card--wide">
                <span className="orders-modal-summary-icon"><FaRegStickyNote /></span>
                <span className="orders-modal-summary-copy">
                  <span className="orders-modal-info-label">Special notes</span>
                  <strong className="orders-modal-info-val">{order.special_notes || 'No special notes provided'}</strong>
                </span>
              </div>
            </div>
          </div>

          {order.items && order.items.length > 0 && (
            <div className="orders-modal-section">
              <div className="orders-modal-section-title">Order Items</div>
              <div className="orders-modal-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="orders-modal-item">
                    <OrderItemImage item={item} />
                    <div className="orders-modal-item-details">
                      <span className="orders-modal-item-name">{item.name}</span>
                      <span className="orders-modal-item-qty">Quantity · {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="orders-modal-section">
            <div className="orders-modal-section-title">Order Timeline</div>
            {order.status === 'CANCELLED' ? (
              <div className="orders-cancelled-notice">This order has been cancelled.</div>
            ) : (
              <div className="orders-timeline">
                {timelineSteps.map((s, j) => (
                  <div className={`orders-tl-step ${j < step ? 'done-line' : ''}`} key={j}>
                    <div className={`orders-tl-dot ${j < step ? 'done' : j === step ? 'current' : 'todo'}`}>
                      {j <= step ? '✓' : ''}
                    </div>
                    <div className="orders-tl-label">{s}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {order.status === 'PENDING_VENDOR_ACCEPTANCE' && (
            <div className="orders-modal-section">
              <div className="orders-modal-section-title">Update Status</div>
              <div className="orders-status-btns">
                <button className="orders-status-update-btn" onClick={() => onStatusChange(order.sub_order_id, 'ACCEPTED_BY_VENDOR')}>
                  Confirm Order
                </button>
                <button className="orders-status-update-btn cancel-btn" onClick={() => onStatusChange(order.sub_order_id, 'REJECTED')}>
                  Reject Order
                </button>
              </div>
            </div>
          )}
          {order.status === 'ACCEPTED_BY_VENDOR' && (
            <div className="orders-modal-section">
              <div className="orders-modal-section-title">Send items</div>
              <div className="orders-status-btns">
                <button className="orders-status-update-btn" onClick={() => onStatusChange(order.sub_order_id, 'SENT_TO_ASSEMBLY')}>
                  Mark Sent to Assembly
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const PER_PAGE = 8;

  // 1. Fetch orders from backend using the logged-in seller's userId from localStorage
  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Read the logged-in vendor's userId from localStorage
      const sellerId = localStorage.getItem('userId');

      if (!sellerId) {
        console.warn('No userId found in localStorage. Please login again.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/vendors/${sellerId}/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Handle Status Change (Accept/Cancel)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateVendorOrderStatus(id, newStatus);

      setOrders(prev => prev.map(o => o.sub_order_id === id ? { ...o, status: newStatus } : o));
      setSelected(null);
      setToast(`Order #${id} marked as ${newStatus}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      alert("Error updating status");
    }
  };

  // ── Filtered + paginated data ──
  const filtered = useMemo(() => {
    return filterVendorOrders(orders, filter, search);
  }, [orders, filter, search]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const pageSlice = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = useMemo(() => vendorOrderStats(orders), [orders]);

  return (
    <div className="vendor-orders-page">
      <div className="cgb-top-bar" style={{ marginBottom: '24px' }}>
        <div className="cgb-top-left">
          <div className="cgb-title-wrap">
            <h2>Order Management</h2>
            <p>Track, filter and update all your customer orders</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="orders-stats-row">
        <StatCard label="Total Orders" value={stats.total} badge="All time" badgeType="neutral" />
        <StatCard label="Pending" value={stats.pending} badge="Needs attention" badgeType="warning" />
        <StatCard label="Delivered" value={stats.delivered} badge={`${stats.total > 0 ? Math.round(stats.delivered / stats.total * 100) : 0}% rate`} badgeType="success" />
        <StatCard label="Revenue (LKR)" value={fmtLKR(stats.revenue)} badge="+15.3% vs yesterday" badgeType="success" />
      </div>

      {/* Toolbar */}
      <div className="orders-toolbar">
        <input
          className="orders-search-input"
          type="text"
          placeholder="Search by order ID or customer name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="orders-filter-tabs">
          {[
            { id: 'All', label: 'All' },
            { id: 'PENDING_VENDOR_ACCEPTANCE', label: 'Pending Acceptance' },
            { id: 'ACCEPTED_BY_VENDOR', label: 'Accepted' },
            { id: 'SENT_TO_ASSEMBLY', label: 'Sent to Assembly' },
            { id: 'REJECTED', label: 'Rejected' }
          ].map(f => (
            <button key={f.id} className={`orders-filter-tab ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="orders-table-wrap">
        {loading ? (
          <div className="orders-empty">Loading orders...</div>
        ) : pageSlice.length === 0 ? (
          <div className="orders-empty">No orders match your filters</div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Date</th>
                <th>Total (LKR)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((order, i) => (
                <tr key={order.sub_order_id} className={`orders-table-row ${order.status === 'PENDING_VENDOR_ACCEPTANCE' ? 'orders-row-pending-special' : ''}`}>
                  <td className="orders-order-id">#{order.order_id}</td>
                  <td>{order.customer_name}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="orders-total-cell">{fmtLKR(order.total_amount)}</td>
                  <td><StatusPill status={order.status} /></td>
                  <td>
                    <button className="orders-action-btn view" onClick={() => setSelected(order)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <OrderModal order={selectedOrder} onClose={() => setSelected(null)} onStatusChange={handleStatusChange} />
      {toast && <div className="orders-toast">{toast}</div>}
    </div>
  );
};

export default Orders;
