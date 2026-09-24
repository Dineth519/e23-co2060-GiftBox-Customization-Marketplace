import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaGift, FaHeart, FaTruck, FaStar, FaArrowRight, 
  FaQuoteLeft, FaSearch, FaFilter, FaTimes 
} from 'react-icons/fa';

import Header from '../../components/customer/Header';
import Footer from '../../components/landingpage/Footer';
import { useCart } from '../../context/CartContext';
import './CustomerHome.css';

// ─── Config ───────────────────────────────────────────
const CAT_ICONS    = { All:'🛍️', Wine:'🍷', Watches:'⌚', Perfume:'🌸', 'Teddy Bears':'🧸', Bangles:'💍', Chocolates:'🍫', Other:'🎁' };
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

// Custom Dropdown Component
const CustomDropdown = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || options[0];

  return (
    <div className="custom-dropdown" ref={dropdownRef}>
      <div className={`dropdown-trigger ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(!isOpen)}>
        {selectedOption.icon && <span className="dropdown-icon">{selectedOption.icon}</span>}
        <span className="dropdown-label" style={{ flex: 1, textAlign: 'left' }}>{selectedOption.label}</span>
        <svg className="custom-dropdown-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      {isOpen && (
        <div className={`dropdown-menu ${options.length > 5 ? 'multi-column' : ''}`}>
          {options.map((opt) => (
            <div 
              key={opt.value} 
              className={`dropdown-item ${value === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.icon && <span className="item-icon">{opt.icon}</span>}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CustomerHome = () => {
  const navigate = useNavigate();
  const { addToCart, addedId } = useCart();
  const [ref, heroVisible] = useReveal(0.05);

  // ─── States ─────────────────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy]           = useState('default');
  const [quickView, setQuickView]     = useState(null);

  // Fetch Products and Categories
  useEffect(() => {
    Promise.all([
      fetch(`${process.env.REACT_APP_API_URL}/api/products`).then(res => res.ok ? res.json() : []),
      fetch(`${process.env.REACT_APP_API_URL}/api/categories`).then(res => res.ok ? res.json() : [])
    ])
      .then(([productsData, categoriesData]) => {
        // 1. Sort all products by ID descending so newest is first
        productsData.sort((a, b) => b.id - a.id);
        
        // 2. Keep the top 8 newest products at the beginning
        const newest = productsData.slice(0, 8);
        const rest = productsData.slice(8);
        
        // 3. Shuffle the rest of the products so they are mixed (not all same category together)
        for (let i = rest.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [rest[i], rest[j]] = [rest[j], rest[i]];
        }
        
        setAllProducts([...newest, ...rest]);
        setDbCategories(categoriesData);
        setLoading(false);
      })
      .catch(err => { 
        setError(err.message); 
        setLoading(false); 
      });
  }, []);

  const getCategoryName = (id) => {
    const cat = dbCategories.find(c => c.id === id);
    return cat ? cat.name : 'Other';
  };

  // ─── Logic (Filtering & Sorting) ────────────────────────────────────────
  const categories = useMemo(() => {
    const names = allProducts.map(p => getCategoryName(p.categoryId));
    return ['All', ...new Set(names)];
  }, [allProducts, dbCategories]);

  const categoryOptions = useMemo(() => {
    return categories.map(cat => ({
      value: cat,
      label: cat,
      icon: CAT_ICONS[cat] || null
    }));
  }, [categories]);

  const displayProducts = useMemo(() => {
    let f = [...allProducts];
    if (activeCategory !== 'All') f = f.filter(p => getCategoryName(p.categoryId) === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter(p => p.name.toLowerCase().includes(q) || getCategoryName(p.categoryId).toLowerCase().includes(q));
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
            <button className="btn-secondary" onClick={() => navigate('/customer/build-box')}>Custom Gift Box</button>
          </div>
        </div>
      </section>

      {/* ── SECTION 2: MARKETPLACE (All Features) ── */}
      <section className="featured-section" id="marketplace">
        <div className="section-header">
          <h2 className="section-title">Explore Our Marketplace</h2>
          <p className="section-subtitle">Search, filter, and find the perfect gift</p>
        </div>

        {/* Toolbar: Filter + Sort + Search */}
        <div className="home-toolbar">
          <div className="home-filters">
            <CustomDropdown 
              options={categoryOptions} 
              value={activeCategory} 
              onChange={setActiveCategory} 
            />
            <CustomDropdown 
              options={SORT_OPTIONS} 
              value={sortBy} 
              onChange={setSortBy} 
            />
          </div>

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
        </div>

        {/* Products Grid */}
        <div className="pp-grid" style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {loading && <div className="home-state">Loading your collections...</div>}
          {error && <div className="home-state error">⚠️ {error}</div>}
          
          {!loading && !error && displayProducts.map((p, i) => {
            const catName  = getCategoryName(p.categoryId);
            const justAdded = addedId === p.id;
            
            return (
              <div key={p.id} className="ppc" style={{ animationDelay:`${Math.min(i,8)*0.05}s` }}>
                {/* Image */}
                <div className="ppc-img">
                  <img src={p.imageUrl} alt={p.name} loading="lazy" />
                  <div className="ppc-overlay">
                    <button
                      className="ppc-action ppc-action--primary"
                      disabled={!(Number(p.stockQuantity) > 0)}
                        onClick={() => addToCart(p)}
                    >
                      {justAdded ? '✓ Added!' : '🛒 Add to Cart'}
                    </button>
                    <button className="ppc-action ppc-action--ghost" onClick={() => setQuickView(p)}>Quick View</button>
                  </div>
                </div>

                {/* Body */}
                <div className="ppc-body">
                  <div className="ppc-name">{p.name}</div>
                  <div className="ppc-vendor">{p.vendorName ? `Sold by ${p.vendorName}` : 'Seller details unavailable'}</div>
                  <div className="ppc-stars-row">{Number(p.stockQuantity) > 0 ? `In stock · ${p.stockQuantity} available` : 'Out of stock'}</div>
                  <div className="ppc-footer">
                    <span className="ppc-price">LKR {Number(p.price).toLocaleString()}</span>
                    <button
                      className={`ppc-add ${justAdded ? 'ppc-add--added' : ''}`}
                      disabled={!(Number(p.stockQuantity) > 0)}
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
            <div className="qv-img-side">
              <img src={quickView.imageUrl} alt={quickView.name} />
              <div className="qv-img-grad" />
            </div>
            <div className="qv-info-side">
              <div className="qv-cat-tag">
                {CAT_ICONS[getCategoryName(quickView.categoryId)] ? `${CAT_ICONS[getCategoryName(quickView.categoryId)]} ` : ''}{getCategoryName(quickView.categoryId)}
              </div>
              <h3 className="qv-name">{quickView.name}</h3>
              <div className="qv-stars-row">{quickView.vendorName ? `Sold by ${quickView.vendorName}` : 'Seller details unavailable'}</div>
              <div className="qv-price">LKR {Number(quickView.price).toLocaleString()}</div>
              <div className="qv-sep" />
              <p className="qv-desc" style={{ whiteSpace: 'pre-line' }}>{quickView.description?.trim() || 'The seller has not added a detailed description yet.'}</p>
              {quickView.subCategory && <p className="qv-desc">Product type: {quickView.subCategory}</p>}
              <p className="qv-desc">{Number(quickView.stockQuantity) > 0 ? `In stock · ${quickView.stockQuantity} available` : 'Out of stock'}</p>
              <div className="qv-features">
                {['Build a gift box to choose wrapping and a personal note. Delivery details are confirmed at checkout.'].map((f,i) => <span key={i} className="qv-feat">{f}</span>)}
              </div>
              <div className="qv-actions">
                <button
                  className="qv-cta qv-cta--primary"
                  disabled={!(Number(quickView.stockQuantity) > 0)}
                  onClick={() => { addToCart(quickView); setQuickView(null); }}
                >
                  {Number(quickView.stockQuantity) > 0 ? 'Add to Cart' : 'Out of stock'}
                </button>
                <button className="qv-cta qv-cta--outline" onClick={() => { setQuickView(null); document.getElementById('marketplace').scrollIntoView({behavior:'smooth'}); }}>View All →</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Testimonials & CTA remain as they are... */}
    </div>
  );
};

export default CustomerHome;
