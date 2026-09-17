import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Box, Settings, CircleCheck, Clock, TriangleAlert, Search, ArrowUpRight, ArrowRight, X, Inbox, BookOpen } from 'lucide-react';
import { STATUS, SAMPLE_ORDERS, filterOrders } from './overviewData';
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

export default function AssemblerDashboard() {
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const dialog = useRef(null);
  const orders = filterOrders(SAMPLE_ORDERS, status, query);
  const onHold = SAMPLE_ORDERS.filter(order => order.status === 'hold').length;
  const openPreview = order => {
    setSelected(order);
    dialog.current.showModal();
  };
  const reset = () => { setStatus('all'); setQuery(''); };

  return (
    <section className="asm-overview" aria-labelledby="ao-title">
      <header className="ao-header">
        <div>
          <div className="ao-title-row"><h1 id="ao-title">Assembly overview</h1><span className="ao-sample">Sample data</span></div>
          <p>Receive items. Prepare gifts. Keep every detail right.</p>
        </div>
        <div className="ao-date"><span>Today</span><time dateTime={new Date().toLocaleDateString('en-CA')}>{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</time></div>
      </header>

      <div className="ao-metrics" aria-label="Assembly summary">
        {metrics.map(({ status: key, icon: Icon, hint }) => (
          <button key={key} type="button" className={'ao-metric' + (status === key ? ' ao-metric-selected' : '')} aria-pressed={status === key} onClick={() => { setStatus(key); setQuery(''); }}>
            <span className={'ao-metric-icon ao-tone-' + STATUS[key].tone}><Icon size={24} aria-hidden="true" /></span>
            <span><span className="ao-metric-label">{STATUS[key].label}</span><strong>{String(SAMPLE_ORDERS.filter(order => order.status === key).length).padStart(2, '0')}</strong><span className="ao-metric-hint">{hint}</span></span>
            <ArrowUpRight className="ao-metric-arrow" size={16} aria-hidden="true" />
          </button>
        ))}
      </div>

      <section className="ao-queue" aria-labelledby="ao-queue-title">
        <div className="ao-queue-heading">
          <div><h2 id="ao-queue-title">My work queue</h2><p>A preview of your upcoming assembly work.</p></div>
          <label className="ao-search"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order ID..." aria-label="Search by order ID" /></label>
        </div>
        <div className="ao-filters" role="group" aria-label="Filter orders by status">
          {['all', ...Object.keys(STATUS)].map(key => <button type="button" key={key} aria-pressed={status === key} className={status === key ? 'ao-filter-active' : ''} onClick={() => setStatus(key)}>{key === 'all' ? 'All orders' : STATUS[key].label}</button>)}
        </div>
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
        <div className="ao-queue-footer"><span role="status">{orders.length} of {SAMPLE_ORDERS.length} sample orders</span>{(status !== 'all' || query) && <button type="button" onClick={reset}>Clear filters</button>}</div>
        <button type="button" className="ao-alert" onClick={() => { setStatus('hold'); setQuery(''); }}><TriangleAlert size={19} aria-hidden="true" /><span><strong>{onHold} order needs attention</strong> — damaged item reported</span><ArrowRight size={18} aria-hidden="true" /></button>
      </section>

      <footer className="ao-bottom"><p>Frontend preview only. Orders and counts are illustrative; no live orders are changed.</p><Link to="/assembler/packing-guide"><BookOpen size={17} aria-hidden="true" />Packing guide<ArrowRight size={15} aria-hidden="true" /></Link></footer>

      <dialog ref={dialog} className="ao-dialog" aria-labelledby="ao-dialog-title" onClick={event => { if (event.target === event.currentTarget) dialog.current.close(); }}>
        {selected && <div className="ao-dialog-content">
          <div className="ao-dialog-top"><span className="ao-sample">Sample order preview</span><button type="button" autoFocus aria-label="Close order preview" className="ao-close" onClick={() => dialog.current.close()}><X size={22} /></button></div>
          <h2 id="ao-dialog-title">Order #{selected.id}</h2><StatusBadge status={selected.status} />
          <dl className="ao-details"><div><dt>Occasion</dt><dd>{selected.occasion}</dd></div><div><dt>Recipient</dt><dd>{selected.recipient}</dd></div><div><dt>Box size</dt><dd>{selected.box}</dd></div><div><dt>Due</dt><dd>{selected.due}</dd></div><div><dt>Wrapping</dt><dd>{selected.wrap}</dd></div><div><dt>Ribbon</dt><dd>{selected.ribbon}</dd></div><div><dt>Items received</dt><dd>{selected.received} of {selected.total}</dd></div></dl>
          <div className="ao-message"><h3>Gift message</h3><p>{selected.message}</p></div>
          {selected.issue && <div className="ao-issue-note"><h3>Reported issue</h3><p>{selected.issue}</p></div>}
          <p className="ao-dialog-note">Read-only preview. Receipt confirmation and packing checks will be added in the order workspace.</p>
          <button type="button" className="ao-dialog-done" onClick={() => dialog.current.close()}>Back to overview</button>
        </div>}
      </dialog>
    </section>
  );
}
