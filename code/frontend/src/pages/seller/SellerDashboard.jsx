import React, { useState, useEffect, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  FaShoppingCart, FaDollarSign, FaBoxOpen, FaStar,
  FaArrowUp, FaArrowDown,
} from 'react-icons/fa';
import './SellerDashboard.css';

// ── Config ────────────────────────────────────────────────────
const API_BASE  = `${process.env.REACT_APP_API_URL}/api`;
const getSellerId = () => {
  const localId = localStorage.getItem('userId');
  return localId ? parseInt(localId, 10) : 2; // fallback to 2 for development or preview
};

// ── Fallback mock data (API fail වුණොත් මේවා පෙන්වේ) ──────────
const MOCK_WEEKLY = [
  { day: 'Mon', orders: 42, revenue: 210000 },
  { day: 'Tue', orders: 58, revenue: 290000 },
  { day: 'Wed', orders: 35, revenue: 175000 },
  { day: 'Thu', orders: 71, revenue: 355000 },
  { day: 'Fri', orders: 89, revenue: 445000 },
  { day: 'Sat', orders: 96, revenue: 480000 },
  { day: 'Sun', orders: 63, revenue: 315000 },
];

const MOCK_MONTHLY = [
  { month: 'Oct', revenue: 1200000 },
  { month: 'Nov', revenue: 1850000 },
  { month: 'Dec', revenue: 2400000 },
  { month: 'Jan', revenue: 1700000 },
  { month: 'Feb', revenue: 2100000 },
  { month: 'Mar', revenue: 2800000 },
  { month: 'Apr', revenue: 3100000 },
];

const MOCK_RECENT = [
  { order_id: 'GB1001', delivery_address: '123 Galle Rd, Colombo', created_at: new Date().toISOString(), status: 'PENDING',    total_amount: 2000 },
  { order_id: 'GB1002', delivery_address: '45 Kandy Rd, Peradeniya', created_at: new Date().toISOString(), status: 'DELIVERED',  total_amount: 3500 },
  { order_id: 'GB1003', delivery_address: '12 Temple Trees, Col 01', created_at: new Date().toISOString(), status: 'CONFIRMED',  total_amount: 1500 },
];

const STATUS_COLOR_MAP = {
  DELIVERED:  { bg: '#EAF3DE', color: '#2E7D52', border: '#A8D87A' },
  PENDING:    { bg: '#E6F1FB', color: '#185FA5', border: '#85B7EB' },
  CONFIRMED:  { bg: '#FEF9ED', color: '#854F0B', border: '#FAC775' },
  ASSEMBLING: { bg: '#F0E6FB', color: '#6A1FAB', border: '#C49AEB' },
  SHIPPED:    { bg: '#E6F1FB', color: '#185FA5', border: '#85B7EB' },
  CANCELLED:  { bg: '#FCEBEB', color: '#A32D2D', border: '#F09595' },
  READY:      { bg: '#EAF3DE', color: '#2E7D52', border: '#A8D87A' },
};

const PIE_COLORS = {
  DELIVERED:  '#2E7D52',
  PENDING:    '#C9A84C',
  CONFIRMED:  '#E8C96A',
  CANCELLED:  '#C0392B',
  ASSEMBLING: '#9B7EE0',
  SHIPPED:    '#4A90D9',
  READY:      '#5AB88A',
};

// ── Helpers ───────────────────────────────────────────────────
const fmtLKR = (n) => Number(n || 0).toLocaleString('en-LK');

const timeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
  if (diff < 60)  return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
};

// ── Sub-components ────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="sd-tooltip">
      <p className="sd-tooltip-label">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="sd-tooltip-row">
          {p.name}: <span className="sd-tooltip-val">{prefix}{Number(p.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

const StatCard = ({ icon, title, value, change, trend, sub }) => (
  <div className="sd-stat-card">
    <div className="sd-stat-icon">{icon}</div>
    <div className="sd-stat-body">
      <p className="sd-stat-title">{title}</p>
      <h3 className="sd-stat-value">{value}</h3>
      <div className="sd-stat-footer">
        <span className={`sd-stat-badge ${trend}`}>
          {trend === 'up' ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
          {change}
        </span>
        {sub && <span className="sd-stat-sub">{sub}</span>}
      </div>
    </div>
  </div>
);

const SectionTitle = ({ title, action, onAction }) => (
  <div className="sd-section-title">
    <h2>{title}</h2>
    {action && <button className="sd-section-btn" onClick={onAction}>{action}</button>}
  </div>
);

const ChartCard = ({ children, style }) => (
  <div className="sd-chart-card" style={style}>{children}</div>
);

const StatusPill = ({ status }) => {
  const s = STATUS_COLOR_MAP[status] || STATUS_COLOR_MAP.PENDING;
  return (
    <span className="sd-status-pill" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      {status}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────
const SellerDashboard = () => {
  const [stats,    setStats]    = useState(null);
  const [weekly,   setWeekly]   = useState(MOCK_WEEKLY);
  const [monthly,  setMonthly]  = useState(MOCK_MONTHLY);
  const [pieData,  setPieData]  = useState([]);
  const [recent,   setRecent]   = useState(MOCK_RECENT);
  const [loading,  setLoading]  = useState(true);

  const SELLER_ID = useMemo(() => getSellerId(), []);

  // ── Fetch dashboard data ──
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // 1. Dashboard stats
        const dashRes = await fetch(`${API_BASE}/seller/${SELLER_ID}/dashboard`);
        if (dashRes.ok) {
          const dash = await dashRes.json();
          setStats(dash);

          // Weekly chart data
          if (dash.weeklyData?.length)   setWeekly(dash.weeklyData.map(d => ({
            day: d.day, orders: Number(d.orders), revenue: Number(d.revenue),
          })));

          // Monthly chart data
          if (dash.monthlyRevenue?.length) setMonthly(dash.monthlyRevenue.map(d => ({
            month: d.month, revenue: Number(d.revenue),
          })));

          // Pie chart data
          if (dash.statusDistribution) {
            const total = Object.values(dash.statusDistribution).reduce((a, b) => a + Number(b), 0);
            setPieData(Object.entries(dash.statusDistribution).map(([name, val]) => ({
              name,
              value: total > 0 ? Math.round((Number(val) / total) * 100) : 0,
              color: PIE_COLORS[name] ?? '#AAA',
            })));
          }
        }

        // 2. Recent orders
        const ordersRes = await fetch(`${API_BASE}/sellers/${SELLER_ID}/orders`);
        if (ordersRes.ok) {
          const orders = await ordersRes.json();
          setRecent(orders.slice(0, 5)); // latest 5 only
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        // Fallback mock data already set as default state
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [SELLER_ID]);

  // ── Derived stats ──
  const ordersToday  = stats?.ordersToday  ?? '--';
  const revenueToday = stats ? fmtLKR(stats.revenueToday) : '--';
  const totalProducts = stats?.totalProducts ?? '--';

  return (
    <div className="sd-page">

      {/* ── Welcome Banner ── */}
      <div className="sd-banner">
        <div>
          <h1>Welcome back! 👋</h1>
          <p>Here's what's happening with your shop today.</p>
        </div>
        <div className="sd-banner-date">
          <p className="date-label">Today</p>
          <p className="date-value">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="sd-stats-grid">
        <StatCard icon={<FaShoppingCart />} title="Orders Today"   value={ordersToday}   change="+23.1%" trend="up"   sub="vs yesterday" />
        <StatCard icon={<FaDollarSign />}   title="Revenue (LKR)"  value={revenueToday}  change="+15.3%" trend="up"   sub="vs yesterday" />
        <StatCard icon={<FaBoxOpen />}      title="Total Products" value={totalProducts} change="+4"     trend="up"   sub="this week" />
        <StatCard icon={<FaStar />}         title="Avg Rating"     value="4.8★"          change="-0.1"   trend="down" sub="last 30 days" />
      </div>

      {/* ── Charts Row 1: Orders + Revenue ── */}
      <div className="sd-row-2">
        <ChartCard>
          <SectionTitle title="Orders This Week" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weekly} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A84C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7A869A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A869A' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="orders" name="Orders" stroke="#C9A84C" strokeWidth={2.5} fill="url(#ordersGrad)" dot={{ fill: '#C9A84C', r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <SectionTitle title="Daily Revenue (LKR)" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#C9A84C" stopOpacity={1} />
                  <stop offset="100%" stopColor="#E8C96A" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7A869A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A869A' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip prefix="LKR " />} />
              <Bar dataKey="revenue" name="Revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Monthly Revenue + Pie ── */}
      <div className="sd-row-2-1">
        <ChartCard>
          <SectionTitle title="Monthly Revenue (LKR)" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthly} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1A2340" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1A2340" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7A869A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A869A' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip prefix="LKR " />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#1A2340" strokeWidth={2.5} fill="url(#monthGrad)" dot={{ fill: '#1A2340', r: 4 }} activeDot={{ r: 6, fill: '#C9A84C' }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard>
          <SectionTitle title="Order Status" />
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="sd-pie-legend">
                {pieData.map(s => (
                  <div key={s.name} className="sd-pie-legend-item">
                    <div className="sd-pie-dot" style={{ background: s.color }} />
                    <span>{s.name} <strong style={{ color: '#1A2340' }}>{s.value}%</strong></span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="sd-loading">No data yet</div>
          )}
        </ChartCard>
      </div>

      {/* ── Bottom Row: Recent Orders ── */}
      <div className="sd-row-bottom">
        <ChartCard>
          <SectionTitle title="Recent Orders" action="View All" />
          {loading ? (
            <div className="sd-loading">Loading...</div>
          ) : (
            <table className="sd-table">
              <thead>
                <tr>
                  {['Order ID', 'Address', 'Amount (LKR)', 'Status', 'Time'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((o, i) => (
                  <tr key={o.order_id} style={{ borderBottom: i < recent.length - 1 ? '1px solid #F5F0E8' : 'none' }}>
                    <td className="sd-order-id">#{o.order_id}</td>
                    <td className="sd-order-product">{o.delivery_address}</td>
                    <td className="sd-order-amount">{fmtLKR(o.total_amount)}</td>
                    <td><StatusPill status={o.status} /></td>
                    <td className="sd-order-time">{timeAgo(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </ChartCard>

        {/* Stats Summary Card */}
        <ChartCard>
          <SectionTitle title="Order Summary" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total Orders',    value: stats ? (stats.ordersToday ?? 0) : '--',  color: '#1A2340' },
              { label: 'Total Revenue',   value: stats ? `LKR ${fmtLKR(stats.revenueToday)}` : '--', color: '#C9A84C' },
              { label: 'Total Products',  value: stats?.totalProducts ?? '--', color: '#1A2340' },
              { label: 'Pending Orders',  value: pieData.find(p => p.name === 'PENDING')?.value != null ? `${pieData.find(p => p.name === 'PENDING').value}%` : '--', color: '#185FA5' },
              { label: 'Delivered',       value: pieData.find(p => p.name === 'DELIVERED')?.value != null ? `${pieData.find(p => p.name === 'DELIVERED').value}%` : '--', color: '#2E7D52' },
              { label: 'Cancelled',       value: pieData.find(p => p.name === 'CANCELLED')?.value != null ? `${pieData.find(p => p.name === 'CANCELLED').value}%` : '--', color: '#C0392B' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#F8F4EC', borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: '#5A6478', fontWeight: 500 }}>{row.label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

    </div>
  );
};

export default SellerDashboard;