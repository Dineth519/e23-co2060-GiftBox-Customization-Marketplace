import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Package, Box, Settings, CircleCheck, Clock, TriangleAlert, Search, ArrowUpRight, ArrowRight, Inbox, BookOpen } from 'lucide-react';
import { STATUS, selectQueueOrders, hasAssemblyIssue } from './overviewData';
import './Dashboard.css';
import { useAssemblyOrders, AssemblyLoadState } from './assemblyApi';
import { getMonthlyOutput } from './monthlyOutput';

const metrics = [
  { status: 'awaiting', icon: Package, hint: 'Waiting for vendor deliveries' },
  { status: 'issues', icon: TriangleAlert, hint: 'Orders needing attention' },
  { status: 'assembling', icon: Settings, hint: 'Preparation in progress' },
  { status: 'completed', icon: CircleCheck, hint: 'Assembly completed' },
];
const statusIcons = { awaiting: Clock, ready: Box, assembling: Settings, completed: CircleCheck, hold: TriangleAlert };

function StatusBadge({ status }) {
  const Icon = statusIcons[status];
  return <span className={'ao-status ao-tone-' + STATUS[status].tone}><Icon size={14} aria-hidden="true" />{STATUS[status].label}</span>;
}

export default function AssemblerDashboard({ queueMode = false }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStatus = searchParams.get('status');
  const status = queueMode && STATUS[requestedStatus] ? requestedStatus : 'all';
  const query = queueMode ? searchParams.get('q') || '' : '';
  const updateSearch = (key, value) => setSearchParams(previous => {
    const next = new URLSearchParams(previous);
    if (!value || value === 'all') next.delete(key); else next.set(key, value);
    return next;
  }, { replace: true });
  const setStatus = value => updateSearch('status', value);
  const setQuery = value => updateSearch('q', value);
  const [box, setBox] = useState('all');
  const [due, setDue] = useState('all');
  const [sort, setSort] = useState('newest');
  const navigate = useNavigate();
  const { orders: allOrders, loading, error, reload } = useAssemblyOrders();
  const liveOrders = allOrders;
  const monthlyOutput = getMonthlyOutput(liveOrders);
  const orders = selectQueueOrders(liveOrders, { status, query, box, due, sort });
  const onHold = liveOrders.filter(order => order.status === 'hold').length;
  const attention = liveOrders.filter(order => order.issue || order.status === 'hold' || (order.status === 'awaiting' && ['Today', 'Overdue'].includes(order.due)));
  const inProgress = selectQueueOrders(liveOrders, { status: 'assembling' }).slice(0, 3);
  const openWorkspace = order => {
    navigate('/assembler/orders/' + order.id);
  };
  const reset = () => { setSearchParams({}, { replace: true }); setBox('all'); setDue('all'); setSort('newest'); };
  const hasFilters = status !== 'all' || query || box !== 'all' || due !== 'all' || sort !== 'newest';

  return (
    <section className="asm-overview" aria-labelledby="ao-title">
      {queueMode && <nav className="aq-breadcrumb" aria-label="Breadcrumb"><Link to="/assembler">Overview</Link><span aria-hidden="true">/</span><span aria-current="page">Order Queue</span></nav>}
      <header className="ao-header">
        <div>
          <div className="ao-title-row"><h1 id="ao-title">{queueMode ? 'Order Queue' : 'Assembly overview'}</h1></div>
          <p>{queueMode ? 'Find a gift box, check item arrivals, and plan your next assembly.' : 'Receive items. Prepare gifts. Keep every detail right.'}</p>
        </div>
      </header>

      <AssemblyLoadState loading={loading} error={error} reload={reload} />
      {!loading && !error && liveOrders.length === 0 && <p role="status">No confirmed orders are available. Orders appear here after vendor confirmation.</p>}
      {!queueMode && <div className="ao-metrics" aria-label="Assembly summary">
        {metrics.map(({ status: key, icon: Icon, hint }) => (
          <Link key={key} className="ao-metric" to={key === 'issues' ? '/assembler/issues' : '/assembler/queue?status=' + key}>
            <span className={'ao-metric-icon ao-tone-' + (key === 'issues' ? 'red' : STATUS[key].tone)}><Icon size={24} aria-hidden="true" /></span>
            <span><span className="ao-metric-label">{key === 'issues' ? 'Issues' : STATUS[key].label}</span><strong>{loading || error ? '—' : String(liveOrders.filter(order => key === 'issues' ? hasAssemblyIssue(order) : order.status === key).length).padStart(2, '0')}</strong><span className="ao-metric-hint">{hint}</span></span>
            <ArrowUpRight className="ao-metric-arrow" size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>}

      {!queueMode && <div className="ao-summary-grid">
        <section className="ao-summary-panel" aria-labelledby="ao-summary-title" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ao-summary-heading"><div><span className="ao-eyebrow">Overview</span><h2 id="ao-summary-title">Current orders</h2></div></div>
          <p className="ao-summary-intro">Breakdown of all active work.</p>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', padding: '16px' }}>
            <div style={{ width: '150px', height: '150px', position: 'relative', flexShrink: 0 }}>
              <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f0f0f0" strokeWidth="4" />
                {(() => {
                  const TONE_COLORS = { amber: '#f59e0b', teal: '#10b981', blue: '#3b82f6', red: '#ef4444' };
                  const counts = { awaiting: liveOrders.filter(o => o.status === 'awaiting').length, ready: liveOrders.filter(o => o.status === 'ready').length, assembling: liveOrders.filter(o => o.status === 'assembling').length, completed: liveOrders.filter(o => o.status === 'completed').length, hold: liveOrders.filter(o => o.status === 'hold').length };
                  const data = Object.keys(counts).filter(k => counts[k] > 0).map(key => ({ label: STATUS[key].label, value: counts[key], color: TONE_COLORS[STATUS[key].tone] || '#ccc' }));
                  const total = data.reduce((sum, d) => sum + d.value, 0);
                  let cumulative = 0;
                  return total > 0 && data.map(d => {
                    const percentage = (d.value / total) * 100;
                    const dashArray = `${percentage} ${100 - percentage}`;
                    const dashOffset = 100 - cumulative;
                    cumulative += percentage;
                    return <circle key={d.label} cx="18" cy="18" r="15.915" fill="transparent" stroke={d.color} strokeWidth="4" strokeDasharray={dashArray} strokeDashoffset={dashOffset} style={{ transition: 'all 0.5s ease' }}><title>{d.label}: {d.value}</title></circle>;
                  });
                })()}
              </svg>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '30px', fontWeight: 'bold', lineHeight: 1, color: '#111' }}>{liveOrders.length}</span>
                <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '6px' }}>Total</span>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {(() => {
                const TONE_COLORS = { amber: '#f59e0b', teal: '#10b981', blue: '#3b82f6', red: '#ef4444' };
                const counts = { awaiting: liveOrders.filter(o => o.status === 'awaiting').length, ready: liveOrders.filter(o => o.status === 'ready').length, assembling: liveOrders.filter(o => o.status === 'assembling').length, completed: liveOrders.filter(o => o.status === 'completed').length, hold: liveOrders.filter(o => o.status === 'hold').length };
                const data = Object.keys(counts).filter(k => counts[k] > 0).map(key => ({ label: STATUS[key].label, value: counts[key], color: TONE_COLORS[STATUS[key].tone] || '#ccc' }));
                return data.length > 0 ? data.map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: d.color }}></span><span style={{ color: '#4b5563' }}>{d.label}</span></div>
                    <strong style={{ color: '#111827', fontSize: '14px' }}>{d.value}</strong>
                  </div>
                )) : <span style={{ fontSize: '14px', color: '#6b7280' }}>No active orders</span>;
              })()}
            </div>
          </div>
        </section>
        <section className="ao-summary-panel" aria-labelledby="ao-graph-title" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ao-summary-heading"><div><span className="ao-eyebrow">Performance</span><h2 id="ao-graph-title">Monthly Output</h2></div></div>
          <p className="ao-summary-intro">Completed assemblies by submission month · Last 6 months.</p>
          {loading ? <p role="status">Loading monthly output…</p> : error ? <p role="status">Monthly output is unavailable. Use Retry above to reload.</p> : <>
          {monthlyOutput.months.every(month => month.val === 0) && <p role="status">No dated assembly completions in the last six months.</p>}
          {monthlyOutput.undated > 0 && <p role="status">{monthlyOutput.undated} completed {monthlyOutput.undated === 1 ? 'assembly has' : 'assemblies have'} no submission date and {monthlyOutput.undated === 1 ? 'is' : 'are'} excluded.</p>}
          <div role="list" aria-label="Completed assemblies by month" style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '32px 16px 8px', gap: '12px' }}>
            {monthlyOutput.months.map((d, i, arr) => {
              const max = Math.max(1, ...arr.map(x => x.val));
              const height = (d.val / max) * 100;
              return (
                <div key={d.key} role="listitem" aria-label={`${d.label}: ${d.val} completed assemblies`} title={`${d.label}: ${d.val}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '100%', height: '140px', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                    <div style={{ width: '100%', maxWidth: '36px', margin: '0 auto', height: `${height}%`, backgroundColor: i === arr.length - 1 ? '#10b981' : '#d1fae5', borderRadius: '6px 6px 0 0', position: 'relative' }}>
                       <span style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: i === arr.length - 1 ? '#047857' : '#9ca3af', fontWeight: 'bold' }}>{d.val}</span>
                    </div>
                  </div>
                  <span style={{ fontSize: '13px', color: i === arr.length - 1 ? '#111827' : '#6b7280', fontWeight: i === arr.length - 1 ? 'bold' : 'normal' }}>{d.month}</span>
                </div>
              );
            })}
          </div>
          </>}
        </section>
        <section className="ao-quick-links" aria-label="Quick links"><Link to="/assembler/queue"><span><strong>Open Order Queue</strong><small>Search and manage the complete work list</small></span><ArrowRight size={20} aria-hidden="true" /></Link><Link to="/assembler/packing-guide"><span><strong>Packing Guide</strong><small>Preparation standards and quality checks</small></span><BookOpen size={20} aria-hidden="true" /></Link></section>
      </div>}

      {queueMode && <section className="ao-queue" aria-labelledby="ao-queue-title">
        <div className="ao-queue-heading">
          <div><h2 id="ao-queue-title">{queueMode ? 'Assembly orders' : 'My work queue'}</h2><p>{queueMode ? 'Filter the queue or open an order to receive items and prepare the box.' : 'A preview of your upcoming assembly work.'}</p></div>
          <label className="ao-search"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order ID..." aria-label="Search by order ID" /></label>
        </div>
        <div className="ao-filters" role="group" aria-label="Filter orders by status">
          {['all', ...Object.keys(STATUS)].map(key => <button type="button" key={key} aria-pressed={status === key} className={status === key ? 'ao-filter-active' : ''} onClick={() => setStatus(key)}>{key === 'all' ? 'All orders' : STATUS[key].label}{queueMode && <span className="aq-count">{liveOrders.filter(order => key === 'all' || order.status === key).length}</span>}</button>)}
        </div>
        {queueMode && <div className="aq-toolbar">
          <label>Box size<select value={box} onChange={event => setBox(event.target.value)}><option value="all">All sizes</option>{['Small', 'Medium', 'Large'].map(size => <option key={size}>{size}</option>)}</select></label>
          <label>Due<select value={due} onChange={event => setDue(event.target.value)}><option value="all">Any time</option>{['Overdue', 'Today', 'Tomorrow', 'In 2 days', 'Not scheduled'].map(day => <option key={day}>{day}</option>)}</select></label>
          <label>Sort by<select value={sort} onChange={event => setSort(event.target.value)}><option value="newest">Newest first</option><option value="due">Due soonest</option><option value="id">Order ID</option></select></label>
          {hasFilters && <button type="button" onClick={reset}>Reset filters</button>}
        </div>}
        <div className="ao-table-scroll" tabIndex={0} role="region" aria-label="Work queue table">
          <table className="ao-table">
            <thead><tr><th scope="col">Order</th><th scope="col">Occasion</th><th scope="col">Items received</th><th scope="col">Due</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead>
            <tbody>{orders.map(order => <tr key={order.id}>
              <td><strong>#{order.id}</strong><small>{order.box} box</small></td>
              <td>{order.occasion}</td>
              <td><span className="ao-receipt">{order.received} of {order.total}{order.received === order.total && <CircleCheck size={14} aria-label="All items received" />}</span><progress value={order.received} max={order.total} aria-label={'Items received for ' + order.id} /></td>
              <td><span className={order.due === 'Today' ? 'ao-due-today' : ''}>{order.due}</span></td>
              <td><StatusBadge status={order.status} /></td>
              <td><button type="button" className={'ao-order-button' + (order.status === 'hold' ? ' ao-order-issue' : '')} aria-label={(order.status === 'hold' ? 'View issue for ' : 'Open order ') + order.id} onClick={() => openWorkspace(order)}>{order.status === 'hold' ? 'View issue' : 'Open order'}<ArrowUpRight size={14} aria-hidden="true" /></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        {!loading && !error && orders.length === 0 && <div className="ao-empty"><Inbox size={32} aria-hidden="true" /><h3>No matching orders</h3><p>Try another order ID or clear the filters.</p><button type="button" onClick={reset}>Clear filters</button></div>}
        <div className="ao-queue-footer"><span role="status">{orders.length} of {liveOrders.length} orders</span>{hasFilters && <button type="button" onClick={reset}>Clear filters</button>}{!queueMode && <Link to="/assembler/queue">View full queue</Link>}</div>
        {onHold > 0 && <button type="button" className="ao-alert" onClick={() => { setSearchParams({ status: 'hold' }, { replace: true }); setBox('all'); setDue('all'); }}><TriangleAlert size={19} aria-hidden="true" /><span><strong>{onHold} {onHold === 1 ? 'order needs' : 'orders need'} attention</strong> — review held orders</span><ArrowRight size={18} aria-hidden="true" /></button>}
      </section>}

      <footer className="ao-bottom"><p>Confirmed orders available to you. Saving an unassigned order assigns it to you.</p></footer>


    </section>
  );
}
