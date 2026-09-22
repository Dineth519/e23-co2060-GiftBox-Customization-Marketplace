import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Gift, Check, AlertTriangle, X } from 'lucide-react';
import { SAMPLE_ORDERS, STATUS } from './overviewData.js';
import { CHECKS, loadWorkspace, saveWorkspace, receiptsReady, canSubmit } from './workspaceState';
import './OrderWorkspace.css';

export default function OrderWorkspace() {
  const { orderId } = useParams();
  const order = SAMPLE_ORDERS.find(item => item.id === orderId);
  if (!order) return <section className="aw-page"><h1>Order not found</h1><p>This order is not part of the sample workspace.</p><Link to="/assembler/queue">Back to queue</Link></section>;
  return <Workspace key={orderId} order={order} />;
}

function Workspace({ order }) {
  const [state, setState] = useState(() => loadWorkspace(order));
  const [tab, setTab] = useState('receipt');
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [issueDraft, setIssueDraft] = useState('');
  const issueDialog = useRef(null);
  const locked = state.status === 'review';
  const ready = receiptsReady(state);
  const received = state.items.reduce((sum, item) => sum + item.received, 0);
  const step = locked ? 3 : state.status === 'assembling' ? (state.checks.every(Boolean) ? 2 : 1) : 0;
  useEffect(() => {
    const warn = event => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function edit(next) { setState(next); setDirty(true); setNotice(''); setError(''); }
  function persist(next, text) {
    const updated = { ...next, activity: [...next.activity, { text, time: new Date().toISOString() }] };
    try {
      saveWorkspace(order.id, updated);
      setState(updated); setDirty(false); setError(''); setNotice(text + ' Saved on this browser only.');
      return true;
    } catch { setError('Progress could not be saved. Browser storage may be full or unavailable. Keep this page open and try again.'); return false; }
  }
  function updateItem(id, field, value) {
    const items = state.items.map(item => item.id === id ? { ...item, [field]: value } : item);
    edit({ ...state, items, receiptConfirmed: false, checks: CHECKS.map(() => false), status: state.issue ? 'hold' : 'awaiting' });
  }
  function navigateBack(event) { if (dirty && !window.confirm('Leave without saving your changes?')) event.preventDefault(); }
  const tabs = [['receipt', 'Items & receipt'], ['packing', 'Packing & QA'], ['activity', 'Activity']];
  function tabKeys(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); setTab(tabs[next][0]); document.getElementById('aw-tab-' + tabs[next][0])?.focus(); }
  }
  return <section className="aw-page" aria-labelledby="aw-title">
    <Link className="aw-back" to="/assembler/queue" onClick={navigateBack}><ArrowLeft size={16} />Back to queue</Link>
    <header className="aw-header"><div><span className="aw-demo">Frontend demo · saved locally</span><h1 id="aw-title">Order #{order.id}</h1><p>{order.occasion} gift · Due {order.due.toLowerCase()} <span className={'aw-status aw-' + state.status}>{STATUS[state.status].label}</span></p></div>
      <ol className="aw-steps" aria-label="Assembly progress">{['Receive items', 'Assemble', 'Quality check', 'Admin approval'].map((label, index) => <li key={label} className={index < step ? 'aw-step-done' : index === step ? 'aw-step-current' : ''} aria-current={index === step ? 'step' : undefined}><span>{index < step ? <Check size={14} /> : index + 1}</span>{label}</li>)}</ol>
    </header>
    {error && <p className="aw-error" role="alert">{error}</p>}
    {notice && <p className="aw-notice" role="status">{notice}</p>}
    {state.issue && <div className="aw-issue"><AlertTriangle size={20} /><div><strong>Order on hold</strong><p>{state.issue}</p><small>Resolve the item problem, then clear the hold below.</small></div></div>}
    {locked && <p className="aw-notice">Submitted for admin approval in this demo. Editing is locked; no real admin notification was sent.</p>}
    <div className="aw-columns">
      <div className="aw-panel">
        <div className="aw-tabs" role="tablist" aria-label="Order workspace">{tabs.map(([id, label], index) => <button key={id} id={'aw-tab-' + id} type="button" role="tab" aria-selected={tab === id} aria-controls={'aw-panel-' + id} tabIndex={tab === id ? 0 : -1} onKeyDown={event => tabKeys(event, index)} onClick={() => setTab(id)}>{label}</button>)}</div>
        <div className="aw-tab-body" role="tabpanel" id={'aw-panel-' + tab} aria-labelledby={'aw-tab-' + tab} tabIndex={0}>
          {tab === 'receipt' && <>
            <div className="aw-section-heading"><div><h2>Item receipt</h2><p>Check each vendor delivery against the expected quantity.</p></div><strong>{received} / {order.total} received</strong></div>
            <p className="aw-small">Sample vendor and product details. Editing receipts resets packing checks.</p>
            {state.items.map(item => <article className="aw-item" key={item.id}><div className="aw-item-heading"><span className="aw-product-icon" aria-hidden="true">{item.symbol}</span><div><h3>{item.name}</h3><p>{item.vendor}</p></div><span>Expected: {item.expected}</span></div>
              <div className="aw-item-fields"><label>Received quantity<select disabled={locked} value={item.received} onChange={event => updateItem(item.id, 'received', Number(event.target.value))}>{Array.from({ length: item.expected + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select></label><label>Item condition<select disabled={locked} value={item.condition} onChange={event => updateItem(item.id, 'condition', event.target.value)}><option value="unchecked">Not inspected</option><option value="good">Good condition</option><option value="damaged">Damaged</option><option value="incorrect">Incorrect item</option></select></label></div>
              <p className="aw-small">{item.received < item.expected ? (item.expected - item.received) + ' item(s) still missing.' : 'All expected items received.'}</p>
            </article>)}
            {!ready && <p className="aw-warning">Receive all items and confirm good condition before confirming receipt.</p>}
            <button className="aw-primary" type="button" disabled={!ready || !!state.issue || state.receiptConfirmed || locked} onClick={() => persist({ ...state, receiptConfirmed: true, status: 'ready' }, 'All items received and inspected.')}>{state.receiptConfirmed ? 'Receipt confirmed' : 'Confirm receipt'}</button>
            {state.issue && <button className="aw-secondary" type="button" disabled={!ready || locked} onClick={() => persist({ ...state, issue: '', status: 'awaiting', receiptConfirmed: false }, 'Issue resolved; hold cleared. Confirm receipt to continue.')}>Mark issue resolved (demo)</button>}
          </>}
          {tab === 'packing' && <>
            <h2>Packing checklist</h2><p className="aw-small">Verify the customer choices before submitting the finished box.</p>
            {!state.receiptConfirmed && <p className="aw-warning">Confirm all item receipts first.</p>}
            {state.receiptConfirmed && state.status === 'ready' && <button className="aw-primary" type="button" onClick={() => persist({ ...state, status: 'assembling' }, 'Assembly started.')}>Start assembly</button>}
            <fieldset className="aw-checklist" disabled={state.status !== 'assembling' || !!state.issue}><legend>Quality checks · {state.checks.filter(Boolean).length} of {CHECKS.length}</legend>{CHECKS.map((label, index) => <label key={label}><input type="checkbox" checked={state.checks[index]} onChange={event => edit({ ...state, checks: state.checks.map((value, i) => i === index ? event.target.checked : value) })} />{label}</label>)}</fieldset>
            <label className="aw-notes">Packing notes<textarea maxLength={1000} rows={4} disabled={locked} value={state.notes} onChange={event => edit({ ...state, notes: event.target.value })} placeholder="Record any useful packing details..." /></label>
            <Link className="aw-back" to="/assembler/packing-guide" onClick={navigateBack}>Open packing guide</Link>
            {!canSubmit(state) && !locked && <p className="aw-warning">Receipt must be confirmed, assembly started, all checks completed, and holds resolved before submission.</p>}
          </>}
          {tab === 'activity' && <><h2>Order activity</h2><p className="aw-small">Demo history on this browser. Only saved actions appear here.</p><ol className="aw-timeline">{[...state.activity].reverse().map((event, index) => <li key={index}><span className="aw-timeline-dot" /><div><p>{event.text}</p><small>{event.time ? new Date(event.time).toLocaleString() : 'Initial sample state'}</small></div></li>)}</ol></>}
        </div>
      </div>
      <aside className="aw-panel aw-customization" aria-label="Customer customization"><h2>Customer customization</h2><div className="aw-gift-preview"><Gift size={70} strokeWidth={1} aria-hidden="true" /><span>{order.box} gift box</span></div><dl>{[['Box', order.box], ['Wrap', order.wrap], ['Ribbon', order.ribbon], ['Card', 'Ivory script (sample)'], ['Wax seal', 'Yes (sample)'], ['To', order.recipient], ['From', 'Nimal (sample)']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><h3>Gift message</h3><blockquote>{order.message}</blockquote><p className="aw-small">Illustrative preview. Use the listed customer choices when packing.</p></aside>
    </div>
    <footer className="aw-actions"><div><strong>Final delivery approval: Admin</strong><small>{dirty ? 'Unsaved changes' : 'Local demo workspace'} · No backend updates</small></div><button className="aw-danger" type="button" disabled={locked} onClick={() => { setIssueDraft(''); issueDialog.current.showModal(); }}>Report issue</button><button className="aw-secondary" type="button" disabled={!dirty || locked} onClick={() => persist(state, 'Progress saved.')}>Save progress</button><button className="aw-primary" type="button" disabled={!canSubmit(state)} onClick={() => { if (canSubmit(state)) persist({ ...state, status: 'review' }, 'Packing and quality checks completed; submitted for admin approval (demo).'); }}>Submit for approval</button></footer>
    <dialog ref={issueDialog} className="aw-dialog" aria-labelledby="aw-issue-title"><form onSubmit={event => { event.preventDefault(); if (issueDraft.trim() && persist({ ...state, issue: issueDraft.trim(), status: 'hold', checks: CHECKS.map(() => false) }, 'Issue reported: ' + issueDraft.trim())) issueDialog.current.close(); }}><div className="aw-section-heading"><h2 id="aw-issue-title">Report an issue</h2><button type="button" className="aw-close" aria-label="Close issue form" onClick={() => issueDialog.current.close()}><X /></button></div><p className="aw-small">This places the sample order on hold. It does not notify the admin.</p><label>What needs attention?<textarea autoFocus required maxLength={500} rows={5} value={issueDraft} onChange={event => setIssueDraft(event.target.value)} placeholder="Describe the missing, damaged, or incorrect item..." /></label>{error && <p role="alert" className="aw-error">{error}</p>}<button className="aw-primary" type="submit" disabled={!issueDraft.trim()}>Save issue locally</button></form></dialog>
  </section>;
}
