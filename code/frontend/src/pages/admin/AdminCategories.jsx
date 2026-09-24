import React, { useState, useEffect } from 'react';
import { FaPlus, FaFolder, FaTrash } from 'react-icons/fa';
import { createCategory, deleteCategory } from '../../utils/adminApi';
import './AdminCategories.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
        setLoading(false);
      });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setAdding(true);
    try {
      await createCategory(newCategoryName);
      setNewCategoryName('');
      fetchCategories(); // Refresh list
    } catch (err) {
      console.error("Error adding category:", err);
      alert('Network error while adding category.');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the category "${name}"?`)) return;

    try {
      await deleteCategory(id);
      fetchCategories(); // Refresh list
    } catch (err) {
      console.error("Error deleting category:", err);
      alert('Network error while deleting category.');
    }
  };

  return (
    <div className="categories-container">
      <div className="categories-header">
        <div className="header-text">
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage product categories</p>
        </div>
      </div>

      <form className="add-category-form" onSubmit={handleAddCategory}>
        <input 
          type="text" 
          className="add-category-input"
          placeholder="New category name (e.g., Watches)" 
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          disabled={adding}
        />
        <button type="submit" className="add-category-btn" disabled={adding || !newCategoryName.trim()}>
          <FaPlus size={14} /> {adding ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading categories...</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map(cat => (
            <div key={cat.id} className="category-card">
              <button 
                className="delete-category-btn" 
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                title="Delete Category"
              >
                <FaTrash size={14} />
              </button>
              <div className="category-icon-wrapper">
                <FaFolder size={24} />
              </div>
              <div className="category-name">{cat.name}</div>
            </div>
          ))}
          {categories.length === 0 && <p className="empty-text">No categories found.</p>}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
