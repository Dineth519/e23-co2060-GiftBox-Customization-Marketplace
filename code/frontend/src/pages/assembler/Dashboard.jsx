import React, { useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Package, Box, Settings, CircleCheck, Clock, TriangleAlert, Search, ArrowUpRight, ArrowRight, X, Inbox, BookOpen } from 'lucide-react';
import { STATUS, SAMPLE_ORDERS, selectQueueOrders } from './overviewData';
import './Dashboard.css';

const metrics = [
  { status: 'awaiting', icon: Package, hint: 'Waiting for vendor deliveries' },
  { status: 'ready', icon: Box, hint: 'All items received' },
  { status: 'assembling', icon: Settings, hint: 'Preparation in progress' },
  { status: 'review', icon: CircleCheck, hint: 'Awaiting final approval' },
];
const statusIcons = { awaiting: Clock, ready: Box, assembling: Settings, review: CircleCheck, hold: TriangleAlert };

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
  const [sort, setSort] = useState('due');
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const orders = selectQueueOrders(SAMPLE_ORDERS, { status, query, box, due, sort });
  const onHold = SAMPLE_ORDERS.filter(order => order.status === 'hold').length;
  const attention = SAMPLE_ORDERS.filter(order => order.issue || order.status === 'hold' || (order.status === 'awaiting' && order.due === 'Today'));
  const inProgress = selectQueueOrders(SAMPLE_ORDERS, { status: 'assembling' }).slice(0, 3);
  const openPreview = order => {
    setSelected(order);
    dialog.current.showModal();
  };
  const reset = () => { setSearchParams({}, { replace: true }); setBox('all'); setDue('all'); setSort('due'); };
  const hasFilters = status !== 'all' || query || box !== 'all' || due !== 'all' || sort !== 'due';

  return (
    <section className="asm-overview" aria-labelledby="ao-title">
      {queueMode && <nav className="aq-breadcrumb" aria-label="Breadcrumb"><Link to="/assembler">Overview</Link><span aria-hidden="true">/</span><span aria-current="page">Order Queue</span></nav>}
      <header className="ao-header">
        <div>
          <div className="ao-title-row"><h1 id="ao-title">{queueMode ? 'Order Queue' : 'Assembly overview'}</h1><span className="ao-sample">Sample data</span></div>
          <p>{queueMode ? 'Find a gift box, check item arrivals, and plan your next assembly.' : 'Receive items. Prepare gifts. Keep every detail right.'}</p>
        </div>
        <div className="ao-date"><span>Today</span><time dateTime={new Date().toLocaleDateString('en-CA')}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></div>
      </header>

      {!queueMode && <div className="ao-metrics" aria-label="Assembly summary">
        {metrics.map(({ status: key, icon: Icon, hint }) => (
          <Link key={key} className="ao-metric" to={'/assembler/queue?status=' + key}>
            <span className={'ao-metric-icon ao-tone-' + STATUS[key].tone}><Icon size={24} aria-hidden="true" /></span>
            <span><span className="ao-metric-label">{STATUS[key].label}</span><strong>{String(SAMPLE_ORDERS.filter(order => order.status === key).length).padStart(2, '0')}</strong><span className="ao-metric-hint">{hint}</span></span>
            <ArrowUpRight className="ao-metric-arrow" size={16} aria-hidden="true" />
          </Link>
        ))}
      </div>}

      {!queueMode && <div className="ao-summary-grid">
        <section className="ao-summary-panel" aria-labelledby="ao-attention-title">
          <div className="ao-summary-heading"><div><span className="ao-eyebrow">Priorities</span><h2 id="ao-attention-title">Needs attention</h2></div><span className="ao-attention-count">{attention.length}</span></div>
          <p className="ao-summary-intro">Resolve these blockers before packing.</p>
          {attention.length ? attention.map(order => <article className="ao-attention-item" key={order.id}>
            <TriangleAlert size={20} aria-hidden="true" />
            <div><h3>{order.issue ? 'Damaged item reported' : order.status === 'hold' ? 'Order on hold' : 'Items missing for today'}</h3><span>#{order.id} · {order.occasion}</span><p>{order.issue || (order.status === 'hold' ? 'Review this order before resuming assembly.' : `${order.total - order.received} items still awaiting receipt. This box is due today.`)}</p><button type="button" onClick={() => openPreview(order)} aria-label={'Review attention needed for ' + order.id}>Review order <ArrowRight size={14} aria-hidden="true" /></button></div>
          </article>) : <p className="ao-summary-empty">No orders need attention right now.</p>}
        </section>
        <section className="ao-summary-panel" aria-labelledby="ao-continue-title">
          <div className="ao-summary-heading"><div><span className="ao-eyebrow">Your workbench</span><h2 id="ao-continue-title">Continue working</h2></div><Settings size={22} aria-hidden="true" /></div>
          <p className="ao-summary-intro">Up to three gift boxes already in assembly.</p>
          {inProgress.length ? inProgress.map(order => <article className="ao-work-card" key={order.id}>
            <div className="ao-work-title"><span className="ao-work-icon"><Box size={25} aria-hidden="true" /></span><div><h3>#{order.id}</h3><p>{order.occasion} · {order.box} box</p></div><span className="ao-work-due">Due {order.due.toLowerCase()}</span></div>
            <StatusBadge status={order.status} /><p className="ao-work-receipt"><CircleCheck size={16} aria-hidden="true" />{order.received} of {order.total} items received</p>
            <div className="ao-work-custom"><span>Wrap<strong>{order.wrap}</strong></span><span>Ribbon<strong>{order.ribbon}</strong></span></div>
            <button type="button" className="ao-order-button" onClick={() => openPreview(order)} aria-label={'Continue preview of ' + order.id}>Continue <ArrowRight size={16} aria-hidden="true" /></button>
          </article>) : <div className="ao-summary-empty"><Box size={28} aria-hidden="true" /><p>No boxes are currently in assembly.</p><Link to="/assembler/queue?status=ready">Find a box ready to assemble</Link></div>}
          <p className="ao-summary-note">Continue opens a read-only preview while the packing workspace is being built.</p>
        </section>
        <section className="ao-quick-links" aria-label="Quick links"><Link to="/assembler/queue"><span><strong>Open Order Queue</strong><small>Search and manage the complete work list</small></span><ArrowRight size={20} aria-hidden="true" /></Link><Link to="/assembler/packing-guide"><span><strong>Packing Guide</strong><small>Preparation standards and quality checks</small></span><BookOpen size={20} aria-hidden="true" /></Link></section>
      </div>}

      {queueMode && <section className="ao-queue" aria-labelledby="ao-queue-title">
        <div className="ao-queue-heading">
          <div><h2 id="ao-queue-title">{queueMode ? 'Assembly orders' : 'My work queue'}</h2><p>{queueMode ? 'Filter the queue or open an order for a read-only preview.' : 'A preview of your upcoming assembly work.'}</p></div>
          <label className="ao-search"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order ID..." aria-label="Search by order ID" /></label>
        </div>
        <div className="ao-filters" role="group" aria-label="Filter orders by status">
          {['all', ...Object.keys(STATUS)].map(key => <button type="button" key={key} aria-pressed={status === key} className={status === key ? 'ao-filter-active' : ''} onClick={() => setStatus(key)}>{key === 'all' ? 'All orders' : STATUS[key].label}{queueMode && <span className="aq-count">{SAMPLE_ORDERS.filter(order => key === 'all' || order.status === key).length}</span>}</button>)}
        </div>
        {queueMode && <div className="aq-toolbar">
          <label>Box size<select value={box} onChange={event => setBox(event.target.value)}><option value="all">All sizes</option>{['Small', 'Medium', 'Large'].map(size => <option key={size}>{size}</option>)}</select></label>
          <label>Due<select value={due} onChange={event => setDue(event.target.value)}><option value="all">Any time</option>{['Today', 'Tomorrow', 'In 2 days'].map(day => <option key={day}>{day}</option>)}</select></label>
          <label>Sort by<select value={sort} onChange={event => setSort(event.target.value)}><option value="due">Due soonest</option><option value="id">Order ID</option></select></label>
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
              <td><button type="button" className={'ao-order-button' + (order.status === 'hold' ? ' ao-order-issue' : '')} aria-label={(order.status === 'hold' ? 'View issue for ' : 'Preview order ') + order.id} onClick={() => openPreview(order)}>{order.status === 'hold' ? 'View issue' : 'Open order'}<ArrowUpRight size={14} aria-hidden="true" /></button></td>
            </tr>)}</tbody>
          </table>
        </div>
        {orders.length === 0 && <div className="ao-empty"><Inbox size={32} aria-hidden="true" /><h3>No matching orders</h3><p>Try another order ID or clear the filters.</p><button type="button" onClick={reset}>Clear filters</button></div>}
        <div className="ao-queue-footer"><span role="status">{orders.length} of {SAMPLE_ORDERS.length} sample orders</span>{hasFilters && <button type="button" onClick={reset}>Clear filters</button>}{!queueMode && <Link to="/assembler/queue">View full queue</Link>}</div>
        <button type="button" className="ao-alert" onClick={() => { setSearchParams({ status: 'hold' }, { replace: true }); setBox('all'); setDue('all'); }}><TriangleAlert size={19} aria-hidden="true" /><span><strong>{onHold} order needs attention</strong> — damaged item reported</span><ArrowRight size={18} aria-hidden="true" /></button>
      </section>}

      <footer className="ao-bottom"><p>Frontend preview only. Orders and counts are illustrative; no live orders are changed.</p><Link to="/assembler/packing-guide"><BookOpen size={17} aria-hidden="true" />Packing guide<ArrowRight size={15} aria-hidden="true" /></Link></footer>

      <dialog ref={dialog} className="ao-dialog" aria-labelledby="ao-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
        {selected && <div className="ao-dialog-content">
          <div className="ao-dialog-top"><span className="ao-sample">Sample order preview</span><button type="button" autoFocus aria-label="Close order preview" className="ao-close" onClick={() => dialog.current.close()}><X size={22} /></button></div>
          <h2 id="ao-dialog-title">Order #{selected.id}</h2><StatusBadge status={selected.status} />
          <dl className="ao-details"><div><dt>Occasion</dt><dd>{selected.occasion}</dd></div><div><dt>Recipient</dt><dd>{selected.recipient}</dd></div><div><dt>Box size</dt><dd>{selected.box}</dd></div><div><dt>Due</dt><dd>{selected.due}</dd></div><div><dt>Wrapping</dt><dd>{selected.wrap}</dd></div><div><dt>Ribbon</dt><dd>{selected.ribbon}</dd></div><div><dt>Items received</dt><dd>{selected.received} of {selected.total}</dd></div></dl>
          <div className="ao-message"><h3>Gift message</h3><p>{selected.message}</p></div>
          {selected.issue && <div className="ao-issue-note"><h3>Reported issue</h3><p>{selected.issue}</p></div>}
          <p className="ao-dialog-note">Read-only preview. Receipt confirmation and packing checks will be added in the order workspace.</p>
          <button type="button" className="ao-dialog-done" onClick={() => dialog.current.close()}>{queueMode ? 'Back to queue' : 'Back to overview'}</button>
        </div>}
      </dialog>
    </section>
  );
}
