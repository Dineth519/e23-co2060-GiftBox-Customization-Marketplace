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
  const [viewStep, setViewStep] = useState(order.workspace.receiptConfirmed ? 2 : 1);
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
  
  useEffect(() => {
    if (!dirty || saving) return;
    const timer = setTimeout(() => {
      persist('save');
    }, 2000);
    return () => clearTimeout(timer);
  }, [state, dirty, saving]);
  const locked = state.status === 'completed' || state.status === 'review';
  const ready = receiptsReady(state);
  const received = state.items.reduce((sum, item) => sum + item.received, 0);
  const step = locked ? 2 : state.status === 'assembling' ? 1 : 0;
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
      if (action === 'confirm') setViewStep(2);
      return true;
    } catch (failure) { setError(failure.message + ' Your edits are still on this page.'); return false; }
    finally { savingRef.current = false; setSaving(false); }
  }

  useEffect(() => {
    if (viewStep === 2 && state.status === 'ready' && !saving) {
      persist('confirm');
    }
  }, [viewStep, state.status, saving]);
  function updateItem(id, field, value) {
    const items = state.items.map(item => item.id === id ? { ...item, [field]: value } : item);
    edit({ ...state, items, receiptConfirmed: false, checks: CHECKS.map(() => false), status: state.issue ? 'hold' : 'awaiting' });
  }
  return <section className="aw-page" aria-labelledby="aw-title" aria-busy={saving}><fieldset className="aw-save-fields" disabled={saving}>
    <Link className="aw-back" to="/assembler/queue"><ArrowLeft size={16} />Back to queue</Link>
    <header className="aw-header"><div><span className="aw-demo">Assembly workspace</span><h1 id="aw-title">Order #{order.id}</h1><p>{order.occasion} gift · Due {order.due.toLowerCase()} <span className={'aw-status aw-' + state.status}>{STATUS[state.status]?.label || state.status}</span></p></div>
      <ol className="aw-steps" aria-label="Assembly progress">{['Receive items', 'Assembling', 'Delivered'].map((label, index) => <li key={label} className={index < step ? 'aw-step-done' : index === step ? 'aw-step-current' : ''} aria-current={index === step ? 'step' : undefined}><span>{index < step ? <Check size={14} /> : index + 1}</span>{label}</li>)}</ol>
    </header>
    {error && <p className="aw-error" role="alert">{error}</p>}
    {notice && <p className="aw-notice" role="status">{notice}</p>}
    {state.issue && <div className="aw-issue"><AlertTriangle size={20} /><div><strong>Order on hold</strong><p>{state.issue}</p><small>Resolve the item problem, then clear the hold below.</small></div></div>}
    {locked && <p className="aw-notice">Assembly completed. The order is now marked as delivered.</p>}
    <div className={"aw-columns" + (viewStep === 1 ? " aw-single-column" : "")}>
      <div className="aw-panel">
        <div className="aw-tab-body" role="tabpanel" id={'aw-panel-wizard'} tabIndex={0}>
          {viewStep === 1 ? <>
            <div className="aw-section-heading"><div><h2>Item receipt</h2><p>Check each vendor delivery against the expected quantity.</p></div><strong>{received} / {order.total} received</strong></div>
            <p className="aw-small">Check the ordered products and quantities below. Editing receipts resets packing checks.</p>
            {state.items.map(item => <article className="aw-item" key={item.id}><div className="aw-item-heading"><ItemImage item={item} /><div><h3>{item.name}</h3><p>{item.vendor}</p></div><span>Expected: {item.expected}</span></div>
              <div className="aw-item-fields" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" disabled={locked} checked={item.received === item.expected} onChange={event => updateItem(item.id, 'received', event.target.checked ? item.expected : 0)} style={{ width: '16px', height: '16px', accentColor: '#386e5a', margin: 0 }} />
                  <span>All expected counts ({item.expected}) received</span>
                </label>
                <label style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" disabled={locked} checked={item.condition === 'good'} onChange={event => updateItem(item.id, 'condition', event.target.checked ? 'good' : 'unchecked')} style={{ width: '16px', height: '16px', accentColor: '#386e5a', margin: 0 }} />
                  <span>All are in good condition</span>
                </label>
              </div>
            </article>)}
            {!ready && <p className="aw-warning">Receive all items and confirm good condition before confirming receipt.</p>}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="aw-primary" type="button" disabled={!ready || !!state.issue || locked} onClick={() => {
                if (state.status !== 'assembling') persist('confirm').then(res => res && setViewStep(2));
                else setViewStep(2);
              }}>Next step &rarr;</button>
              <button className="aw-danger" type="button" disabled={locked} onClick={() => { setIssueDraft(''); issueDialog.current.showModal(); }}>Report issue</button>
              {state.issue && <button className="aw-secondary" type="button" disabled={!ready || locked} onClick={() => persist('resolve')}>Mark issue resolved</button>}
            </div>
          </> : <>
            <h2>Assembling & Quality Check</h2><p className="aw-small">Assemble the box and verify the quality checks before marking as delivered.</p>
            {!state.receiptConfirmed && <p className="aw-warning">Confirm all item receipts first.</p>}
            <fieldset className="aw-checklist" disabled={locked || !!state.issue}><legend>Quality checks · {state.checks.filter(Boolean).length} of {CHECKS.length}</legend>{CHECKS.map((label, index) => <label key={label}><input type="checkbox" checked={state.checks[index]} onChange={event => edit({ ...state, checks: state.checks.map((value, i) => i === index ? event.target.checked : value) })} />{label}</label>)}</fieldset>
            <label className="aw-notes">Packing notes<textarea maxLength={1000} rows={4} disabled={locked} value={state.notes} onChange={event => edit({ ...state, notes: event.target.value })} placeholder="Record any useful packing details..." /></label>
            {!canSubmit(state) && !locked && <p className="aw-warning">Receipt must be confirmed, all checks completed, and holds resolved before submission.</p>}
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
              <button className="aw-secondary" style={{ padding: '11px 15px', fontSize: '12px' }} type="button" onClick={() => setViewStep(1)}>&larr; Back to item receipt</button>
              <button className="aw-danger" type="button" disabled={locked} onClick={() => { setIssueDraft(''); issueDialog.current.showModal(); }}>Report issue</button>
              <button className="aw-primary" style={{ marginLeft: 'auto' }} type="button" disabled={!canSubmit(state) || locked} onClick={async () => {
                if (canSubmit(state)) {
                  if (state.status !== 'assembling') {
                    const res = await persist('confirm');
                    if (!res) return;
                  }
                  persist('submit');
                }
              }}>Mark as Delivered</button>
            </div>
          </>}
        </div>
      </div>
      {viewStep !== 1 && <aside className="aw-panel aw-customization" aria-label="Customer customization">
        <h2>Customer customization</h2>
        <dl>{[['Box', order.box], ['Wrap', order.wrap], ['Ribbon', order.ribbon], ['Card', order.card], ['Wax seal', order.waxSeal], ['To', order.recipient], ['From', order.sender]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <h3>Gift message</h3><blockquote>{order.message}</blockquote>
        
        <h3 style={{ marginTop: '32px' }}>Items to pack</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {state.items.map(item => (
            <li key={item.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', background: '#f8f9fa', padding: '10px', borderRadius: '8px', border: '1px solid #e9ecef' }}>
              <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', border: '1px solid #e4e2dd', background: '#faf8f3', display: 'grid', placeItems: 'center' }}>
                {item.imageUrl ? <img src={item.imageUrl} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <span style={{ fontSize: '11px', color: '#8a6928' }}>{item.name?.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div style={{ minWidth: 0, flexGrow: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                <span style={{ fontSize: '11px', color: '#6c757d' }}>Qty: {item.expected}</span>
              </div>
            </li>
          ))}
        </ul>
      </aside>}
    </div>
    <dialog ref={issueDialog} className="aw-dialog" aria-labelledby="aw-issue-title"><form onSubmit={async event => { event.preventDefault(); if (issueDraft.trim() && await persist('report', { ...state, issue: issueDraft.trim() })) issueDialog.current.close(); }}><div className="aw-section-heading"><h2 id="aw-issue-title">Report an issue</h2><button type="button" className="aw-close" aria-label="Close issue form" onClick={() => issueDialog.current.close()}><X /></button></div><p className="aw-small">This saves the issue on the order and pauses assembly until it is resolved.</p><label>What needs attention?<textarea autoFocus required maxLength={500} rows={5} value={issueDraft} onChange={event => setIssueDraft(event.target.value)} placeholder="Describe the missing, damaged, or incorrect item..." /></label>{error && <p role="alert" className="aw-error">{error}</p>}<button className="aw-primary" type="submit" disabled={!issueDraft.trim()}>Report issue</button></form></dialog>
  </fieldset></section>;
}
