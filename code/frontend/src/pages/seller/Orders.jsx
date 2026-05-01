import React, { useState, useMemo } from 'react';
import './Orders.css';

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_ORDERS = [
  { id: 'GFT-1101', customer: 'Amara Pereira',      phone: '+94 77 123 4567', address: '12 Galle Rd, Colombo 3',        items: [{ name: 'Birthday Box', qty: 1, price: 5500 }, { name: 'Candles Pack', qty: 2, price: 1475 }], date: 'Apr 29, 2026', status: 'Pending'    },
  { id: 'GFT-1100', customer: 'Dilshan Raj',         phone: '+94 71 234 5678', address: '45 Kandy Rd, Peradeniya',       items: [{ name: 'Anniversary Kit', qty: 1, price: 12000 }],                                          date: 'Apr 29, 2026', status: 'Processing' },
  { id: 'GFT-1099', customer: 'Nisha Fernando',      phone: '+94 76 345 6789', address: '7 Temple St, Kandy',            items: [{ name: 'Hamper Deluxe', qty: 1, price: 14500 }, { name: 'Gold Ribbon', qty: 1, price: 250 }], date: 'Apr 28, 2026', status: 'Shipped'    },
  { id: 'GFT-1098', customer: 'Kasun Silva',          phone: '+94 70 456 7890', address: '23 Main St, Negombo',           items: [{ name: 'Baby Shower Set', qty: 1, price: 9200 }],                                           date: 'Apr 28, 2026', status: 'Delivered'  },
  { id: 'GFT-1097', customer: 'Tharushi Mendis',     phone: '+94 72 567 8901', address: '88 Union Pl, Colombo 2',        items: [{ name: 'Corporate Gift Pack', qty: 5, price: 8500 }],                                       date: 'Apr 27, 2026', status: 'Delivered'  },
  { id: 'GFT-1096', customer: 'Rohan Wijetunga',     phone: '+94 77 678 9012', address: '3 Lake Dr, Kandy',              items: [{ name: 'Chocolate Tower', qty: 1, price: 5600 }],                                           date: 'Apr 27, 2026', status: 'Cancelled'  },
  { id: 'GFT-1095', customer: 'Priya Kumari',         phone: '+94 71 789 0123', address: '19 Sea View, Galle',            items: [{ name: 'Flower Basket', qty: 1, price: 4200 }, { name: 'Greeting Card', qty: 2, price: 1300 }], date: 'Apr 26, 2026', status: 'Delivered'  },
  { id: 'GFT-1094', customer: 'Akila Jayawardena',   phone: '+94 74 890 1234', address: '56 Railway Ave, Colombo 6',     items: [{ name: 'New Year Gift Box', qty: 1, price: 11300 }],                                        date: 'Apr 26, 2026', status: 'Delivered'  },
  { id: 'GFT-1093', customer: 'Shalini Bandara',     phone: '+94 76 901 2345', address: '2 Hanthana Rd, Kandy',          items: [{ name: 'Spa Wellness Kit', qty: 1, price: 18900 }],                                         date: 'Apr 25, 2026', status: 'Shipped'    },
  { id: 'GFT-1092', customer: 'Malith Gunasekara',   phone: '+94 78 012 3456', address: '101 Baseline Rd, Colombo 9',   items: [{ name: 'Office Bundle', qty: 3, price: 7800 }],                                             date: 'Apr 25, 2026', status: 'Processing' },
  { id: 'GFT-1091', customer: 'Chamari Senanayake',  phone: '+94 70 123 4567', address: '14 Queen St, Matale',           items: [{ name: 'Love Hamper', qty: 1, price: 7750 }],                                              date: 'Apr 24, 2026', status: 'Pending'    },
  { id: 'GFT-1090', customer: 'Binura Wickramasinghe', phone: '+94 72 234 5678', address: '38 Dutugemunu St, Homagama', items: [{ name: "Kids Party Box", qty: 2, price: 7100 }],                                            date: 'Apr 24, 2026', status: 'Delivered'  },
];

const STATUS_ORDER = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const AVATAR_BG    = ['#e8b84b', '#4a90d9', '#e07b5a', '#5ab88a', '#9b7ee0', '#e05a7b'];
const AVATAR_FG    = ['#1a2340', '#fff',     '#fff',    '#fff',    '#fff',    '#fff'   ];

const PER_PAGE = 8;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}
function orderTotal(items) {
  return items.reduce((s, i) => s + i.price * i.qty, 0);
}
function fmtLKR(n) {
  return n.toLocaleString('en-LK');
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
  return <span className={`orders-status-pill status-${status.toLowerCase()}`}>{status}</span>;
}

function Avatar({ name, index }) {
  const i = index % AVATAR_BG.length;
  return (
    <div
      className="orders-avatar"
      style={{ background: AVATAR_BG[i], color: AVATAR_FG[i] }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Order Detail Modal ───────────────────────────────────────────────────────
function OrderModal({ order, index, onClose, onStatusChange }) {
  if (!order) return null;

  const step = STATUS_ORDER.indexOf(order.status); // -1 if Cancelled
  const timelineSteps = ['Order Placed', 'Processing', 'Shipped', 'Delivered'];

  return (
    <div className="orders-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="orders-modal">
        {/* Header */}
        <div className="orders-modal-head">
          <div className="orders-modal-head-left">
            <span className="orders-modal-id">#{order.id}</span>
            <StatusPill status={order.status} />
          </div>
          <button className="orders-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="orders-modal-body">
          {/* Customer Info */}
          <div className="orders-modal-section">
            <div className="orders-modal-section-title">Customer Info</div>
            <div className="orders-modal-info-grid">
              <div className="orders-modal-info-row">
                <span className="orders-modal-info-label">Name</span>
                <span className="orders-modal-info-val">{order.customer}</span>
              </div>
              <div className="orders-modal-info-row">
                <span className="orders-modal-info-label">Phone</span>
                <span className="orders-modal-info-val">{order.phone}</span>
              </div>
              <div className="orders-modal-info-row">
                <span className="orders-modal-info-label">Address</span>
                <span className="orders-modal-info-val">{order.address}</span>
              </div>
              <div className="orders-modal-info-row">
                <span className="orders-modal-info-label">Date</span>
                <span className="orders-modal-info-val">{order.date}</span>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="orders-modal-section">
            <div className="orders-modal-section-title">Items Ordered</div>
            <table className="orders-modal-items-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price (LKR)</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name}</td>
                    <td>{item.qty}</td>
                    <td>{fmtLKR(item.price)}</td>
                    <td style={{ fontWeight: 600 }}>{fmtLKR(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 600, color: '#888' }}>Total</td>
                  <td style={{ fontWeight: 700, color: '#1a2340', fontSize: '15px' }}>
                    LKR {fmtLKR(orderTotal(order.items))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Timeline or Cancelled */}
          <div className="orders-modal-section">
            <div className="orders-modal-section-title">Order Timeline</div>
            {order.status === 'Cancelled' ? (
              <div className="orders-cancelled-notice">This order has been cancelled.</div>
            ) : (
              <div className="orders-timeline">
                {timelineSteps.map((s, j) => (
                  <div className="orders-tl-step" key={j}>
                    <div className={`orders-tl-dot ${j < step ? 'done' : j === step - 1 || (order.status === 'Pending' && j === 0) ? 'current' : 'todo'}`} />
                    <div className="orders-tl-label">{s}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Update Status */}
          {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
            <div className="orders-modal-section">
              <div className="orders-modal-section-title">Update Status</div>
              <div className="orders-status-btns">
                {STATUS_ORDER.filter(s => s !== order.status && s !== 'Cancelled').map(s => (
                  <button
                    key={s}
                    className="orders-status-update-btn"
                    onClick={() => onStatusChange(order.id, s)}
                  >
                    Mark as {s}
                  </button>
                ))}
                <button
                  className="orders-status-update-btn cancel-btn"
                  onClick={() => onStatusChange(order.id, 'Cancelled')}
                >
                  Cancel Order
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
  const [orders, setOrders]           = useState(MOCK_ORDERS);
  const [filter, setFilter]           = useState('All');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [selectedOrder, setSelected]  = useState(null);
  const [selectedIndex, setSelIdx]    = useState(null);
  const [toast, setToast]             = useState(null);

  // ── Filtered + paginated data ──
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchStatus = filter === 'All' || o.status === filter;
      const matchSearch = !q
        || o.id.toLowerCase().includes(q)
        || o.customer.toLowerCase().includes(q)
        || o.items.some(i => i.name.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, filter, search]);

  const totalPages  = Math.ceil(filtered.length / PER_PAGE);
  const pageSlice   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Stats ──
  const stats = useMemo(() => ({
    total:      orders.length,
    pending:    orders.filter(o => o.status === 'Pending').length,
    delivered:  orders.filter(o => o.status === 'Delivered').length,
    revenue:    orders.reduce((s, o) => s + orderTotal(o.items), 0),
  }), [orders]);

  // ── Actions ──
  function handleFilterChange(f) { setFilter(f); setPage(1); }
  function handleSearch(e)       { setSearch(e.target.value); setPage(1); }

  function handleStatusChange(id, newStatus) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    setSelected(prev => prev ? { ...prev, status: newStatus } : null);
    showToast(`Order #${id} marked as ${newStatus}`);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function openOrder(order, idx) {
    setSelected(order);
    setSelIdx(idx);
  }

  function handleExport() {
    const header = 'Order ID,Customer,Date,Total (LKR),Status\n';
    const rows   = orders.map(o =>
      `${o.id},"${o.customer}",${o.date},${orderTotal(o.items)},${o.status}`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'giftora-orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const filterTabs = ['All', ...STATUS_ORDER];

  return (
    <div className="orders-page">

      {/* ── Page Header ── */}
      <div className="orders-page-header">
        <div>
          <h1 className="orders-page-title">Order Management</h1>
          <p className="orders-page-sub">Track, filter and update all your customer orders</p>
        </div>
        <button className="orders-export-btn" onClick={handleExport}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          Export CSV
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="orders-stats-row">
        <StatCard label="Total Orders"   value={stats.total.toLocaleString()}         badge="All time"          badgeType="neutral"  />
        <StatCard label="Pending"        value={stats.pending}                          badge="Needs attention"   badgeType="warning"  />
        <StatCard label="Delivered"      value={stats.delivered.toLocaleString()}      badge={`${Math.round(stats.delivered / stats.total * 100)}% rate`} badgeType="success" />
        <StatCard label="Revenue (LKR)"  value={fmtLKR(stats.revenue)}                badge="+15.3% vs yesterday" badgeType="success" />
      </div>

      {/* ── Toolbar ── */}
      <div className="orders-toolbar">
        {/* Search */}
        <div className="orders-search-wrap">
          <svg className="orders-search-icon" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            className="orders-search-input"
            type="text"
            placeholder="Search by order ID, customer or item…"
            value={search}
            onChange={handleSearch}
          />
        </div>

        {/* Filter Tabs */}
        <div className="orders-filter-tabs">
          {filterTabs.map(f => (
            <button
              key={f}
              className={`orders-filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => handleFilterChange(f)}
            >
              {f}
              {f !== 'All' && (
                <span className="orders-tab-count">
                  {orders.filter(o => o.status === f).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="orders-table-wrap">
        {pageSlice.length === 0 ? (
          <div className="orders-empty">
            <div className="orders-empty-icon">📦</div>
            <div className="orders-empty-text">No orders match your filters</div>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Date</th>
                <th>Total (LKR)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageSlice.map((order, i) => {
                const globalIdx = orders.findIndex(o => o.id === order.id);
                return (
                  <tr key={order.id} className="orders-table-row">
                    <td className="orders-order-id">#{order.id}</td>
                    <td>
                      <div className="orders-customer-cell">
                        <Avatar name={order.customer} index={globalIdx} />
                        <span>{order.customer}</span>
                      </div>
                    </td>
                    <td className="orders-items-cell">
                      {order.items.map(it => it.name).join(', ')}
                    </td>
                    <td className="orders-date-cell">{order.date}</td>
                    <td className="orders-total-cell">
                      {fmtLKR(orderTotal(order.items))}
                    </td>
                    <td><StatusPill status={order.status} /></td>
                    <td>
                      <div className="orders-actions">
                        <button
                          className="orders-action-btn view"
                          onClick={() => openOrder(order, globalIdx)}
                        >
                          View
                        </button>
                        {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                          <button
                            className="orders-action-btn update"
                            onClick={() => {
                              const next = STATUS_ORDER[STATUS_ORDER.indexOf(order.status) + 1];
                              if (next) handleStatusChange(order.id, next);
                            }}
                          >
                            ↑ Update
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="orders-pagination">
            <span className="orders-page-info">
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length} orders
            </span>
            <div className="orders-page-btns">
              <button
                className="orders-page-btn"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`orders-page-btn ${p === page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="orders-page-btn"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      <OrderModal
        order={selectedOrder}
        index={selectedIndex}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />

      {/* ── Toast ── */}
      {toast && <div className="orders-toast">{toast}</div>}
    </div>
  );
};

export default Orders;