import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaArrowLeft, FaPlus, FaUpload, FaBoxOpen, FaDollarSign, FaImage } from 'react-icons/fa';
import './AddItems.css';

const CATEGORIES = ['Gift Boxes', 'Hampers', 'Floral', 'Special', 'Cakes & Sweets', 'Electronics', 'Clothing'];

// ── Reusable field components ──────────────────────────────────
const Label = ({ children, required }) => (
  <label className="ai-label">
    {children} {required && <span className="required">*</span>}
  </label>
);

const Input = ({ className = '', ...props }) => (
  <input className={`ai-input ${className}`} {...props} />
);

const Textarea = ({ className = '', ...props }) => (
  <textarea className={`ai-textarea ${className}`} {...props} />
);

const Select = ({ children, className = '', ...props }) => (
  <select className={`ai-select ${className}`} {...props}>
    {children}
  </select>
);

// ── Section Card ───────────────────────────────────────────────
const SectionCard = ({ icon, title, children }) => (
  <div className="ai-card">
    <div className="ai-card-header">
      <span className="icon">{icon}</span>
      <h3>{title}</h3>
    </div>
    <div className="ai-card-body">{children}</div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────
const AddItems = () => {
  const navigate = useNavigate();
  const [dragOver, setDragOver]   = useState(false);
  const [images, setImages]       = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '', category: '', price: '', discountPrice: '',
    stock: '', sku: '', description: '',
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // ── Image handling ──
  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || e.target.files || []);
    const newImgs = files.slice(0, 5 - images.length).map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      url: URL.createObjectURL(f),
      file: f
    }));
    setImages(prev => [...prev, ...newImgs].slice(0, 5));
  };

  const removeImage = (id) => setImages(prev => prev.filter(i => i.id !== id));

  // ── Submit ──
  const handleSubmit = async () => {
    if (!form.name || !form.category || !form.price || !form.stock) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitted(true);

    try {
      let uploadedImageUrl = '';

      // 1. පින්තූරයක් තියෙනවා නම් මුලින්ම Cloudinary එකට Upload කිරීම
      if (images.length > 0) {
        const formData = new FormData();
        formData.append('file', images[0].file); // Main image එක පමණක් යවමු
        formData.append('upload_preset', 'giftora_items'); // Cloudinary Preset එක දෙන්න
        formData.append('cloud_name', 'dju3eqysw'); // ඔයාගේ Cloudinary Name එක

        const cloudinaryRes = await axios.post(
          'https://api.cloudinary.com/v1_1/dju3eqysw/image/upload',
          formData
        );
        uploadedImageUrl = cloudinaryRes.data.secure_url; // Upload වුණු පින්තූරයේ URL එක
      }

      // 2. Spring Boot Backend එකට යවන Payload එක හැදීම
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        stockQuantity: parseInt(form.stock, 10),
        sku: form.sku ? form.sku : null,
        isActive: form.is_active ? 1 : 0, // Boolean එක 1 හෝ 0 බවට පත් කිරීම
        imageUrl: uploadedImageUrl || 'https://via.placeholder.com/220x150?text=No+Image', // පින්තූරයක් නැත්නම් Default එකක්
        categoryId: 1 // දැනට 1 ලෙස යවමු. පසුව මෙය Category Dropdown එකේ ID එකට සම්බන්ධ කරන්න.
      };

      const SELLER_ID = 2; // දැනට Gift World ගේ ID එක 

      // 3. Spring Boot API එකට POST Request එක යැවීම
      await axios.post(`http://localhost:8080/api/sellers/${SELLER_ID}/products`, payload);

      // සාර්ථක වුණාම My Items පිටුවට යැවීම
      setTimeout(() => {
        setSubmitted(false);
        navigate('/seller/my-items');
      }, 1000);

    } catch (error) {
      console.error('Error saving item:', error);
      alert('Failed to save the item. Please try again.');
      setSubmitted(false);
    }
  };

  return (
    <div className="ai-page">

      {/* ── Page Header ── */}
      <div className="ai-header">
        <div className="ai-header-left">
          <button className="ai-back-btn" onClick={() => navigate('/seller/my-items')}>
            <FaArrowLeft />
          </button>
          <div>
            <h1>Add New Item</h1>
            <p>Fill in the details to list a new product</p>
          </div>
        </div>
        <div className="ai-header-actions">
          <button className="btn-cancel" onClick={() => navigate('/seller/my-items')}>Cancel</button>
          <button className={`btn-save${submitted ? ' saved' : ''}`} onClick={handleSubmit}>
            <FaPlus size={12} /> {submitted ? 'Saving…' : 'Save Item'}
          </button>
        </div>
      </div>

      <div className="ai-grid">

        {/* ── Left Column ── */}
        <div>

          {/* Basic Info */}
          <SectionCard icon={<FaBoxOpen />} title="Basic Information">
            <div className="ai-field">
              <Label required>Product Name</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Premium Gift Box Deluxe" />
            </div>
            <div className="ai-field">
              <Label required>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your product — what's included, occasion, packaging…" />
            </div>
            <div className="ai-row ai-row-2">
              <div>
                <Label required>Category</Label>
                <Select name="category" value={form.category} onChange={handleChange}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <div className="ai-toggle-row" style={{ marginTop: 0 }}>
                  <div className="ai-toggle-label">
                    <p>{form.is_active ? 'Active' : 'Inactive'}</p>
                    <span>{form.is_active ? 'Visible to buyers' : 'Hidden from buyers'}</span>
                  </div>
                  <div
                    className="ai-toggle"
                    style={{ background: form.is_active ? 'var(--gold)' : '#D0C8B8' }}
                    onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  >
                    <div className="ai-toggle-knob" style={{ left: form.is_active ? 23 : 3 }} />
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Pricing & Inventory */}
          <SectionCard icon={<FaDollarSign />} title="Pricing & Inventory">
            <div className="ai-row ai-row-2">
              <div>
                <Label required>Price (LKR)</Label>
                <Input name="price" type="number" value={form.price} onChange={handleChange} placeholder="0.00" />
              </div>
              <div>
                <Label>Discount Price (LKR)</Label>
                <Input name="discountPrice" type="number" value={form.discountPrice} onChange={handleChange} placeholder="0.00" />
              </div>
            </div>
            <div className="ai-row ai-row-2">
              <div>
                <Label required>Stock Quantity</Label>
                <Input name="stock" type="number" value={form.stock} onChange={handleChange} placeholder="0" />
              </div>
              <div>
                <Label>SKU</Label>
                <Input name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. GFT-BOX-001" />
              </div>
            </div>

            {/* Discount preview */}
            {form.price && form.discountPrice && Number(form.discountPrice) < Number(form.price) && (
              <div className="ai-discount-badge">
                💰 Discount:{' '}
                <strong style={{ color: 'var(--green)' }}>
                  {Math.round((1 - form.discountPrice / form.price) * 100)}% off
                </strong>{' '}
                — customer saves{' '}
                <strong style={{ color: 'var(--green)' }}>
                  LKR {(form.price - form.discountPrice).toLocaleString()}
                </strong>
              </div>
            )}
          </SectionCard>

          {/* Image Upload — moved to left column, below pricing */}
          <SectionCard icon={<FaImage />} title="Product Images">
            <div
              className={`ai-dropzone${dragOver ? ' drag-over' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleImageDrop}
              onClick={() => document.getElementById('imgInput').click()}
            >
              <div><FaUpload className="dz-icon" /></div>
              <p className="dz-title">Drop images here</p>
              <p className="dz-sub">or click to browse · max 5 images</p>
              <input
                id="imgInput"
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                onChange={handleImageDrop}
              />
            </div>

            {images.length > 0 && (
              <div className="ai-img-grid">
                {images.map((img, i) => (
                  <div key={img.id} className={`ai-img-thumb${i === 0 ? ' main-img' : ''}`}>
                    <img src={img.url} alt={img.name} />
                    {i === 0 && <span className="main-badge">MAIN</span>}
                    <button className="remove-btn" onClick={() => removeImage(img.id)}>×</button>
                  </div>
                ))}
              </div>
            )}
            <p className="ai-img-hint">First image will be the main product photo</p>
          </SectionCard>

        </div>

      </div>
    </div>
  );
};

export default AddItems;