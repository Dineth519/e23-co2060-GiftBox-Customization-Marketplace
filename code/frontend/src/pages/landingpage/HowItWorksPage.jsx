import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/landingpage/Header';
import Footer from '../../components/landingpage/Footer';
import './HowItWorksPage.css';

const STEPS = [
  {
    num: '01',
    icon: '🛍️',
    title: 'Browse Our Collection',
    desc: 'Explore hundreds of hand-curated premium gifts across categories — wines, watches, perfumes, chocolates, and more. Use smart filters to narrow by category, price, or occasion.',
    features: ['Smart category filters', 'Price range sorting', 'Occasion-based browse'],
    color: 'gold',
  },
  {
    num: '02',
    icon: '🎁',
    title: 'Build Your Gift Box',
    desc: 'Mix and match any items into a personalised gift box. Add a handwritten note, choose your wrapping style, and preview your box before checkout.',
    features: ['Custom mix & match', 'Personal message card', 'Premium wrapping options'],
    color: 'cyan',
  },
  {
    num: '03',
    icon: '💳',
    title: 'Secure Checkout',
    desc: 'Checkout safely with multiple payment methods. Your order details and recipient info are encrypted and handled with care.',
    features: ['Multiple payment options', 'SSL encrypted checkout', 'Order confirmation email'],
    color: 'gold',
  },
  {
    num: '04',
    icon: '🚀',
    title: 'Fast & Tracked Delivery',
    desc: 'Your gift is professionally packed and shipped with real-time tracking. We deliver islandwide across Sri Lanka with care and speed.',
    features: ['Islandwide delivery', 'Real-time tracking', 'Luxury gift packaging'],
    color: 'cyan',
  },
];

const PERKS = [
  { icon: '🌟', title: 'Curated Quality', desc: 'Every product is hand-selected for premium quality and presentation.' },
  { icon: '🔒', title: 'Safe & Secure', desc: 'All transactions are 256-bit encrypted and fully protected.' },
  { icon: '🎀', title: 'Luxury Packaging', desc: 'Gifts arrive in signature Giftora boxes with premium wrapping.' },
  { icon: '📦', title: 'Islandwide Delivery', desc: 'We deliver to every corner of Sri Lanka, quickly and reliably.' },
  { icon: '💌', title: 'Personal Touch', desc: 'Add a heartfelt handwritten note to make it extra special.' },
  { icon: '🔄', title: 'Easy Returns', desc: 'Not satisfied? Our hassle-free return policy has you covered.' },
];

const FAQ = [
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 2–4 business days islandwide. Express same-day delivery is available in select areas of Colombo.',
  },
  {
    q: 'Can I schedule a delivery for a specific date?',
    a: 'Yes! During checkout you can choose a preferred delivery date — perfect for birthdays, anniversaries, and special occasions.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit/debit cards, bank transfers, and popular mobile payment options including FriMi and iPay.',
  },
  {
    q: 'Can I send a gift directly to the recipient?',
    a: 'Absolutely. Just enter the recipient\'s address at checkout, and we\'ll ship directly to them with your personal message.',
  },
  {
    q: 'What if my gift arrives damaged?',
    a: 'We\'re sorry if that happens. Contact our support team within 48 hours of delivery and we\'ll arrange a replacement or full refund.',
  },
];

const HowItWorksPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [visibleSteps, setVisibleSteps] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (heroRef.current) heroRef.current.classList.add('hiw-hero--visible');
    }, 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.idx);
            setVisibleSteps((prev) => [...new Set([...prev, idx])]);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.hiw-step').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="hiw-page">
      <Header />

      {/* ── HERO ── */}
      <section className="hiw-hero">
        <div className="hiw-hero__orb hiw-hero__orb--1" />
        <div className="hiw-hero__orb hiw-hero__orb--2" />
        <div className="hiw-hero__orb hiw-hero__orb--3" />
        <div className="hiw-hero__grid" />

        <div className="hiw-hero__inner" ref={heroRef}>
          <div className="hiw-hero__label">Simple & Seamless</div>
          <h1 className="hiw-hero__title">
            Gifting Made<br />
            <span className="hiw-hero__title-accent">Effortless</span>
          </h1>
          <p className="hiw-hero__sub">
            From browsing to doorstep — discover how Giftora turns every occasion into an unforgettable moment.
          </p>
        </div>

        {/* floating pill strip */}
        <div className="hiw-hero__pills">
          {['100% Secure', 'Trusted Multiple Sellers', 'Premium Packaging', 'Same-Day Available', 'Easy Returns'].map((p) => (
            <span key={p} className="hiw-hero-pill">{p}</span>
          ))}
        </div>
      </section>

      {/* ── STEPS ── */}
      <section className="hiw-steps-section">
        <div className="hiw-section-header">
          <div className="hiw-section-label">The Process</div>
          <h2 className="hiw-section-title">Four Simple Steps</h2>
          <p className="hiw-section-sub">Everything you need to send the perfect gift, in minutes.</p>
        </div>

        <div className="hiw-steps-track">
          <div className="hiw-steps-line" />
          {STEPS.map((step, i) => (
            <div
              key={i}
              className={`hiw-step hiw-step--${step.color} ${visibleSteps.includes(i) ? 'hiw-step--visible' : ''} ${i % 2 === 1 ? 'hiw-step--right' : ''}`}
              data-idx={i}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="hiw-step__node">
                <span>{step.num}</span>
              </div>
              <div className="hiw-step__card">
                <div className="hiw-step__icon">{step.icon}</div>
                <h3 className="hiw-step__title">{step.title}</h3>
                <p className="hiw-step__desc">{step.desc}</p>
                <ul className="hiw-step__features">
                  {step.features.map((f) => (
                    <li key={f}><span className="hiw-feat-dot" />  {f}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PERKS GRID ── */}
      <section className="hiw-perks-section">
        <div className="hiw-section-header">
          <div className="hiw-section-label">Why Giftora</div>
          <h2 className="hiw-section-title">Everything You'd Expect — And More</h2>
        </div>
        <div className="hiw-perks-grid">
          {PERKS.map((perk, i) => (
            <div key={i} className="hiw-perk-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="hiw-perk-icon">{perk.icon}</div>
              <h4 className="hiw-perk-title">{perk.title}</h4>
              <p className="hiw-perk-desc">{perk.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="hiw-faq-section">
        <div className="hiw-faq-inner">
          <div className="hiw-section-header hiw-section-header--left">
            <div className="hiw-section-label">Got Questions?</div>
            <h2 className="hiw-section-title">Frequently Asked</h2>
          </div>
          <div className="hiw-faq-list">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className={`hiw-faq-item ${openFaq === i ? 'hiw-faq-item--open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="hiw-faq-q">
                  <span>{item.q}</span>
                  <span className="hiw-faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </div>
                <div className="hiw-faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="hiw-bottom-cta">
        <div className="hiw-bottom-cta__orb" />
        <div className="hiw-bottom-cta__inner">
          <div className="hiw-bottom-cta__icon">🎁</div>
          <h2 className="hiw-bottom-cta__title">Ready to Send Something Special?</h2>
          <p className="hiw-bottom-cta__sub">Browse our curated collection and start gifting today.</p>
          <div className="hiw-bottom-cta__btns">
            <button className="hiw-hero__cta" onClick={() => navigate('/products')}>
              Shop the Collection
            </button>
            <button className="hiw-hero__ghost" onClick={() => navigate('/build')}>
              Build a Custom Box
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HowItWorksPage;