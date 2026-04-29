import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  FaShoppingCart, FaDollarSign, FaTruck, FaBoxOpen,
  FaStar, FaArrowUp, FaArrowDown, FaEye
} from 'react-icons/fa';

// ── Design tokens ─────────────────────────────────────────────
const gold    = '#C9A84C';
const goldLight = '#E8C96A';
const navy    = '#1A2340';
const navyMid = '#1E2B47';
const cream   = '#F5F0E8';
const white   = '#FFFFFF';
const green   = '#2E7D52';
const red     = '#C0392B';

// ── Mock data ─────────────────────────────────────────────────
const ordersData = [
  { day: 'Mon', orders: 42, revenue: 210000 },
  { day: 'Tue', orders: 58, revenue: 290000 },
  { day: 'Wed', orders: 35, revenue: 175000 },
  { day: 'Thu', orders: 71, revenue: 355000 },
  { day: 'Fri', orders: 89, revenue: 445000 },
  { day: 'Sat', orders: 96, revenue: 480000 },
  { day: 'Sun', orders: 63, revenue: 315000 },
];

const monthlyRevenue = [
  { month: 'Oct', revenue: 1200000 },
  { month: 'Nov', revenue: 1850000 },
  { month: 'Dec', revenue: 2400000 },
  { month: 'Jan', revenue: 1700000 },
  { month: 'Feb', revenue: 2100000 },
  { month: 'Mar', revenue: 2800000 },
  { month: 'Apr', revenue: 3100000 },
];

const orderStatusData = [
  { name: 'Delivered', value: 54, color: green },
  { name: 'Processing', value: 28, color: gold },
  { name: 'Pending',    value: 12, color: '#E8C96A' },
  { name: 'Cancelled',  value: 6,  color: red },
];

const topProducts = [
  { name: 'Premium Gift Box',    sold: 142, revenue: '284,000', rating: 4.9 },
  { name: 'Luxury Hamper Set',   sold: 98,  revenue: '196,000', rating: 4.7 },
  { name: 'Birthday Bouquet',    sold: 87,  revenue: '130,500', rating: 4.8 },
  { name: 'Wedding Gift Bundle', sold: 64,  revenue: '192,000', rating: 4.6 },
  { name: 'Anniversary Box',     sold: 51,  revenue: '153,000', rating: 4.5 },
];

const recentOrders = [
  { id: 'GB1001', product: 'Premium Gift Box',    time: '2 hrs ago',  status: 'Processing', amount: '2,000' },
  { id: 'GB1002', product: 'Luxury Hamper Set',   time: '3 hrs ago',  status: 'Delivered',  amount: '3,500' },
  { id: 'GB1003', product: 'Birthday Bouquet',    time: '5 hrs ago',  status: 'Pending',    amount: '1,500' },
  { id: 'GB1004', product: 'Wedding Gift Bundle', time: '6 hrs ago',  status: 'Delivered',  amount: '4,200' },
  { id: 'GB1005', product: 'Anniversary Box',     time: '8 hrs ago',  status: 'Processing', amount: '3,000' },
];

// ── Helpers ───────────────────────────────────────────────────
const statusStyle = (s) => {
  const map = {
    Processing: { bg: '#FEF9ED', color: '#854F0B', border: '#FAC775' },
    Delivered:  { bg: '#EAF3DE', color: '#2E7D52', border: '#A8D87A' },
    Pending:    { bg: '#E6F1FB', color: '#185FA5', border: '#85B7EB' },
    Cancelled:  { bg: '#FCEBEB', color: '#A32D2D', border: '#F09595' },
  };
  return map[s] || map.Pending;
};

const fmt = (n) => 'LKR ' + Number(n).toLocaleString();

// ── Custom tooltip ─────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, prefix = '' }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: navy, border: `1px solid ${gold}`, borderRadius: 10, padding: '10px 16px' }}>
      <p style={{ color: goldLight, fontSize: 12, margin: '0 0 6px', fontWeight: 600 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: white, fontSize: 13, margin: '2px 0', fontWeight: 500 }}>
          {p.name}: <span style={{ color: goldLight }}>{prefix}{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ── Stat Card ──────────────────────────────────────────────────
const StatCard = ({ icon, title, value, change, trend, sub }) => (
  <div style={{
    background: white, borderRadius: 16, border: '1px solid #EDE8DE',
    padding: '22px 24px', display: 'flex', alignItems: 'flex-start', gap: 16,
    boxShadow: '0 2px 12px rgba(26,35,64,0.06)',
  }}>
    <div style={{
      width: 52, height: 52, borderRadius: 14, background: gold,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: navy, fontSize: 20, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ margin: 0, fontSize: 12, color: '#7A869A', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{title}</p>
      <h3 style={{ margin: '4px 0 6px', fontSize: 26, fontWeight: 800, color: navy }}>{value}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700,
          color: trend === 'up' ? green : red,
          background: trend === 'up' ? '#EAF3DE' : '#FCEBEB',
          padding: '2px 8px', borderRadius: 20,
        }}>
          {trend === 'up' ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
          {change}
        </span>
        {sub && <span style={{ fontSize: 11, color: '#AAA' }}>{sub}</span>}
      </div>
    </div>
  </div>
);

// ── Section Title ──────────────────────────────────────────────
const SectionTitle = ({ title, action, onAction }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: navy }}>{title}</h2>
    {action && (
      <button onClick={onAction} style={{
        background: 'transparent', border: `1.5px solid ${gold}`, color: gold,
        padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'inherit',
      }}>{action}</button>
    )}
  </div>
);

// ── Chart Card wrapper ─────────────────────────────────────────
const ChartCard = ({ children, style }) => (
  <div style={{
    background: white, borderRadius: 16, border: '1px solid #EDE8DE',
    padding: '22px 24px', boxShadow: '0 2px 12px rgba(26,35,64,0.06)',
    ...style,
  }}>
    {children}
  </div>
);

// ── Main Component ─────────────────────────────────────────────
const SellerDashboard = () => {
  const [activeRange, setActiveRange] = useState('7d');

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: cream, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Welcome Header ── */}
      <div style={{
        background: `linear-gradient(135deg, ${navy} 0%, ${navyMid} 100%)`,
        borderRadius: 20, padding: '28px 32px', marginBottom: 28,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        border: `1px solid ${navyMid}`,
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: white }}>
            Welcome back, Mathew! 👋
          </h1>
          <p style={{ margin: '6px 0 0', color: '#8899BB', fontSize: 14 }}>
            Here's what's happening with your shop today.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 12, color: '#8899BB' }}>Today</p>
          <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: goldLight }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={<FaShoppingCart />} title="Orders Today"   value="89"       change="+23.1%" trend="up"   sub="vs yesterday" />
        <StatCard icon={<FaDollarSign />}   title="Revenue (LKR)"  value="485,600"  change="+15.3%" trend="up"   sub="vs yesterday" />
        <StatCard icon={<FaBoxOpen />}      title="Total Products" value="142"      change="+4"     trend="up"   sub="this week" />
        <StatCard icon={<FaStar />}         title="Avg Rating"     value="4.8★"     change="-0.1"   trend="down" sub="last 30 days" />
      </div>

      {/* ── Charts Row 1: Orders + Revenue ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Orders Per Day */}
        <ChartCard>
          <SectionTitle title="Orders This Week" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ordersData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={gold} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={gold} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7A869A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A869A' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="orders" name="Orders" stroke={gold} strokeWidth={2.5} fill="url(#ordersGrad)" dot={{ fill: gold, r: 4 }} activeDot={{ r: 6 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Per Day */}
        <ChartCard>
          <SectionTitle title="Daily Revenue (LKR)" />
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ordersData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor={gold} stopOpacity={1} />
                  <stop offset="100%" stopColor={goldLight} stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#7A869A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A869A' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip prefix="LKR " />} />
              <Bar dataKey="revenue" name="Revenue" fill="url(#revenueGrad)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Charts Row 2: Monthly Revenue + Order Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Monthly Revenue */}
        <ChartCard>
          <SectionTitle title="Monthly Revenue (LKR)" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="monthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={navy} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={navy} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EAD8" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#7A869A' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#7A869A' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip prefix="LKR " />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={navy} strokeWidth={2.5} fill="url(#monthGrad)" dot={{ fill: navy, r: 4 }} activeDot={{ r: 6, fill: gold }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Order Status Pie */}
        <ChartCard>
          <SectionTitle title="Order Status" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {orderStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 4 }}>
            {orderStatusData.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#5A6478' }}>{s.name} <strong style={{ color: navy }}>{s.value}%</strong></span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* ── Bottom Row: Recent Orders + Top Products ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>

        {/* Recent Orders */}
        <ChartCard>
          <SectionTitle title="Recent Orders" action="View All" />
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Order ID', 'Product', 'Amount', 'Status', 'Time'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0 0 10px', fontSize: 11, color: '#7A869A', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase', borderBottom: '1px solid #EDE8DE' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o, i) => {
                const s = statusStyle(o.status);
                return (
                  <tr key={o.id} style={{ borderBottom: i < recentOrders.length - 1 ? '1px solid #F5F0E8' : 'none' }}>
                    <td style={{ padding: '11px 0', color: gold, fontWeight: 700 }}>#{o.id}</td>
                    <td style={{ padding: '11px 8px', color: navy, fontWeight: 500 }}>{o.product}</td>
                    <td style={{ padding: '11px 8px', color: navy, fontWeight: 600 }}>LKR {o.amount}</td>
                    <td style={{ padding: '11px 8px' }}>
                      <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '11px 0', color: '#7A869A', fontSize: 12 }}>{o.time}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ChartCard>

        {/* Top Products */}
        <ChartCard>
          <SectionTitle title="Top Products" action="View All" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topProducts.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8, background: i === 0 ? gold : '#F0EAD8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: i === 0 ? navy : '#7A869A', flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7A869A' }}>{p.sold} sold · LKR {p.revenue}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
                  <FaStar size={11} color={gold} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: navy }}>{p.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

      </div>
    </div>
  );
};

export default SellerDashboard;
