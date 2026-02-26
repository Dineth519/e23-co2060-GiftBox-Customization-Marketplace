import React, { useState } from 'react';
import SellerSidebar from '../../components/seller/SellerSidebar';

const SellerDashboard = () => {
  // Mock state for items and inventory management
  const [items, setItems] = useState([
    { id: 1, name: 'Luxury Gift Hamper', price: 5500, status: 'Ready to Pack' },
  ]);

  const [newItem, setNewItem] = useState({ name: '', price: '' });

  // Function to add new inventory items
  const handleAddItem = (e) => {
    e.preventDefault();
    setItems([...items, { ...newItem, id: Date.now(), status: 'In Stock' }]);
    setNewItem({ name: '', price: '' });
    alert("New luxury item listed!");
  };

  return (
    <div style={{ display: 'flex', background: '#f8fafc', minHeight: '100vh' }}>
      <SellerSidebar />
      
      {/* Main content area shifted to the right of the sidebar */}
      <div style={{ flex: 1, padding: '40px', marginLeft: '260px' }}>
        <header style={{ marginBottom: '30px' }}>
          <h1 style={{ color: '#0f172a', fontSize: '2.2rem' }}>Vendor Portal</h1>
          <p style={{ color: '#64748b' }}>Manage your premium gift listings and orders.</p>
        </header>

        {/* Section: Add New Product */}
        <div style={{ 
          background: '#fff', 
          padding: '30px', 
          borderRadius: '20px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          marginBottom: '40px' 
        }}>
          <h3 style={{ color: '#0f172a', marginBottom: '20px' }}>List New Premium Item</h3>
          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '20px' }}>
            <input 
              type="text" 
              placeholder="Item Name" 
              style={{ flex: 1, padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
              required 
            />
            <input 
              type="number" 
              placeholder="Price (LKR)" 
              style={{ width: '200px', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}
              value={newItem.price}
              onChange={(e) => setNewItem({...newItem, price: e.target.value})}
              required 
            />
            <button 
              type="submit" 
              style={{ 
                padding: '15px 30px', 
                background: '#d4af37', // Gold color from Giftora theme
                color: '#fff', 
                border: 'none', 
                borderRadius: '12px', 
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Add to Catalog
            </button>
          </form>
        </div>

        {/* Section: Inventory Table */}
        <div style={{ 
          background: '#fff', 
          padding: '30px', 
          borderRadius: '20px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)' 
        }}>
          <h3 style={{ color: '#0f172a', marginBottom: '20px' }}>Active Listings & Orders</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '15px', color: '#64748b' }}>Product</th>
                <th style={{ padding: '15px', color: '#64748b' }}>Status</th>
                <th style={{ padding: '15px', color: '#64748b' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '15px', fontWeight: '500' }}>{item.name} - LKR {item.price}</td>
                  <td style={{ padding: '15px' }}>
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      padding: '6px 12px', 
                      borderRadius: '8px', 
                      fontSize: '0.85rem' 
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '15px' }}>
                    <button style={{ 
                      padding: '8px 16px', 
                      background: '#0f172a', 
                      color: '#fff', 
                      borderRadius: '8px', 
                      border: 'none',
                      cursor: 'pointer'
                    }}>
                      Dispatch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;