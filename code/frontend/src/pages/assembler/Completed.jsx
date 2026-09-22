import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CircleCheck, Search, SearchX, RefreshCw } from 'lucide-react';
import { SAMPLE_ORDERS, filterOrders } from './overviewData';
import { loadWorkspace } from './workspaceState';
import './Issues.css';

function getSubmissions() {
  return SAMPLE_ORDERS.flatMap(order => {
    const state = loadWorkspace(order);
    if (state.status !== 'review') return [];
    const submission = [...state.activity].reverse().find(event => event.text.includes('submitted for admin approval') && event.time);
    return [{ ...order, submittedAt: submission?.time || null }];
  }).sort((a, b) => (Date.parse(b.submittedAt) || 0) - (Date.parse(a.submittedAt) || 0));
}

export default function AssemblerCompleted() {
  const [orders, setOrders] = useState(getSubmissions);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    const reload = () => setOrders(getSubmissions());
    window.addEventListener('storage', reload);
    window.addEventListener('focus', reload);
    return () => {
      window.removeEventListener('storage', reload);
      window.removeEventListener('focus', reload);
    };
  }, []);
  const visible = filterOrders(orders, 'all', query);
  return <section className="asm-issues" aria-labelledby="ac-title">
    <nav className="ai-breadcrumb" aria-label="Breadcrumb"><Link to="/assembler">Overview</Link><span aria-hidden="true">/</span><span aria-current="page">Completed</span></nav>
    <header className="ai-header"><div><div className="ai-title-row"><h1 id="ac-title">Completed assembly</h1><span className="ai-demo">Local demo data</span></div><p>Review boxes submitted after assembly and quality checks.</p></div><button type="button" className="ai-refresh" onClick={() => { setOrders(getSubmissions()); setNotice('Updated from submissions saved on this browser.'); }}><RefreshCw size={16} aria-hidden="true" />Refresh</button></header>
    <div className="ai-summary ac-summary"><CircleCheck size={22} aria-hidden="true" /><div><strong>{orders.length} {orders.length === 1 ? 'box submitted' : 'boxes submitted'}</strong><p>Awaiting admin approval. Submission does not mean a box is approved or delivered.</p></div></div>
    <section className="ai-panel" aria-labelledby="ac-list-title">
      <div className="ai-toolbar"><h2 id="ac-list-title">Assembly submissions</h2><label className="ai-search"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order ID..." aria-label="Search completed orders by order ID" /></label></div>
      {visible.length > 0 && <div className="ai-table-scroll" tabIndex={0} role="region" aria-label="Submitted assembly orders"><table><thead><tr><th scope="col">Order</th><th scope="col">Occasion</th><th scope="col">Box size</th><th scope="col">Submitted</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>{visible.map(order => <tr key={order.id}>
        <td><strong>#{order.id}</strong><small>To {order.recipient}</small></td><td>{order.occasion}</td><td>{order.box}</td>
        <td>{order.submittedAt && Number.isFinite(Date.parse(order.submittedAt)) ? <time dateTime={order.submittedAt}>{new Date(order.submittedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</time> : <span>Not recorded<small>Initial sample submission</small></span>}</td>
        <td><span className="ai-badge">Awaiting admin approval</span></td><td><Link className="ai-review" to={'/assembler/orders/' + order.id} aria-label={'View details for order ' + order.id}>View details<ArrowRight size={15} aria-hidden="true" /></Link></td>
      </tr>)}</tbody></table></div>}
      {visible.length === 0 && <div className="ai-empty">{orders.length === 0 ? <><CircleCheck size={38} aria-hidden="true" /><h3>No submitted boxes yet</h3><p>Complete receipts, assembly, and quality checks in an order workspace, then submit it for approval.</p><Link className="ai-review" to="/assembler/queue">Open Order Queue<ArrowRight size={15} aria-hidden="true" /></Link></> : <><SearchX size={38} aria-hidden="true" /><h3>No matching orders</h3><p>Try a different order ID or clear your search.</p><button type="button" className="ai-refresh" onClick={() => setQuery('')}>Clear search</button></>}</div>}
      <div className="ai-results"><span role="status">{visible.length} of {orders.length} submitted boxes</span>{query && <button type="button" onClick={() => setQuery('')}>Clear search</button>}</div>
    </section>
    <p className="ai-notice" role="status">{notice}</p><p className="ai-footnote">Sample orders and locally saved submissions only. Final delivery approval belongs to the admin; this page sends no notifications or backend updates.</p>
  </section>;
}
