// Changes from original:
//  1. useCart() import කරනවා
//  2. "Add to Cart" + "+" buttons — addToCart() call කරනවා
//  3. addedId check කරලා "Added! ✓" feedback දෙනවා

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/homepage/Header';
import Footer from '../../components/homepage/Footer';

// #43 — CartContext import
import { useCart } from '../../context/CartContext';

import './ProductsPage.css';

const CATEGORY_MAP = {
  1: 'Wine', 2: 'Watches', 3: 'Perfume',
  4: 'Teddy Bears', 5: 'Bangles', 6: 'Chocolates',
};

const CATEGORY_ICONS = {
  'All': '🛍️', 'Wine': '🍷', 'Watches': '⌚',
  'Perfume': '🌸', 'Teddy Bears': '🧸',
  'Bangles': '💍', 'Chocolates': '🍫',
};

const SORT_OPTIONS = [
  { value: 'default',    label: 'Featured'          },
  { value: 'price-asc',  label: 'Price: Low → High' },
  { value: 'price-desc', label: 'Price: High → Low' },
  { value: 'name-asc',   label: 'Name: A → Z'       },
];

const ProductsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get('category') || 'All';

  const [allProducts,     setAllProducts]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState(null);
  const [activeCategory,  setActiveCategory]  = useState(urlCategory);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [sortBy,          setSortBy]          = useState('default');
  const [hoveredId,       setHoveredId]       = useState(null);

  // #43 — cart functions + addedId for button feedback
  const { addToCart, addedId } = useCart();

  useEffect(() => { setActiveCategory(urlCategory); }, [urlCategory]);

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => { setAllProducts(data); setLoading(false); })
      .catch(err  => { setError(err.message); setLoading(false); });
  }, []);

  const categories = useMemo(() => {
    const names = allProducts.map(p => CATEGORY_MAP[p.categoryId] || 'Other');
    return ['All', ...new Set(names)];
  }, [allProducts]);

  const displayProducts = useMemo(() => {
    let filtered = [...allProducts];
    if (activeCategory !== 'All')
      filtered = filtered.filter(p => CATEGORY_MAP[p.categoryId] === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (CATEGORY_MAP[p.categoryId] || '').toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case 'price-asc':  filtered.sort((a, b) => a.price - b.price);            break;
      case 'price-desc': filtered.sort((a, b) => b.price - a.price);            break;
      case 'name-asc':   filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return filtered;
  }, [allProducts, activeCategory, searchQuery, sortBy]);

  const handleCategory = (cat) => {
    setActiveCategory(cat);
    setSearchQuery('');
    cat === 'All' ? setSearchParams({}) : setSearchParams({ category: cat });
  };

  return (
    <div className="products-page">
      <Header />
      <main className="products-main">

        <div className="products-hero">
          <div className="products-hero__orb products-hero__orb--1" />
          <div className="products-hero__orb products-hero__orb--2" />
          <div className="products-hero__inner">
            <div className="products-hero__label">Our Collection</div>
            <h1 className="products-hero__title">
              {activeCategory === 'All' ? 'All Gifts' : activeCategory}
            </h1>
            <p className="products-hero__sub">
              {displayProducts.length} premium items curated for you
            </p>
          </div>
        </div>

        <div className="products-body">

          {/* Sidebar */}
          <aside className="products-sidebar">
            <div className="sidebar-section">
              <div className="sidebar-title">Categories</div>
              <div className="sidebar-cats">
                {categories.map(cat => (
                  <button
                    key={cat}
                    className={`sidebar-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => handleCategory(cat)}
                  >
                    <span className="sidebar-cat-icon">{CATEGORY_ICONS[cat] || '🎁'}</span>
                    <span className="sidebar-cat-label">{cat}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-section">
              <div className="sidebar-title">Sort By</div>
              <div className="sidebar-sorts">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    className={`sidebar-sort-btn ${sortBy === opt.value ? 'active' : ''}`}
                    onClick={() => setSortBy(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="sidebar-cta">
              <div className="sidebar-cta__icon">🎁</div>
              <div className="sidebar-cta__title">Build Your Own Box</div>
              <div className="sidebar-cta__desc">Mix any items into a custom gift box</div>
              <button className="sidebar-cta__btn" onClick={() => navigate('/build')}>
                Start Building →
              </button>
            </div>
          </aside>

          {/* Main content */}
          <div className="products-content">

            <div className="products-toolbar">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search gifts, categories..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
                )}
              </div>
              <div className="results-count">
                {loading ? '' : `${displayProducts.length} results`}
              </div>
            </div>

            <div className="category-pills">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategory(cat)}
                >
                  {CATEGORY_ICONS[cat] || '🎁'} {cat}
                </button>
              ))}
            </div>

            {loading && (
              <div className="products-loading">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton-image" />
                    <div className="skeleton-body">
                      <div className="skeleton-line skeleton-line--short" />
                      <div className="skeleton-line" />
                      <div className="skeleton-line skeleton-line--med" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="products-error">
                <div className="error-icon">⚠️</div>
                <div className="error-title">Could not load products</div>
                <div className="error-desc">Make sure your backend is running on port 8080</div>
              </div>
            )}

            {!loading && !error && displayProducts.length === 0 && (
              <div className="products-empty">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">No results found</div>
                <div className="empty-desc">Try a different search or category</div>
                <button className="empty-reset"
                  onClick={() => { setSearchQuery(''); handleCategory('All'); }}>
                  Clear filters
                </button>
              </div>
            )}

            {/* ── Products Grid ── */}
            {!loading && !error && displayProducts.length > 0 && (
              <div className="products-grid">
                {displayProducts.map((p, i) => {
                  // #43 — is this product just added?
                  const justAdded = addedId === p.id;

                  return (
                    <div
                      key={p.id}
                      className="p-card"
                      style={{ animationDelay: `${i * 0.06}s` }}
                      onMouseEnter={() => setHoveredId(p.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <div className="p-card__image">
                        <img src={p.imageUrl} alt={p.name} loading="lazy" />

                        {/* Overlay buttons — #43 wired */}
                        <div className="p-card__overlay">
                          <button
                            className={`p-card__action-btn ${justAdded ? 'added' : ''}`}
                            onClick={() => addToCart(p)}
                          >
                            {justAdded ? '✓ Added!' : '🛒 Add to Cart'}
                          </button>
                          <button className="p-card__action-btn p-card__action-btn--outline">
                            Quick View
                          </button>
                        </div>

                        <span className="p-card__badge">
                          {CATEGORY_ICONS[CATEGORY_MAP[p.categoryId]] || '🎁'}{' '}
                          {CATEGORY_MAP[p.categoryId] || 'Gift'}
                        </span>
                      </div>

                      <div className="p-card__body">
                        <div className="p-card__name">{p.name}</div>
                        <div className="p-card__vendor">by Giftora Exclusive</div>
                        <div className="p-card__stars">★★★★★ <span>5.0</span></div>
                        <div className="p-card__footer">
                          <span className="p-card__price">
                            LKR {Number(p.price).toLocaleString()}
                          </span>
                          {/* #43 — "+" button wired */}
                          <button
                            className={`p-card__add ${justAdded ? 'added' : ''}`}
                            onClick={() => addToCart(p)}
                            title="Add to cart"
                          >
                            {justAdded ? '✓' : '+'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductsPage;