import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaPlus, FaTrash, FaCheck, FaArrowLeft, FaInfoCircle, FaTags } from 'react-icons/fa';
import './CreateGiftBox.css';

const API_BASE = `${process.env.REACT_APP_API_URL}/api`;

const getSellerId = () => {
  const localId = localStorage.getItem('userId');
  return localId ? parseInt(localId, 10) : 2;
};

const CreateGiftBox = () => {
  const navigate = useNavigate();
  const sellerId = getSellerId();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Birthday');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Items from vendor inventory
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch vendor's available items
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await fetch(`${API_BASE}/vendors/${sellerId}/items`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setInventoryItems(data || []);
        }
      } catch (err) {
        console.error('Failed to load items:', err);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchInventory();
  }, [sellerId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddItem = (item) => {
    const exists = selectedItems.find((i) => i.id === item.id);
    if (exists) {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
    }
  };

  const handleQtyChange = (itemId, qty) => {
    const parsedQty = parseInt(qty, 10);
    if (parsedQty <= 0) {
      handleRemoveItem(itemId);
    } else {
      setSelectedItems(
        selectedItems.map((i) =>
          i.id === itemId ? { ...i, quantity: parsedQty } : i
        )
      );
    }
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== itemId));
  };

  const itemsTotalCost = selectedItems.reduce(
    (sum, i) => sum + Number(i.price || 0) * (i.quantity || 1),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert('Please add at least one item into the gift box!');
      return;
    }

    setSubmitting(true);

    const payload = {
      vendor_id: sellerId,
      name: title,
      category,
      price: parseFloat(price),
      description,
      items: selectedItems.map((i) => ({ item_id: i.id, quantity: i.quantity }))
    };

    try {
      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      if (image) {
        formData.append('image', image);
      }

      const res = await fetch(`${API_BASE}/vendor/gift-boxes`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (res.ok) {
        alert('Gift Box created successfully!');
        navigate('/vendor/my-items');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to create gift box.');
      }
    } catch (error) {
      console.error('Error creating box:', error);
      alert('Error creating gift box. Check console for details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cgb-container">
      <form onSubmit={handleSubmit}>
        
        {/* Header matches the new light theme layout */}
        <div className="cgb-top-bar">
          <div className="cgb-top-left">
            <button type="button" className="cgb-back-icon-btn" onClick={() => navigate('/vendor')}>
              <FaArrowLeft />
            </button>
            <div className="cgb-title-wrap">
              <h2>Create Custom Gift Box</h2>
              <p>Fill in the details to list a new box package</p>
            </div>
          </div>
          <div className="cgb-top-right">
            <button type="button" className="cgb-btn-cancel" onClick={() => navigate('/vendor')}>
              Cancel
            </button>
            <button type="submit" className="cgb-btn-save" disabled={submitting}>
              {submitting ? 'Saving...' : '+ Save Box'}
            </button>
          </div>
        </div>

        <div className="cgb-form-grid">
          {/* Left Column: Form Details */}
          <div className="cgb-card">
            <h3 className="cgb-section-title">
              <FaInfoCircle className="cgb-section-icon" /> Basic Information
            </h3>

            <div className="cgb-field">
              <label>Box Title / Name *</label>
              <input
                type="text"
                placeholder="e.g. Birthday Delight Care Box"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="cgb-field">
              <label>Description *</label>
              <textarea
                rows="4"
                placeholder="Describe your box — what's included, occasion, packaging..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="cgb-row">
              <div className="cgb-field">
                <label>Main Category *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="Birthday">Birthday</option>
                  <option value="Anniversary">Anniversary</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Valentine">Valentine</option>
                  <option value="Graduation">Graduation</option>
                  <option value="General">General / Other</option>
                </select>
              </div>

              <div className="cgb-field">
                <label>Selling Price (LKR) *</label>
                <input
                  type="number"
                  placeholder="e.g. 5500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <span className="cgb-hint">
                  Items base sum: LKR {itemsTotalCost.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="cgb-field">
              <label>Cover Photo</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {imagePreview && (
                <div className="cgb-preview-wrap">
                  <img src={imagePreview} alt="Preview" className="cgb-preview-img" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Add Inventory Items */}
          <div className="cgb-card">
            <h3 className="cgb-section-title">
              <FaTags className="cgb-section-icon" /> Box Contents & Inventory
            </h3>
            
            <label className="cgb-sub-label">SELECTED ITEMS ({selectedItems.length})</label>
            {selectedItems.length === 0 ? (
              <div className="cgb-empty-box">
                <FaBoxOpen size={30} color="#C9A84C" />
                <p>No items added yet. Pick from your inventory below.</p>
              </div>
            ) : (
              <div className="cgb-selected-list">
                {selectedItems.map((item) => (
                  <div key={item.id} className="cgb-selected-row">
                    <div>
                      <strong>{item.name}</strong>
                      <p className="cgb-subtext">LKR {Number(item.price).toLocaleString()} each</p>
                    </div>
                    <div className="cgb-qty-controls">
                      <label style={{ marginBottom: 0, fontSize: '0.7rem' }}>QTY:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      />
                      <button
                        type="button"
                        className="cgb-btn-delete"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <hr style={{ margin: '24px 0', borderColor: '#f1ece4' }} />

            <label className="cgb-sub-label">YOUR AVAILABLE ITEMS</label>
            {loadingItems ? (
              <p>Loading items...</p>
            ) : inventoryItems.length === 0 ? (
              <p className="cgb-empty-text">No inventory items found. Add items first under 'My Items'.</p>
            ) : (
              <div className="cgb-inventory-grid">
                {inventoryItems.map((item) => {
                  const isSelected = selectedItems.some((i) => i.id === item.id);
                  return (
                    <div key={item.id} className={`cgb-item-card ${isSelected ? 'selected' : ''}`}>
                      <div className="cgb-item-info">
                        <p className="cgb-item-name">{item.name}</p>
                        <span className="cgb-item-price">LKR {Number(item.price).toLocaleString()}</span>
                      </div>
                      <button
                        type="button"
                        className="cgb-btn-add"
                        onClick={() => handleAddItem(item)}
                      >
                        {isSelected ? <FaCheck size={10} /> : <FaPlus size={10} />} {isSelected ? 'Add More' : 'Add'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateGiftBox;