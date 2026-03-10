// Core libraries
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Header from '../../components/homepage/Header';
import Footer from '../../components/homepage/Footer';
import './ProductsPage.css';

// ── #43 Add to Cart — CartContext import ──────────────────────
import { useCart } from '../../context/CartContext';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORY_MAP = { 1:'Wine', 2:'Watches', 3:'Perfume', 4:'Teddy Bears', 5:'Bangles', 6:'Chocolates' };
const CAT_ICONS    = { All:'🛍️', Wine:'🍷', Watches:'⌚', Perfume:'🌸', 'Teddy Bears':'🧸', Bangles:'💍', Chocolates:'🍫' };
const SORT_OPTIONS = [
  { value:'default',    label:'Featured',          icon:'✦' },
  { value:'price-asc',  label:'Price: Low → High', icon:'↑' },
  { value:'price-desc', label:'Price: High → Low', icon:'↓' },
  { value:'name-asc',   label:'Name: A → Z',       icon:'Az' },
];

// ─── Scroll reveal hook ───────────────────────────────────────────────────────
function useReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el); return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── ProductsPage ─────────────────────────────────────────────────────────────
const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'All';

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]           = useState('default');
  const [wishlisted, setWishlisted]   = useState({});
  const [quickView, setQuickView]     = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ref, heroVisible]            = useReveal(0.05);

  // ── #43 — cart functions ──────────────────────────────────────
  const { addToCart, addedId } = useCart();

  useEffect(() => { setActiveCategory(urlCategory); }, [urlCategory]);

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => { setAllProducts(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const categories = useMemo(() => {
    const names = allProducts.map(p => CATEGORY_MAP[p.categoryId] || 'Other');
    return ['All', ...new Set(names)];
  }, [allProducts]);

  const displayProducts = useMemo(() => {
    let f = [...allProducts];
    if (activeCategory !== 'All') f = f.filter(p => CATEGORY_MAP[p.categoryId] === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter(p => p.name.toLowerCase().includes(q) || (CATEGORY_MAP[p.categoryId]||'').toLowerCase().includes(q));
    }
    switch (sortBy) {
      case 'price-asc':  f.sort((a,b) => a.price - b.price); break;
      case 'price-desc': f.sort((a,b) => b.price - a.price); break;
      case 'name-asc':   f.sort((a,b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return f;
  }, [allProducts, activeCategory, searchQuery, sortBy]);

  const handleCategory = (cat) => {
    setActiveCategory(cat); setSearchQuery('');
    cat === 'All' ? setSearchParams({}) : setSearchParams({ category: cat });
  };

  const toggleWish = (id) => setWishlisted(w => ({ ...w, [id]: !w[id] }));

  return (
    <div className="products-page">
      <Header />

      {/* ── Page Hero ── */}
      <div className="pp-hero" ref={ref}>
        <div className="pp-hero__orb pp-hero__orb--1" />
        <div className="pp-hero__orb pp-hero__orb--2" />
        <div className="pp-hero__orb pp-hero__orb--3" />
        <div className="pp-hero__grid" />
        <div className={`pp-hero__inner ${heroVisible ? 'pp-hero--visible' : ''}`}>
          {/* Breadcrumb */}
          <div className="pp-breadcrumb">
            <span onClick={() => navigate('/')}>Home</span>
            <span className="pp-crumb-sep">›</span>
            <span onClick={() => handleCategory('All')}>Products</span>
            {activeCategory !== 'All' && <><span className="pp-crumb-sep">›</span><span className="pp-crumb-active">{activeCategory}</span></>}
          </div>
          <div className="pp-hero__label">Our Collection</div>
          <h1 className="pp-hero__title">
            {activeCategory === 'All' ? 'All Gifts' : activeCategory}
          </h1>
          <div className="pp-hero__meta">
            <div className="pp-hero__count">
              <span className="pp-count-num">{loading ? '—' : displayProducts.length}</span>
              <span className="pp-count-label">premium items curated for you</span>
            </div>
            <div className="pp-hero__divider" />
            <div className="pp-hero__trust">
              <span>🎀 Hand-packed</span>
              <span>🚚 Island-wide delivery</span>
              <span>⭐ Premium quality</span>
            </div>
          </div>
        </div>
        {/* Category pills in hero */}
        <div className="pp-hero__pills">
          {categories.map(cat => (
            <button key={cat} className={`pp-hero-pill ${activeCategory === cat ? 'pp-hero-pill--active' : ''}`} onClick={() => handleCategory(cat)}>
              {CAT_ICONS[cat] || '🎁'} {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="pp-body">
        {/* ── Sidebar ── */}
        <aside className={`pp-sidebar ${sidebarOpen ? 'pp-sidebar--open' : ''}`}>
          {/* Mobile overlay close */}
          <div className="pp-sidebar-overlay" onClick={() => setSidebarOpen(false)} />

          <div className="pp-sidebar-inner">
            {/* Search */}
            <div className="pp-sidebar-search">
              <span className="pp-search-icon">🔍</span>
              <input
                type="text"
                className="pp-search-input"
                placeholder="Search gifts…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && <button className="pp-search-clear" onClick={() => setSearchQuery('')}>✕</button>}
            </div>

            {/* Categories */}
            <div className="pp-sidebar-section">
              <div className="pp-sidebar-section-title">
                <span className="pp-section-title-dot" />
                Categories
              </div>
              <div className="pp-cats">
                {categories.map(cat => (
                  <button key={cat} className={`pp-cat-btn ${activeCategory === cat ? 'pp-cat-btn--active' : ''}`} onClick={() => handleCategory(cat)}>
                    <span className="pp-cat-icon">{CAT_ICONS[cat] || '🎁'}</span>
                    <span className="pp-cat-label">{cat}</span>
                    {activeCategory === cat && <span className="pp-cat-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="pp-sidebar-section">
              <div className="pp-sidebar-section-title">
                <span className="pp-section-title-dot" />
                Sort By
              </div>
              <div className="pp-sorts">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} className={`pp-sort-btn ${sortBy === opt.value ? 'pp-sort-btn--active' : ''}`} onClick={() => setSortBy(opt.value)}>
                    <span className="pp-sort-icon">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <div className="pp-cta-card">
              <div className="pp-cta-glow" />
              <div className="pp-cta-icon">🎁</div>
              <div className="pp-cta-title">Build Your Own Box</div>
              <div className="pp-cta-desc">Mix any items into a custom luxury gift box</div>
              <button className="pp-cta-btn" onClick={() => navigate('/build')}>
                Start Building →
              </button>
            </div>
          </div>
        </aside>

        {/* ── Products Area ── */}
        <div className="pp-content">
          {/* Toolbar */}
          <div className="pp-toolbar">
            <button className="pp-filter-toggle" onClick={() => setSidebarOpen(s => !s)}>
              ⚙ Filters {activeCategory !== 'All' && <span className="pp-filter-badge">1</span>}
            </button>
            <div className="pp-toolbar-right">
              <span className="pp-result-count">
                {loading ? '' : <><strong>{displayProducts.length}</strong> results</>}
              </span>
              {/* Desktop sort quick-select */}
              <div className="pp-sort-quick">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.value} className={`pp-sort-quick-btn ${sortBy === opt.value ? 'active' : ''}`} onClick={() => setSortBy(opt.value)}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active filters */}
          {(activeCategory !== 'All' || searchQuery) && (
            <div className="pp-active-filters">
              {activeCategory !== 'All' && (
                <span className="pp-filter-chip">
                  {CAT_ICONS[activeCategory]} {activeCategory}
                  <button onClick={() => handleCategory('All')}>✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="pp-filter-chip pp-filter-chip--search">
                  🔍 "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>✕</button>
                </span>
              )}
              <button className="pp-clear-all" onClick={() => { setSearchQuery(''); handleCategory('All'); }}>
                Clear all
              </button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="pp-skeleton-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="pp-skel-card">
                  <div className="pp-skel-img" />
                  <div className="pp-skel-body">
                    <div className="pp-skel-line pp-skel-short" />
                    <div className="pp-skel-line" />
                    <div className="pp-skel-line pp-skel-med" />
                    <div className="pp-skel-price" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="pp-state pp-state--error">
              <div className="pp-state-icon">⚠️</div>
              <div className="pp-state-title">Could not load products</div>
              <div className="pp-state-desc">Make sure your backend is running on port 8080</div>
              <button className="pp-state-btn" onClick={() => window.location.reload()}>Retry</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && displayProducts.length === 0 && (
            <div className="pp-state pp-state--empty">
              <div className="pp-state-icon">🔍</div>
              <div className="pp-state-title">No results found</div>
              <div className="pp-state-desc">Try a different search or browse all categories</div>
              <button className="pp-state-btn" onClick={() => { setSearchQuery(''); handleCategory('All'); }}>
                Clear filters
              </button>
            </div>
          )}

          {/* Products grid */}
          {!loading && !error && displayProducts.length > 0 && (
            <div className="pp-grid">
              {displayProducts.map((p, i) => {
                const catName  = CATEGORY_MAP[p.categoryId] || 'Gift';
                const catIcon  = CAT_ICONS[catName] || '🎁';
                const justAdded = addedId === p.id;

                return (
                  <div key={p.id} className="ppc" style={{ animationDelay:`${Math.min(i,8)*0.05}s` }}>
                    {/* Wishlist */}
                    <button className={`ppc-wish ${wishlisted[p.id] ? 'ppc-wish--on' : ''}`} onClick={() => toggleWish(p.id)}>
                      <svg viewBox="0 0 24 24" width="17" height="17" fill={wishlisted[p.id]?'#e33':'none'} stroke={wishlisted[p.id]?'#e33':'rgba(255,255,255,.85)'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    </button>

                    {/* Image */}
                    <div className="ppc-img">
                      <img src={p.imageUrl} alt={p.name} loading="lazy" />
                      <div className="ppc-overlay">
                        <button
                          className="ppc-action ppc-action--primary"
                          onClick={() => addToCart(p)}
                        >
                          {justAdded ? '✓ Added!' : '🛒 Add to Cart'}
                        </button>
                        <button className="ppc-action ppc-action--ghost" onClick={() => setQuickView(p)}>Quick View</button>
                      </div>
                      <div className="ppc-badge">
                        <span>{catIcon}</span><span>{catName}</span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="ppc-body">
                      <div className="ppc-name">{p.name}</div>
                      <div className="ppc-vendor">by Giftora Exclusive</div>
                      <div className="ppc-stars-row">
                        <span className="ppc-stars">★★★★★</span>
                        <span className="ppc-rating">5.0</span>
                      </div>
                      <div className="ppc-footer">
                        <span className="ppc-price">LKR {Number(p.price).toLocaleString()}</span>
                        <button
                          className={`ppc-add ${justAdded ? 'ppc-add--added' : ''}`}
                          onClick={() => addToCart(p)}
                          title="Add to cart"
                        >
                          {justAdded
                            ? <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                            : <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Quick View Modal */}
      {quickView && (
        <div className="qv-backdrop" onClick={() => setQuickView(null)}>
          <div className="qv-modal" onClick={e => e.stopPropagation()}>
            <button className="qv-close" onClick={() => setQuickView(null)}>✕</button>
            <div className="qv-img-side">
              <img src={quickView.imageUrl} alt={quickView.name} />
              <div className="qv-img-grad" />
            </div>
            <div className="qv-info-side">
              <div className="qv-cat-tag">
                {CAT_ICONS[CATEGORY_MAP[quickView.categoryId]] || '🎁'} {CATEGORY_MAP[quickView.categoryId] || 'Gift'}
              </div>
              <h3 className="qv-name">{quickView.name}</h3>
              <div className="qv-stars-row">★★★★★ <span>5.0 · Premium Quality</span></div>
              <div className="qv-price">LKR {Number(quickView.price).toLocaleString()}</div>
              <div className="qv-sep" />
              <p className="qv-desc">A premium curated gift from Giftora's exclusive collection. Hand-packed with love, beautifully presented, and ready to create a lasting memory.</p>
              <div className="qv-features">
                {['🎀 Gift Wrapped','✍️ Personal Note','🚚 Island-wide Delivery'].map((f,i) => <span key={i} className="qv-feat">{f}</span>)}
              </div>
              <div className="qv-actions">
                <button
                  className="qv-cta qv-cta--primary"
                  onClick={() => { addToCart(quickView); setQuickView(null); }}
                >
                  🛒 Add to Cart
                </button>
                <button className="qv-cta qv-cta--outline" onClick={() => { setQuickView(null); navigate('/products'); }}>View All →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductsPage;