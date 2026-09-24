import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardCheck, Box, Gift, CircleCheck, AlertTriangle, ArrowRight, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react';
import { CHECKS } from './workspaceState';
import './PackingGuide.css';

const steps = [
  { title: 'Receive & inspect', subtitle: 'Every item accounted for. Every detail checked.', icon: ClipboardCheck, tag: 'Items & receipt', items: [
    ['Match the delivery', 'Check product names, vendors, and quantities against the order.'],
    ['Inspect the condition', 'Look for damage, leaks, broken seals, or incorrect items.'],
    ['Confirm receipt', 'Record quantities and condition in the order workspace. Confirm only when all items arrive in good condition.'],
  ], tip: 'Something missing or damaged? Report it before starting assembly.' },
  { title: 'Prepare the box', subtitle: 'Build a secure foundation for the gift.', icon: Box, tag: 'Box preparation', items: [
    ['Choose the correct box', 'Match the selected size. The box should be clean, dry, and undamaged.'],
    ['Add a protective base', 'Line the bottom with filling and check that every product will fit.'],
    ['Protect fragile items', 'Wrap breakable items individually. Follow product-specific handling instructions.'],
  ], tip: 'If the contents do not fit, report the problem instead of changing the order.' },
  { title: 'Pack & personalize', subtitle: 'Bring the customer’s choices to life.', icon: Gift, tag: 'Customer customization', items: [
    ['Arrange with care', 'Place heavier products below lighter ones, keep sealed liquids upright, and fill gaps to prevent movement.'],
    ['Match the finishing touches', 'Use the selected wrapping, ribbon, card template, and optional wax seal.'],
    ['Check the message', 'Verify sender and recipient names. Preserve the gift message exactly as written and position the card neatly.'],
  ], tip: 'Keep the customer customization panel open while packing. Do not substitute materials without approval.' },
  { title: 'Check & submit', subtitle: 'One final look before the box moves forward.', icon: CircleCheck, tag: 'Packing & QA', items: [
    ['Inspect the finished box', 'Check the contents, protection, wrapping, message, and overall presentation.'],
    ['Complete the QA checklist', 'Record each check in Packing & QA and save any useful notes.'],
    ['Submit for admin approval', 'All receipts must be confirmed, assembly started, checks completed, and holds resolved. Final delivery approval belongs to the admin.'],
  ], tip: 'Submitted means awaiting approval. It does not mean approved or delivered.' },
];

export default function PackingGuide() {
  const [open, setOpen] = useState(0);
  return <section className="pg-page" aria-labelledby="pg-title">
    <nav className="pg-breadcrumb" aria-label="Breadcrumb"><Link to="/assembler">Overview</Link><span aria-hidden="true">/</span><span aria-current="page">Packing Guide</span></nav>
    <header className="pg-header">
      <h1 id="pg-title">Packing Guide</h1>
      <p>Follow these four steps to prepare, personalize, and check each gift box.</p>
    </header>
    <div className="pg-layout">
      <div className="pg-instructions">
        <div className="pg-section-title"><div><span className="pg-kicker">THE PROCESS</span><h2>From receipt to ready.</h2></div><span>Open a step to explore</span></div>
        <div className="pg-accordion">{steps.map(({ title, subtitle, icon: Icon, tag, items, tip }, index) => <section className={'pg-step' + (open === index ? ' is-open' : '')} key={title}>
          <h3><button type="button" id={'pg-trigger-' + index} aria-expanded={open === index} aria-controls={'pg-content-' + index} onClick={() => setOpen(open === index ? null : index)}><span className="pg-number">0{index + 1}</span><span className="pg-step-label"><strong>{title}</strong><small>{subtitle}</small></span><ChevronDown className="pg-chevron" size={20} aria-hidden="true" /></button></h3>
          <div id={'pg-content-' + index} role="region" aria-labelledby={'pg-trigger-' + index} hidden={open !== index} className="pg-step-body"><span className="pg-location"><Icon size={15} aria-hidden="true" />{tag}</span><ul>{items.map(([heading, text]) => <li key={heading}><span className="pg-dot" /><div><h4>{heading}</h4><p>{text}</p></div></li>)}</ul><p className="pg-tip"><Sparkles size={16} aria-hidden="true" /><span>{tip}</span></p></div>
        </section>)}</div>
      </div>
      <aside className="pg-qa" aria-labelledby="pg-qa-title"><span className="pg-qa-icon"><ShieldCheck size={27} aria-hidden="true" /></span><span className="pg-kicker">THE FINAL DETAILS</span><h2 id="pg-qa-title">Before you submit</h2><p>Small checks. A big difference.</p><ul>{CHECKS.map(check => <li key={check}><CircleCheck size={17} aria-hidden="true" /><span>{check}</span></li>)}</ul><div className="pg-qa-note"><strong>A reminder, not a checklist.</strong><p>Record your checks in the order’s <b>Packing & QA</b> tab.</p></div><div className="pg-approval"><ShieldCheck size={16} aria-hidden="true" /><span>Final delivery approval: <strong>Admin</strong></span></div></aside>
    </div>
    <div className="pg-problem"><span className="pg-problem-icon"><AlertTriangle size={22} aria-hidden="true" /></span><div><h2>Something isn’t quite right?</h2><p>Pause packing. Record the missing, damaged, or incorrect item and use <strong>Report issue</strong> inside the order workspace.</p><details><summary>How to resume after an issue</summary><p>Coordinate with the administrator. After the problem is resolved, update quantities and item condition, clear the hold, confirm receipt again, and repeat the packing checks.</p></details></div></div>
    <footer className="pg-footer"><div><h2>Ready to make someone’s day?</h2><p>Choose an order and put the guide into practice.</p></div><Link to="/assembler/queue">Open Order Queue<ArrowRight size={18} aria-hidden="true" /></Link></footer>
    <p className="pg-demo-note">Save receipts, issues, and packing checks in the order workspace. Submissions are recorded for admin review.</p>
  </section>;
}

