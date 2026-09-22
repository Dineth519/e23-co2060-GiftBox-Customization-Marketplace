import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, CircleCheck, Search, SearchX, RefreshCw } from 'lucide-react';
import { useAssemblyOrders, AssemblyLoadState } from './assemblyApi';
import { filterOrders, STATUS } from './overviewData';
import './Issues.css';

export default function AssemblerIssues() {
  const { orders, loading, error, reload } = useAssemblyOrders();
  const [query, setQuery] = useState('');
  const issues = orders.filter(order => order.status === 'hold' || order.issue?.trim());
  const visible = filterOrders(issues, 'all', query);
  const held = issues.filter(order => order.status === 'hold').length;

  return (
    <section className="asm-issues" aria-labelledby="ai-title">
      <nav className="ai-breadcrumb" aria-label="Breadcrumb"><Link to="/assembler">Overview</Link><span aria-hidden="true">/</span><span aria-current="page">Issues</span></nav>
      <header className="ai-header">
        <div><div className="ai-title-row"><h1 id="ai-title">Issues</h1><span className="ai-demo">Reported issues</span></div><p>Review problems that need attention before a gift box can move forward.</p></div>
        <button type="button" className="ai-refresh" onClick={reload} disabled={loading}><RefreshCw size={16} aria-hidden="true" />Refresh</button>
      </header>
      <AssemblyLoadState loading={loading} error={error} reload={reload} />
      <div className="ai-summary"><AlertTriangle size={22} aria-hidden="true" /><div><strong>{issues.length} {issues.length === 1 ? 'order needs' : 'orders need'} attention</strong><p>{held} on hold · Inspect items and resolve issues inside each order workspace.</p></div></div>
      <section className="ai-panel" aria-labelledby="ai-list-title">
        <div className="ai-toolbar"><h2 id="ai-list-title">Reported problems</h2><label className="ai-search"><Search size={18} aria-hidden="true" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search order ID..." aria-label="Search issues by order ID" /></label></div>
        {visible.length > 0 && <div className="ai-table-scroll" tabIndex={0} role="region" aria-label="Orders needing attention"><table><thead><tr><th scope="col">Order</th><th scope="col">Issue</th><th scope="col">Items received</th><th scope="col">Status</th><th scope="col">Action</th></tr></thead><tbody>{visible.map(order => <tr key={order.id}>
          <td><strong>#{order.id}</strong><small>{order.occasion} · {order.box} box</small></td>
          <td className="ai-description">{order.issue?.trim() || 'This order is on hold. Review item receipts and condition before continuing.'}</td>
          <td><span>{order.received} of {order.total}</span><small>{order.total - order.received > 0 ? `${order.total - order.received} still missing` : 'All quantities received'}</small></td>
          <td><span className={'ai-badge' + (order.status === 'hold' ? ' ai-badge-hold' : '')}>{STATUS[order.status].label}</span></td>
          <td><Link className="ai-review" to={'/assembler/orders/' + order.id} aria-label={'Review order ' + order.id}>Review order<ArrowRight size={15} aria-hidden="true" /></Link></td>
        </tr>)}</tbody></table></div>}
        {!loading && !error && visible.length === 0 && <div className="ai-empty">{issues.length === 0 ? <><CircleCheck size={38} aria-hidden="true" /><h3>No outstanding issues</h3><p>There are no reported problems or held orders in your work queue.</p><Link className="ai-review" to="/assembler/queue">Open Order Queue<ArrowRight size={15} aria-hidden="true" /></Link></> : <><SearchX size={38} aria-hidden="true" /><h3>No matching orders</h3><p>Try a different order ID or clear your search.</p><button type="button" className="ai-refresh" onClick={() => setQuery('')}>Clear search</button></>}</div>}
        <div className="ai-results"><span role="status">{visible.length} of {issues.length} orders needing attention</span>{query && <button type="button" onClick={() => setQuery('')}>Clear search</button>}</div>
      </section>

      <p className="ai-footnote">Issues are saved with the order. Resolve item problems in the order workspace, then clear the hold.</p>
    </section>
  );
}
