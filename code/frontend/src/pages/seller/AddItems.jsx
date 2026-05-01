import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlus, FaTrash, FaUpload, FaTags, FaBoxOpen, FaDollarSign, FaImage } from 'react-icons/fa';

// ── Design tokens ──────────────────────────────────────────────
const gold     = '#C9A84C';
const goldLight = '#E8C96A';
const navy     = '#1A2340';
const cream    = '#F5F0E8';
const white    = '#FFFFFF';

const CATEGORIES = ['Gift Boxes', 'Hampers', 'Floral', 'Special', 'Cakes & Sweets', 'Electronics', 'Clothing'];

// ── Reusable field components ──────────────────────────────────
const Label = ({ children, required }) => (
  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#5A6478', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
    {children} {required && <span style={{ color: '#A32D2D' }}>*</span>}
  </label>
);

const Input = ({ ...props }) => (
  <input {...props} style={{
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #E0D8C8', fontSize: 14, color: navy,
    background: '#FAFAF8', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    ...props.style,
  }} />
);

const Textarea = ({ ...props }) => (
  <textarea {...props} style={{
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #E0D8C8', fontSize: 14, color: navy,
    background: '#FAFAF8', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', resize: 'vertical', minHeight: 100, lineHeight: 1.6,
    ...props.style,
  }} />
);

const Select = ({ children, ...props }) => (
  <select {...props} style={{
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1.5px solid #E0D8C8', fontSize: 14, color: navy,
    background: '#FAFAF8', outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit', cursor: 'pointer',
    ...props.style,
  }}>
    {children}
  </select>
);

// ── Section Card wrapper ───────────────────────────────────────
const SectionCard = ({ icon, title, children }) => (
  <div style={{ background: white, borderRadius: 16, border: '1px solid #EDE8DE', overflow: 'hidden', marginBottom: 20, boxShadow: '0 2px 12px rgba(26,35,64,0.05)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 24px', borderBottom: '1px solid #EDE8DE', background: '#FAFAF8' }}>
      <span style={{ color: gold, fontSize: 15 }}>{icon}</span>
      <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: navy }}>{title}</h3>
    </div>
    <div style={{ padding: '22px 24px' }}>{children}</div>
  </div>
);

const Row = ({ children, cols = 2 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16, marginBottom: 16 }}>
    {children}
  </div>
);

const Field = ({ children }) => <div>{children}</div>;

// ── Main Component ─────────────────────────────────────────────
const AddItems = () => {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [images, setImages] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', price: '', discountPrice: '',
    stock: '', sku: '', weight: '', description: '',
    status: 'Active', featured: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || e.target.files || []);
    const newImgs = files.slice(0, 5 - images.length).map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      url: URL.createObjectURL(f),
    }));
    setImages(prev => [...prev, ...newImgs].slice(0, 5));
  };

  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id));

  const addTag = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const handleSubmit = () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      navigate('/seller/my-items');
    }, 2000);
  };

  return (
    <div style={{ padding: '32px 36px', minHeight: '100vh', background: cream, fontFamily: "'Inter', sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => navigate('/seller/my-items')} style={{
            width: 38, height: 38, borderRadius: 10, border: '1.5px solid #E0D8C8',
            background: white, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: navy, fontSize: 14,
          }}>
            <FaArrowLeft />
          </button>
          <div>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: navy }}>Add New Item</h1>
            <p style={{ margin: '4px 0 0', color: '#7A869A', fontSize: 14 }}>Fill in the details to list a new product</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/seller/my-items')} style={{
            padding: '10px 22px', borderRadius: 10, border: '1.5px solid #D0C8B8',
            background: 'transparent', color: '#5A6478', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          <button onClick={handleSubmit} style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: gold, color: navy, fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <FaPlus size={12} /> {submitted ? 'Saving...' : 'Save Item'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, alignItems: 'start' }}>

        {/* ── Left Column ── */}
        <div>

          {/* Basic Info */}
          <SectionCard icon={<FaBoxOpen />} title="Basic Information">
            <div style={{ marginBottom: 16 }}>
              <Label required>Product Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Premium Gift Box Deluxe" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Label required>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your product in detail — what's included, occasion, packaging..." />
            </div>
            <Row>
              <Field>
                <Label required>Category</Label>
                <Select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <Field>
                <Label>Status</Label>
                <Select name="status" value={form.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Out of Stock">Out of Stock</option>
                </Select>
              </Field>
            </Row>
            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #E0D8C8', background: '#FAFAF8', minHeight: 44 }}>
                {tags.map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#F8F4EC', border: `1px solid ${goldLight}`, color: navy, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>
                    {t}
                    <span onClick={() => removeTag(t)} style={{ cursor: 'pointer', color: '#A32D2D', fontWeight: 800 }}>×</span>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? 'Type a tag and press Enter...' : ''}
                  style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, color: navy, fontFamily: 'inherit', flex: 1, minWidth: 120 }}
                />
              </div>
              <p style={{ fontSize: 11, color: '#AAA', marginTop: 5 }}>Press Enter or comma to add a tag</p>
            </div>
          </SectionCard>

          {/* Pricing */}
          <SectionCard icon={<FaDollarSign />} title="Pricing & Inventory">
            <Row>
              <Field>
                <Label required>Price (LKR)</Label>
                <Input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" />
              </Field>
              <Field>
                <Label>Discount Price (LKR)</Label>
                <Input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} placeholder="0.00" />
              </Field>
            </Row>
            <Row>
              <Field>
                <Label required>Stock Quantity</Label>
                <Input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
              </Field>
              <Field>
                <Label>SKU</Label>
                <Input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. GFT-BOX-001" />
              </Field>
            </Row>
            <Row cols={1}>
              <Field>
                <Label>Weight (grams)</Label>
                <Input name="weight" type="number" value={form.weight} onChange={handleChange} placeholder="e.g. 500" />
              </Field>
            </Row>
            {/* Discount preview */}
            {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
              <div style={{ padding: '10px 16px', background: '#EAF3DE', borderRadius: 10, border: '1px solid #A8D87A', fontSize: 13 }}>
                💰 Discount: <strong style={{ color: '#2E7D52' }}>
                  {Math.round((1 - form.discountPrice / form.price) * 100)}% off
                </strong> — customer saves <strong style={{ color: '#2E7D52' }}>LKR {(form.price - form.discountPrice).toLocaleString()}</strong>
              </div>
            )}
          </SectionCard>

        </div>

        {/* ── Right Column ── */}
        <div>

          {/* Image Upload */}
          <SectionCard icon={<FaImage />} title="Product Images">
            {/* Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById('imgInput').click()}
              style={{
                border: `2px dashed ${dragOver ? gold : '#D0C8B8'}`,
                borderRadius: 12, padding: '28px 16px', textAlign: 'center',
                cursor: 'pointer', background: dragOver ? '#FEF9ED' : '#FAFAF8',
                transition: 'all 0.2s', marginBottom: 14,
              }}
            >
              <FaUpload style={{ fontSize: 24, color: dragOver ? gold : '#AAA', marginBottom: 8 }} />
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: navy }}>Drop images here</p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#7A869A' }}>or click to browse · max 5 images</p>
              <input id="imgInput" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleImageDrop} />
            </div>

            {/* Image previews */}
            {images.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {images.map((img, i) => (
                  <div key={img.id} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: i === 0 ? `2px solid ${gold}` : '1.5px solid #EDE8DE', aspectRatio: '1' }}>
                    <img src={img.url} alt={img.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 0 && <span style={{ position: 'absolute', top: 5, left: 5, background: gold, color: navy, fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 6 }}>MAIN</span>}
                    <button onClick={() => removeImage(img.id)} style={{
                      position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: '50%',
                      background: '#A32D2D', border: 'none', color: white, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
                    }}>×</button>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: 11, color: '#AAA', marginTop: 10, textAlign: 'center' }}>First image will be the main product photo</p>
          </SectionCard>

          {/* Featured toggle */}
          <SectionCard icon={<FaTags />} title="Visibility">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#F8F4EC', borderRadius: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: navy }}>Featured Product</p>
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#7A869A' }}>Show on homepage highlights</p>
              </div>
              <div
                onClick={() => setForm(f => ({ ...f, featured: !f.featured }))}
                style={{
                  width: 44, height: 24, borderRadius: 12, cursor: 'pointer', position: 'relative',
                  background: form.featured ? gold : '#D0C8B8', transition: 'background 0.2s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', background: white,
                  position: 'absolute', top: 3, transition: 'left 0.2s',
                  left: form.featured ? 23 : 3,
                }} />
              </div>
            </div>

            {/* Summary preview */}
            <div style={{ marginTop: 16, padding: '14px 16px', background: '#F0EAD8', borderRadius: 10 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 700, color: '#5A6478', textTransform: 'uppercase', letterSpacing: 0.5 }}>Preview</p>
              <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 700, color: navy }}>{form.name || 'Product name'}</p>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: gold, fontWeight: 600 }}>{form.category || 'Category'}</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: navy }}>
                {form.discountPrice ? `LKR ${Number(form.discountPrice).toLocaleString()}` : form.price ? `LKR ${Number(form.price).toLocaleString()}` : 'LKR —'}
                {form.discountPrice && form.price && (
                  <span style={{ fontSize: 11, color: '#AAA', textDecoration: 'line-through', marginLeft: 6 }}>LKR {Number(form.price).toLocaleString()}</span>
                )}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: form.stock > 0 ? '#2E7D52' : '#A32D2D', fontWeight: 600 }}>
                {form.stock > 0 ? `${form.stock} in stock` : 'Out of stock'}
              </p>
            </div>
          </SectionCard>

        </div>
      </div>

      {/* ── Bottom Save Bar ── */}
      <div style={{
        position: 'sticky', bottom: 20, background: navy, borderRadius: 14,
        padding: '16px 24px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginTop: 10, boxShadow: '0 8px 32px rgba(26,35,64,0.25)',
      }}>
        <p style={{ margin: 0, color: '#8899BB', fontSize: 13 }}>
          {!form.name && !form.price ? 'Fill in the required fields to save' :
           !form.name ? '⚠ Product name is required' :
           !form.price ? '⚠ Price is required' :
           !form.category ? '⚠ Category is required' :
           !form.stock ? '⚠ Stock quantity is required' :
           <span style={{ color: goldLight }}>✓ Ready to save</span>}
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => navigate('/seller/my-items')} style={{
            padding: '10px 20px', borderRadius: 10, border: '1.5px solid #4A5878',
            background: 'transparent', color: '#8899BB', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}>Cancel</button>
          <button onClick={handleSubmit} style={{
            padding: '10px 28px', borderRadius: 10, border: 'none',
            background: submitted ? '#2E7D52' : gold,
            color: submitted ? white : navy,
            fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>
            {submitted ? '✓ Saved!' : 'Save Item'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default AddItems;