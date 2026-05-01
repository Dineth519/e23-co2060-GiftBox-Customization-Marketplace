import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaThLarge, FaList, FaSearch, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './MyItems.css';

// ── Constants ──────────────────────────────────────────────────
const CATEGORIES = ['All', 'Gift Boxes', 'Hampers', 'Floral', 'Special'];

// ── Status badge CSS class helper ─────────────────────────────
const getBadgeClass = (status) => ({
  'Active':        'badge-active',
  'Low Stock':     'badge-low-stock',
  'Out of Stock':  'badge-out-of-stock',
}[status] || '');

// ── Stock color helper ─────────────────────────────────────────
const stockColor = (stock) => {
  if (stock === 0)   return '#A32D2D';
  if (stock <= 10)   return '#854F0B';
  return '#1A2340';
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ProductCard — Grid view
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ProductCard = ({ product, onEdit, onDelete }) => (
  <div className="product-card">
    {/* Image / emoji area */}
    <div className="card-image-area">
      <img 
        src={product.image} 
        alt={product.name} 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        onError={(e)=>{e.target.src="https://via.placeholder.com/220x150?text=No+Image"}} 
      />
      <span className={`card-status-badge ${getBadgeClass(product.status)}`}>
        {product.status}
      </span>
    </div>

    {/* Body */}
    <div className="card-body">
      <span className="card-category">{product.category}</span>
      <p className="card-name">{product.name}</p>

      <div className="card-price-row">
        <span className="card-price">LKR {product.price.toLocaleString()}</span>
        <span className="card-rating">⭐ {product.rating}</span>
      </div>

      <div className="card-meta">
        <span>
          Stock:{' '}
          <strong style={{ color: stockColor(product.stock) }}>{product.stock}</strong>
        </span>
        <span>
          Sold: <strong style={{ color: '#1A2340' }}>{product.sold}</strong>
        </span>
      </div>

      <div className="card-actions">
        <button className="btn-edit" onClick={() => onEdit(product)}>
          <FaEdit size={11} /> Edit
        </button>
        <button className="btn-delete" onClick={() => onDelete(product.id)}>
          <FaTrash size={11} /> Delete
        </button>
      </div>
    </div>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TableRow — List view
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const TableRow = ({ product, index, onEdit, onDelete }) => (
  <tr style={{ background: index % 2 === 0 ? '#FFFFFF' : '#FDFAF5' }}>
    <td>
      <div className="table-product-cell">
        <img 
          src={product.image} 
          alt={product.name} 
          className="table-product-img" 
          onError={(e)=>{e.target.src="https://via.placeholder.com/50?text=No+Image"}} 
        />
        <span className="table-product-name">{product.name}</span>
      </div>
    </td>
    <td className="table-category">{product.category}</td>
    <td className="table-price">{product.price.toLocaleString()}</td>
    <td style={{ fontWeight: 600, color: stockColor(product.stock) }}>{product.stock}</td>
    <td style={{ color: '#5A6478' }}>{product.sold}</td>
    <td>
      <span className="table-rating">⭐ {product.rating}</span>
    </td>
    <td>
      <span className={`card-status-badge ${getBadgeClass(product.status)}`}
        style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
        {product.status}
      </span>
    </td>
    <td>
      <div className="table-actions">
        <button className="btn-table-edit" onClick={() => onEdit(product)}>
          <FaEdit size={10} /> Edit
        </button>
        <button className="btn-table-delete" onClick={() => onDelete(product.id)}>
          <FaTrash size={10} /> Delete
        </button>
      </div>
    </td>
  </tr>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EmptyState
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const EmptyState = () => (
  <div className="state-box">
    <div className="state-icon">📦</div>
    <h3 className="state-title">No products found</h3>
    <p className="state-desc">Try adjusting your search or filter</p>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MyItems — Main Component
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MyItems = () => {
  const navigate = useNavigate();

  // ── State ──
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [view, setView]           = useState('grid');       // 'grid' | 'list'
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Active' | 'Low Stock' | 'Out of Stock'

  // ── Fetch products from backend ────────────────────────────
  const SELLER_ID = 2; 
  const API_BASE  = 'http://localhost:8080/api';          

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/sellers/${SELLER_ID}/products`, {
          headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`, // ← uncomment if using JWT auth
          },
        });
        if (!res.ok) throw new Error(`Failed to fetch products (${res.status})`);
        const data = await res.json();
        setProducts(data); // ← expects array of product objects (see shape below)
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [SELLER_ID]);

  /*
  ── Expected product object shape from API ──────────────────
  {
    id:       number | string,
    name:     string,
    category: string,           // e.g. "Gift Boxes"
    price:    number,           // in LKR
    stock:    number,
    sold:     number,
    rating:   number,           // 0–5
    status:   'Active' | 'Low Stock' | 'Out of Stock',
    image:    string,           // emoji OR image URL
  }
  ──────────────────────────────────────────────────────────── */

  // ── Delete handler ─────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Delete failed');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(`Error deleting product: ${err.message}`);
    }
  };

  // ── Edit handler ───────────────────────────────────────────
  const handleEdit = (product) => {
    // Navigate to edit page, passing product id or full object
    navigate(`/seller/edit-item/${product.id}`, { state: { product } });
  };

  // ── Stats (derived) ────────────────────────────────────────
  const stats = useMemo(() => [
    { key: 'All',           label: 'Total Products', icon: '📦', value: products.length },
    { key: 'Active',        label: 'Active',         icon: '✅', value: products.filter(p => p.status === 'Active').length },
    { key: 'Low Stock',     label: 'Low Stock',      icon: '⚠️', value: products.filter(p => p.status === 'Low Stock').length },
    { key: 'Out of Stock',  label: 'Out of Stock',   icon: '❌', value: products.filter(p => p.status === 'Out of Stock').length },
  ], [products]);

  // ── Filtered products ──────────────────────────────────────
  const filtered = useMemo(() => products.filter(p => {
    const matchCategory = category === 'All' || p.category === category;
    const matchStatus   = statusFilter === 'All' || p.status === statusFilter;
    const matchSearch   = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchStatus && matchSearch;
  }), [products, search, category, statusFilter]);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="my-items-page">

      {/* ── Page Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">My Items</h1>
          <p className="page-subtitle">Manage your product listings</p>
        </div>
        <button className="btn-add" onClick={() => navigate('/seller/add-items')}>
          <FaPlus size={12} /> Add New Item
        </button>
      </div>

      {/* ── Summary Stats as Filter Buttons ── */}
      <div className="stats-grid">
        {stats.map(s => (
          <button
            key={s.key}
            className={`stat-card${statusFilter === s.key ? ' active-filter' : ''}`}
            onClick={() => setStatusFilter(s.key)}
            title={`Filter by: ${s.label}`}
          >
            <span className="stat-icon">{s.icon}</span>
            <div>
              <p className="stat-value">{loading ? '—' : s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        {/* Search */}
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
          />
        </div>

        {/* Category Filter */}
        <div className="category-filters">
          {CATEGORIES.map(c => (
            <button
              key={c}
              className={`btn-category${category === c ? ' selected' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="view-toggle">
          {[['grid', <FaThLarge size={13} />, 'Grid'], ['list', <FaList size={13} />, 'List']].map(([v, icon, label]) => (
            <button
              key={v}
              className={`btn-view${view === v ? ' active' : ''}`}
              onClick={() => setView(v)}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results Count ── */}
      {!loading && !error && (
        <p className="results-count">
          Showing <strong>{filtered.length}</strong> of <strong>{products.length}</strong> products
          {statusFilter !== 'All' && <> · <strong className="highlight">{statusFilter}</strong></>}
          {category !== 'All' && <> in <strong className="highlight">{category}</strong></>}
        </p>
      )}

      {/* ── Loading State ── */}
      {loading && (
        <div className="state-box">
          <div className="spinner" />
          <p className="state-desc">Loading your products…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="state-box">
          <div className="state-icon">⚠️</div>
          <h3 className="state-title">Failed to load products</h3>
          <p className="state-desc">{error}</p>
        </div>
      )}

      {/* ── Grid View ── */}
      {!loading && !error && view === 'grid' && (
        filtered.length > 0 ? (
          <div className="products-grid">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )
      )}

      {/* ── List / Table View ── */}
      {!loading && !error && view === 'list' && (
        filtered.length > 0 ? (
          <div className="table-wrapper">
            <table className="products-table">
              <thead>
                <tr>
                  {['Product', 'Category', 'Price (LKR)', 'Stock', 'Sold', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <TableRow
                    key={p.id}
                    product={p}
                    index={i}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )
      )}
    </div>
  );
};

export default MyItems;