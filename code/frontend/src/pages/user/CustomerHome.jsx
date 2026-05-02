import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaGift, FaHeart, FaTruck, FaStar, FaArrowRight, 
  FaQuoteLeft, FaSearch, FaFilter, FaTimes 
} from 'react-icons/fa';

import Header from '../../components/customer/Header';
import Footer from '../../components/homepage/Footer';
import { useCart } from '../../context/CartContext';
import './CustomerHome.css';

// ─── Config (From ProductsPage) ───────────────────────────────────────────
const CATEGORY_MAP = { 1:'Wine', 2:'Watches', 3:'Perfume', 4:'Teddy Bears', 5:'Bangles', 6:'Chocolates' };
const CAT_ICONS    = { All:'🛍️', Wine:'🍷', Watches:'⌚', Perfume:'🌸', 'Teddy Bears':'🧸', Bangles:'💍', Chocolates:'🍫' };
const SORT_OPTIONS = [
  { value:'default',    label:'Featured' },
  { value:'price-asc',  label:'Price: Low → High' },
  { value:'price-desc', label:'Price: High → Low' },
];

// Scroll reveal hook for animations
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

const CustomerHome = () => {
  const navigate = useNavigate();

  // ── FIX: addToCart → addProduct (CartContext new API)
  // addedId removed — context එකේ නෑ; local state use කරනවා
  const { addProduct } = useCart();
  const [ref, heroVisible] = useReveal(0.05);

  // ─── States ─────────────────────────────────────────────────────────────
  const [allProducts, setAllProducts]       = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery]       = useState('');
  const [sortBy, setSortBy]                 = useState('default');
  const [quickView, setQuickView]           = useState(null);

  // Local "added" feedback — productId set for 1.5s after add
  const [addedId, setAddedId] = useState(null);

  // ── Add to Cart handler ──────────────────────────────────────────────────
  // product object from API: { id, productId, name, price, imageUrl, categoryId, ... }
  // Backend addProduct needs productId — use p.productId ?? p.id (handles both shapes)
  const handleAddToCart = async (product) => {
    const pid = product.productId ?? product.id;
    try {
      await addProduct(pid, 1);
      setAddedId(pid);
      setTimeout(() => setAddedId(null), 1500);
    } catch (err) {
      console.error('Add to cart failed:', err);
    }
  };

  // Fetch Products
  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => { setAllProducts(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  // ─── Logic (Filtering & Sorting) ────────────────────────────────────────
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
      default: break;
    }
    return f;
  }, [allProducts, activeCategory, searchQuery, sortBy]);

  return (
    <div className="customer-home">
      <Header />

      {/* ── SECTION 1: HERO ── */}
      <section className="hero-section" ref={ref}>
        <div className="hero-glow"></div>
        <div className={`hero-content ${heroVisible ? 'hero--visible' : ''}`}>
          <div className="hero-badge"><span className="badge-dot"></span>Curated with Love</div>
          <h1 className="hero-title">Gift Experiences,<br /><span className="title-accent">Not Just Boxes</span></h1>
          <p className="hero-subtitle">Handcrafted gift collections from Sri Lanka's finest artisans.</p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={() => document.getElementById('marketplace').scrollIntoView({behavior:'smooth'})}>
              Shop Now <FaArrowRight className="btn-icon" />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/build-box')}>Custom Gift Box</button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: MARKETPLACE (All Features) ── */}
      <section className="featured-section" id="marketplace">
        <div className="section-header">
          <h2 className="section-title">Explore Our Marketplace</h2>
          <p className="section-subtitle">Search, filter, and find the perfect gift</p>
        </div>

        {/* Toolbar: Search + Filter + Sort */}
        <div className="home-toolbar">
          <div className="home-search-bar">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search for chocolates, watches, perfumes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && <FaTimes className="clear-search" onClick={() => setSearchQuery('')} />}
          </div>

          <div className="home-filters">
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)}>
              {categories.map(cat => <option key={cat} value={cat}>{CAT_ICONS[cat]} {cat}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="featured-grid">
          {loading && <div className="home-state">Loading your collections...</div>}
          {error && <div className="home-state error">⚠️ {error}</div>}
          
          {!loading && !error && displayProducts.map((p, i) => {
            // FIX: support both p.productId and p.id shapes from API
            const pid = p.productId ?? p.id;
            const isAdded = addedId === pid;

            return (
              <div key={pid} className="featured-card" style={{ animationDelay: `${Math.min(i, 8) * 0.1}s` }}>
                <div className="featured-image">
                  <img src={p.imageUrl} alt={p.name} />
                  <div className="card-overlay">
                    {/* FIX: handleAddToCart instead of addToCart(p) */}
                    <button
                      className={`overlay-btn primary ${isAdded ? 'added' : ''}`}
                      onClick={() => handleAddToCart(p)}
                      disabled={isAdded}
                    >
                      {isAdded ? '✓ Added!' : '🛒 Add to Cart'}
                    </button>
                    <button className="overlay-btn ghost" onClick={() => setQuickView(p)}>Quick View</button>
                  </div>
                </div>
                <div className="featured-content">
                  <h3 className="featured-name">{p.name}</h3>
                  <div className="featured-rating">
                    <FaStar className="star-icon" /> <span>5.0</span>
                  </div>
                  <div className="featured-footer">
                    <div className="price-tag">LKR {Number(p.price).toLocaleString()}</div>
                    {/* Heart = wishlist feel; also adds to cart */}
                    <button
                      className={`wish-btn ${isAdded ? 'active' : ''}`}
                      onClick={() => handleAddToCart(p)}
                    >
                      <FaHeart />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 3: HOW IT WORKS ── */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">Creating Magic is Simple</h2>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon"><FaGift /></div>
            <h3 className="step-title">Choose Your Style</h3>
            <p>Browse curated collections or build your own custom gift box.</p>
          </div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon"><FaHeart /></div>
            <h3 className="step-title">Personalize It</h3>
            <p>Add custom messages and premium wrapping styles.</p>
          </div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon"><FaTruck /></div>
            <h3 className="step-title">We Deliver Joy</h3>
            <p>Receive your beautifully packaged gift, delivered with care.</p>
          </div>
        </div>
      </section>

      {/* ── QUICK VIEW MODAL ── */}
      {quickView && (
        <div className="qv-backdrop" onClick={() => setQuickView(null)}>
          <div className="qv-modal" onClick={e => e.stopPropagation()}>
            <button className="qv-close" onClick={() => setQuickView(null)}><FaTimes /></button>
            <div className="qv-grid">
              <img src={quickView.imageUrl} alt={quickView.name} className="qv-img" />
              <div className="qv-details">
                <span className="qv-cat">{CATEGORY_MAP[quickView.categoryId]}</span>
                <h2 className="qv-title">{quickView.name}</h2>
                <div className="qv-price">LKR {Number(quickView.price).toLocaleString()}</div>
                <p className="qv-desc">Premium curated gift from Giftora's exclusive collection. Hand-packed with love and ready to create a lasting memory.</p>
                {/* FIX: handleAddToCart instead of addToCart */}
                <button className="btn-primary" onClick={() => { handleAddToCart(quickView); setQuickView(null); }}>
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials & CTA remain as they are... */}
      <Footer />
    </div>
  );
};

export default CustomerHome;