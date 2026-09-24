import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, useBlocker } from 'react-router-dom';
import { ArrowLeft, Gift, Check, AlertTriangle, X } from 'lucide-react';
import { STATUS } from './overviewData.js';
import { CHECKS, receiptsReady, canSubmit } from './workspaceState';
import { fetchAssemblyOrder, saveAssemblyOrder } from './assemblyApi';
import './OrderWorkspace.css';

function ItemImage({ item }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [item.imageUrl]);
  return item.imageUrl && !failed
    ? <img className="aw-product-image" src={item.imageUrl} alt={item.name} loading="lazy" onError={() => setFailed(true)} />
    : <span className="aw-product-icon" aria-label="Product image unavailable">{item.name?.slice(0, 2).toUpperCase()}</span>;
}

export default function OrderWorkspace() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setOrder(null); setError('');
    fetchAssemblyOrder(orderId).then(result => { if (active) setOrder(result); })
      .catch(failure => { if (active) setError(failure.message); });
    return () => { active = false; };
  }, [orderId, attempt]);
  if (error) return <section className="aw-page"><h1>Unable to open order</h1><p role="alert">{error}</p><button onClick={() => setAttempt(value => value + 1)}>Retry</button> <Link to="/assembler/queue">Back to queue</Link></section>;
  if (!order || order.id !== orderId) return <p role="status">Loading order…</p>;
  return <Workspace key={orderId} order={order} />;
}

function Workspace({ order }) {
  const [state, setState] = useState(order.workspace);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const allowLogout = useRef(false);
  const [tab, setTab] = useState('receipt');
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [issueDraft, setIssueDraft] = useState('');
  const issueDialog = useRef(null);
  const blocker = useBlocker(() => (dirty || savingRef.current) && !allowLogout.current);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (savingRef.current) { blocker.reset(); return; }
      if (window.confirm('Leave without saving your changes?')) blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    const logout = event => {
      if (savingRef.current || (dirty && !window.confirm('Your changes are not saved. Log out anyway?'))) event.preventDefault();
      else allowLogout.current = true;
    };
    window.addEventListener('assembly:logout', logout);
    return () => window.removeEventListener('assembly:logout', logout);
  }, [dirty]);
  const locked = state.status === 'review';
  const ready = receiptsReady(state);
  const received = state.items.reduce((sum, item) => sum + item.received, 0);
  const step = locked ? 3 : state.status === 'assembling' ? (state.checks.every(Boolean) ? 2 : 1) : 0;
  useEffect(() => {
    const warn = event => { if (dirty || savingRef.current) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  function edit(next) { setState(next); setDirty(true); setNotice(''); setError(''); }
  async function persist(action, next = state) {
    if (savingRef.current) return false;
    savingRef.current = true; setSaving(true); setError(''); setNotice('');
    try {
      const updated = await saveAssemblyOrder(order.id, action, next);
      setState(updated.workspace); setDirty(false);
      setNotice(updated.workspace.activity.at(-1)?.text || 'Saved successfully.');
      return true;
    } catch (failure) { setError(failure.message + ' Your edits are still on this page.'); return false; }
    finally { savingRef.current = false; setSaving(false); }
  }
  function updateItem(id, field, value) {
    const items = state.items.map(item => item.id === id ? { ...item, [field]: value } : item);
    edit({ ...state, items, receiptConfirmed: false, checks: CHECKS.map(() => false), status: state.issue ? 'hold' : 'awaiting' });
  }
  const tabs = [['receipt', 'Items & receipt'], ['packing', 'Packing & QA'], ['activity', 'Activity']];
  function tabKeys(event, index) {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); setTab(tabs[next][0]); document.getElementById('aw-tab-' + tabs[next][0])?.focus(); }
  }
  return <section className="aw-page" aria-labelledby="aw-title" aria-busy={saving}><fieldset className="aw-save-fields" disabled={saving}>
    <Link className="aw-back" to="/assembler/queue"><ArrowLeft size={16} />Back to queue</Link>
    <header className="aw-header"><div><span className="aw-demo">Assembly workspace</span><h1 id="aw-title">Order #{order.id}</h1><p>{order.occasion} gift · Due {order.due.toLowerCase()} <span className={'aw-status aw-' + state.status}>{STATUS[state.status].label}</span></p></div>
      <ol className="aw-steps" aria-label="Assembly progress">{['Receive items', 'Assemble', 'Quality check', 'Admin approval'].map((label, index) => <li key={label} className={index < step ? 'aw-step-done' : index === step ? 'aw-step-current' : ''} aria-current={index === step ? 'step' : undefined}><span>{index < step ? <Check size={14} /> : index + 1}</span>{label}</li>)}</ol>
    </header>
    {error && <p className="aw-error" role="alert">{error}</p>}
    {notice && <p className="aw-notice" role="status">{notice}</p>}
    {state.issue && <div className="aw-issue"><AlertTriangle size={20} /><div><strong>Order on hold</strong><p>{state.issue}</p><small>Resolve the item problem, then clear the hold below.</small></div></div>}
    {locked && <p className="aw-notice">Submitted for admin approval. Editing is locked while the box awaits review.</p>}
    <div className="aw-columns">
      <div className="aw-panel">
        <div className="aw-tabs" role="tablist" aria-label="Order workspace">{tabs.map(([id, label], index) => <button key={id} id={'aw-tab-' + id} type="button" role="tab" aria-selected={tab === id} aria-controls={'aw-panel-' + id} tabIndex={tab === id ? 0 : -1} onKeyDown={event => tabKeys(event, index)} onClick={() => setTab(id)}>{label}</button>)}</div>
        <div className="aw-tab-body" role="tabpanel" id={'aw-panel-' + tab} aria-labelledby={'aw-tab-' + tab} tabIndex={0}>
          {tab === 'receipt' && <>
            <div className="aw-section-heading"><div><h2>Item receipt</h2><p>Check each vendor delivery against the expected quantity.</p></div><strong>{received} / {order.total} received</strong></div>
            <p className="aw-small">Check the ordered products and quantities below. Editing receipts resets packing checks.</p>
            {state.items.map(item => <article className="aw-item" key={item.id}><div className="aw-item-heading"><ItemImage item={item} /><div><h3>{item.name}</h3><p>{item.vendor}</p></div><span>Expected: {item.expected}</span></div>
              <div className="aw-item-fields"><label>Received quantity<select disabled={locked} value={item.received} onChange={event => updateItem(item.id, 'received', Number(event.target.value))}>{Array.from({ length: item.expected + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select></label><label>Item condition<select disabled={locked} value={item.condition} onChange={event => updateItem(item.id, 'condition', event.target.value)}><option value="unchecked">Not inspected</option><option value="good">Good condition</option><option value="damaged">Damaged</option><option value="incorrect">Incorrect item</option></select></label></div>
              <p className="aw-small">{item.received < item.expected ? (item.expected - item.received) + ' item(s) still missing.' : 'All expected items received.'}</p>
            </article>)}
            {!ready && <p className="aw-warning">Receive all items and confirm good condition before confirming receipt.</p>}
            <button className="aw-primary" type="button" disabled={!ready || !!state.issue || state.receiptConfirmed || locked} onClick={() => persist('confirm')}>{state.receiptConfirmed ? 'Receipt confirmed' : 'Confirm receipt'}</button>
            {state.issue && <button className="aw-secondary" type="button" disabled={!ready || locked} onClick={() => persist('resolve')}>Mark issue resolved</button>}
          </>}
          {tab === 'packing' && <>
            <h2>Packing checklist</h2><p className="aw-small">Verify the customer choices before submitting the finished box.</p>
            {!state.receiptConfirmed && <p className="aw-warning">Confirm all item receipts first.</p>}
            {state.receiptConfirmed && state.status === 'ready' && <button className="aw-primary" type="button" onClick={() => persist('start')}>Start assembly</button>}
            <fieldset className="aw-checklist" disabled={state.status !== 'assembling' || !!state.issue}><legend>Quality checks · {state.checks.filter(Boolean).length} of {CHECKS.length}</legend>{CHECKS.map((label, index) => <label key={label}><input type="checkbox" checked={state.checks[index]} onChange={event => edit({ ...state, checks: state.checks.map((value, i) => i === index ? event.target.checked : value) })} />{label}</label>)}</fieldset>
            <label className="aw-notes">Packing notes<textarea maxLength={1000} rows={4} disabled={locked} value={state.notes} onChange={event => edit({ ...state, notes: event.target.value })} placeholder="Record any useful packing details..." /></label>
            <Link className="aw-back" to="/assembler/packing-guide">Open packing guide</Link>
            {!canSubmit(state) && !locked && <p className="aw-warning">Receipt must be confirmed, assembly started, all checks completed, and holds resolved before submission.</p>}
          </>}
          {tab === 'activity' && <><h2>Order activity</h2><p className="aw-small">Saved actions recorded for this order.</p><ol className="aw-timeline">{[...state.activity].reverse().map((event, index) => <li key={index}><span className="aw-timeline-dot" /><div><p>{event.text}</p><small>{event.time ? new Date(event.time).toLocaleString() : 'Time not recorded'}</small></div></li>)}</ol></>}
        </div>
      </div>
      <aside className="aw-panel aw-customization" aria-label="Customer customization"><h2>Customer customization</h2><div className="aw-gift-preview"><img src={`/boxes/${(order.box || 'medium').toLowerCase()}.jpg`} alt={`${order.box} gift box`} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} /><span>{order.box} gift box</span></div><dl>{[['Box', order.box], ['Wrap', order.wrap], ['Ribbon', order.ribbon], ['Card', order.card], ['Wax seal', order.waxSeal], ['To', order.recipient], ['From', order.sender]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><h3>Gift message</h3><blockquote>{order.message}</blockquote><p className="aw-small">Illustrative preview. Use the listed customer choices when packing.</p></aside>
    </div>
    <footer className="aw-actions"><div><strong>Final delivery approval: Admin</strong><small>{saving ? 'Saving…' : dirty ? 'Unsaved changes' : 'All changes saved'}</small></div><button className="aw-danger" type="button" disabled={locked} onClick={() => { setIssueDraft(''); issueDialog.current.showModal(); }}>Report issue</button><button className="aw-secondary" type="button" disabled={!dirty || locked} onClick={() => persist('save')}>Save progress</button><button className="aw-primary" type="button" disabled={!canSubmit(state)} onClick={() => { if (canSubmit(state)) persist('submit'); }}>Submit for approval</button></footer>
    <dialog ref={issueDialog} className="aw-dialog" aria-labelledby="aw-issue-title"><form onSubmit={async event => { event.preventDefault(); if (issueDraft.trim() && await persist('report', { ...state, issue: issueDraft.trim() })) issueDialog.current.close(); }}><div className="aw-section-heading"><h2 id="aw-issue-title">Report an issue</h2><button type="button" className="aw-close" aria-label="Close issue form" onClick={() => issueDialog.current.close()}><X /></button></div><p className="aw-small">This saves the issue on the order and pauses assembly until it is resolved.</p><label>What needs attention?<textarea autoFocus required maxLength={500} rows={5} value={issueDraft} onChange={event => setIssueDraft(event.target.value)} placeholder="Describe the missing, damaged, or incorrect item..." /></label>{error && <p role="alert" className="aw-error">{error}</p>}<button className="aw-primary" type="submit" disabled={!issueDraft.trim()}>Report issue</button></form></dialog>
  </fieldset></section>;
}
