import React, { useState, useMemo } from 'react';
import { FaThLarge, FaList, FaSearch, FaEdit, FaTrash, FaStar, FaBoxOpen, FaPlus } from 'react-icons/fa';

// ── Design tokens ──────────────────────────────────────────────
const gold     = '#C9A84C';
const goldLight = '#E8C96A';
const navy     = '#1A2340';
const cream    = '#F5F0E8';
const white    = '#FFFFFF';

// ── Mock products data ─────────────────────────────────────────
const PRODUCTS = [
  { id: 1, name: 'Premium Gift Box',      category: 'Gift Boxes',  price: 2000,  stock: 45, sold: 142, rating: 4.9, status: 'Active',      image: '🎁' },
  { id: 2, name: 'Luxury Hamper Set',     category: 'Hampers',     price: 3500,  stock: 28, sold: 98,  rating: 4.7, status: 'Active',      image: '🧺' },
  { id: 3, name: 'Birthday Bouquet',      category: 'Floral',      price: 1500,  stock: 0,  sold: 87,  rating: 4.8, status: 'Out of Stock', image: '💐' },
  { id: 4, name: 'Wedding Gift Bundle',   category: 'Gift Boxes',  price: 4200,  stock: 12, sold: 64,  rating: 4.6, status: 'Active',      image: '💍' },
  { id: 5, name: 'Anniversary Box',       category: 'Gift Boxes',  price: 3000,  stock: 8,  sold: 51,  rating: 4.5, status: 'Low Stock',   image: '❤️' },
  { id: 6, name: 'Chocolate Hamper',      category: 'Hampers',     price: 2800,  stock: 33, sold: 76,  rating: 4.8, status: 'Active',      image: '🍫' },
  { id: 7, name: 'Rose Bouquet Deluxe',   category: 'Floral',      price: 1800,  stock: 22, sold: 93,  rating: 4.7, status: 'Active',      image: '🌹' },
  { id: 8, name: 'Baby Shower Gift Set',  category: 'Special',     price: 3200,  stock: 0,  sold: 38,  rating: 4.6, status: 'Out of Stock', image: '🍼' },
  { id: 9, name: 'Corporate Gift Pack',   category: 'Special',     price: 5000,  stock: 5,  sold: 29,  rating: 4.4, status: 'Low Stock',   image: '💼' },
  { id: 10, name: 'Fruit Basket',         category: 'Hampers',     price: 1200,  stock: 60, sold: 112, rating: 4.5, status: 'Active',      image: '🍎' },
];

const CATEGORIES = ['All', 'Gift Boxes', 'Hampers', 'Floral', 'Special'];

// ── Status badge style ─────────────────────────────────────────
const statusStyle = (s) => ({
  Active:        { bg: '#EAF3DE', color: '#2E7D52', border: '#A8D87A' },
  'Low Stock':   { bg: '#FEF9ED', color: '#854F0B', border: '#FAC775' },
  'Out of Stock':{ bg: '#FCEBEB', color: '#A32D2D', border: '#F09595' },
}[s] || {});

// ── Product Card (Grid view) ───────────────────────────────────
const ProductCard = ({ p, onDelete }) => {
  const ss = statusStyle(p.status);
  return (
    <div style={{
      background: white, borderRadius: 16, border: '1px solid #EDE8DE',
      overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,35,64,0.06)',
      transition: 'transform 0.15s, box-shadow 0.15s',
      display: 'flex', flexDirection: 'column',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(26,35,64,0.12)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,35,64,0.06)'; }}
    >
      {/* Image area */}
      <div style={{
        height: 130, background: `linear-gradient(135deg, #F8F4EC, #EDE8DE)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 52, position: 'relative',
      }}>
        {p.image}
        <span style={{
          position: 'absolute', top: 10, right: 10,
          background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`,
          fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
        }}>{p.status}</span>
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 11, color: gold, fontWeight: 600, letterSpacing: 0.5 }}>{p.category}</span>
        <p style={{ margin: '4px 0 8px', fontSize: 14, fontWeight: 700, color: navy, lineHeight: 1.3 }}>{p.name}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: navy }}>LKR {p.price.toLocaleString()}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: '#5A6478' }}>
            ⭐ {p.rating}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7A869A', marginBottom: 14 }}>
          <span>Stock: <strong style={{ color: p.stock === 0 ? '#A32D2D' : p.stock <= 10 ? '#854F0B' : navy }}>{p.stock}</strong></span>
          <span>Sold: <strong style={{ color: navy }}>{p.sold}</strong></span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
          <button style={{
            flex: 1, padding: '8px 0', borderRadius: 9, border: `1.5px solid ${gold}`,
            background: 'transparent', color: gold, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit',
          }}>
            <FaEdit size={11} /> Edit
          </button>
          <button onClick={() => onDelete(p.id)} style={{
            flex: 1, padding: '8px 0', borderRadius: 9, border: '1.5px solid #F09595',
            background: 'transparent', color: '#A32D2D', fontSize: 12, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, fontFamily: 'inherit',
          }}>
            <FaTrash size={11} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────
const MyItems = () => {
  const [view, setView]         = useState('grid');
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('All');
  const [products, setProducts] = useState(PRODUCTS);

  const filtered = useMemo(() => products.filter(p => {
    const matchCat    = category === 'All' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [products, search, category]);

  const handleDelete = (id) => {
    if (window.confirm('Delete this product?')) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const stats = [
    { label: 'Total Products', value: products.length, icon: '📦' },
    { label: 'Active',         value: products.filter(p => p.status === 'Active').length, icon: '✅' },
    { label: 'Low Stock',      value: products.filter(p => p.status === 'Low Stock').length, icon: '⚠️' },
    { label: 'Out of Stock',   value: products.filter(p => p.status === 'Out of Stock').length, icon: '❌' },
  ];

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: cream, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: navy }}>My Items</h1>
          <p style={{ margin: '6px 0 0', color: '#7A869A', fontSize: 14 }}>Manage your product listings</p>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: gold, color: navy, border: 'none',
          padding: '11px 22px', borderRadius: 11, fontSize: 14, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <FaPlus size={12} /> Add New Item
        </button>
      </div>

      {/* ── Summary Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: white, borderRadius: 14, border: '1px solid #EDE8DE',
            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 2px 8px rgba(26,35,64,0.05)',
          }}>
            <span style={{ fontSize: 26 }}>{s.icon}</span>
            <div>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: navy }}>{s.value}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#7A869A', fontWeight: 600 }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Toolbar: Search + Filter + Toggle ── */}
      <div style={{
        background: white, borderRadius: 14, border: '1px solid #EDE8DE',
        padding: '14px 20px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
        boxShadow: '0 2px 8px rgba(26,35,64,0.05)',
      }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#AAA', fontSize: 13 }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{
              width: '100%', padding: '9px 14px 9px 36px', borderRadius: 10,
              border: '1.5px solid #E0D8C8', fontSize: 13, color: navy,
              background: '#FAFAF8', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
              background: category === c ? gold : 'transparent',
              color: category === c ? navy : '#7A869A',
              border: category === c ? `1.5px solid ${gold}` : '1.5px solid #E0D8C8',
            }}>{c}</button>
          ))}
        </div>

        {/* View Toggle */}
        <div style={{ display: 'flex', background: '#F0EAD8', borderRadius: 10, padding: 3 }}>
          {[['grid', <FaThLarge size={13} />], ['list', <FaList size={13} />]].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: view === v ? white : 'transparent',
              color: view === v ? navy : '#7A869A',
              boxShadow: view === v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'inherit',
              fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
            }}>{icon} {v === 'grid' ? 'Grid' : 'List'}</button>
          ))}
        </div>
      </div>

      {/* ── Results count ── */}
      <p style={{ fontSize: 13, color: '#7A869A', marginBottom: 16 }}>
        Showing <strong style={{ color: navy }}>{filtered.length}</strong> of <strong style={{ color: navy }}>{products.length}</strong> products
        {category !== 'All' && <span> in <strong style={{ color: gold }}>{category}</strong></span>}
      </p>

      {/* ── Grid View ── */}
      {view === 'grid' && (
        filtered.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {filtered.map(p => <ProductCard key={p.id} p={p} onDelete={handleDelete} />)}
          </div>
        ) : (
          <EmptyState />
        )
      )}

      {/* ── List / Table View ── */}
      {view === 'list' && (
        filtered.length > 0 ? (
          <div style={{ background: white, borderRadius: 16, border: '1px solid #EDE8DE', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,35,64,0.06)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F8F4EC' }}>
                  {['Product', 'Category', 'Price (LKR)', 'Stock', 'Sold', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#5A6478', letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => {
                  const ss = statusStyle(p.status);
                  return (
                    <tr key={p.id} style={{ borderTop: '1px solid #F0EAD8', background: i % 2 === 0 ? white : '#FDFAF5' }}>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 24 }}>{p.image}</span>
                          <span style={{ fontWeight: 600, color: navy }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '13px 16px', color: gold, fontWeight: 600 }}>{p.category}</td>
                      <td style={{ padding: '13px 16px', fontWeight: 700, color: navy }}>{p.price.toLocaleString()}</td>
                      <td style={{ padding: '13px 16px', fontWeight: 600, color: p.stock === 0 ? '#A32D2D' : p.stock <= 10 ? '#854F0B' : navy }}>{p.stock}</td>
                      <td style={{ padding: '13px 16px', color: '#5A6478' }}>{p.sold}</td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: navy, fontWeight: 600 }}>⭐ {p.rating}</span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ background: ss.bg, color: ss.color, border: `1px solid ${ss.border}`, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button style={{ background: 'transparent', border: `1.5px solid ${gold}`, color: gold, padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaEdit size={10} /> Edit
                          </button>
                          <button onClick={() => handleDelete(p.id)} style={{ background: 'transparent', border: '1.5px solid #F09595', color: '#A32D2D', padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FaTrash size={10} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

// ── Empty State ────────────────────────────────────────────────
const EmptyState = () => (
  <div style={{ textAlign: 'center', padding: '60px 20px', background: white, borderRadius: 16, border: '1px solid #EDE8DE' }}>
    <div style={{ fontSize: 52, marginBottom: 16 }}>📦</div>
    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: navy }}>No products found</h3>
    <p style={{ margin: '8px 0 0', color: '#7A869A', fontSize: 14 }}>Try adjusting your search or filter</p>
  </div>
);

export default MyItems;