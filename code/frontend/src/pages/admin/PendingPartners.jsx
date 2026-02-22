import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaCheck, FaTimes, FaMapMarkerAlt, 
  FaUser, FaPhone, FaStore, FaClock 
} from 'react-icons/fa';
import './PendingPartners.css';

/**
 * PendingPartners Component
 * Displays a list of pending partner/seller applications
 * Allows admin to approve or reject partnership requests
 */
const PendingPartners = () => {
  const navigate = useNavigate();
  const [pendingSellers, setPendingSellers] = useState([]);

  // Fetch pending partners from backend API on component mount
  useEffect(() => {
    fetch('http://localhost:8080/api/partners')
      .then(res => res.json())
      .then(data => {
        // Filter for pending partners and map to local state structure
        const pending = data
          .filter(p => p.status === 'PENDING')
          .map(p => ({
            id: p.partnerId,        
            shop: p.shopName,       
            name: p.fullName,       
            address: p.shopAddress, 
            phone: p.phoneNumber,   
            br_no: p.brNo           
          }));
        setPendingSellers(pending);
      })
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  /**
   * Update partner status via API call
   * Sends approval/rejection request to backend
   * Removes processed request from list on success
   * @param {number} id - Partner ID
   * @param {string} newStatus - New status (ACTIVE or REJECTED)
   */
  const handleStatusUpdate = (id, newStatus) => {
    fetch(`http://localhost:8080/api/partners/${id}/status?status=${newStatus}`, {
      method: 'PUT',
    })
    .then(response => {
      if (response.ok) {
        setPendingSellers(pendingSellers.filter(seller => seller.id !== id));
        console.log("Database updated successfully!");
      } else {
        alert("Failed to update status.");
      }
    })
    .catch(error => {
      console.error("Error connecting to backend:", error);
      alert("Error connecting to server.");
    });
  };

  return (
    <div className="pending-container">
      
      {/* Page header with navigation and title */}
      <div className="pending-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          <FaArrowLeft /> Back to Partners
        </button>
        <h1 className="page-title">Pending Requests</h1>
        <p className="page-subtitle">Review and approve new partner applications</p>
      </div>

      {/* Statistics card showing pending request count */}
      <div className="stats-grid">
        <div className="stat-card pending">
          <div className="stat-icon">
            <FaClock size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{pendingSellers.length}</h3>
            <p className="stat-label">Pending Requests</p>
          </div>
        </div>
      </div>

      {/* List of pending partner requests */}
      <div className="pending-list">
        {pendingSellers.length === 0 ? (
          <div className="empty-state">
            <FaClock size={48} className="empty-icon" />
            <p className="empty-text">No pending requests found.</p>
          </div>
        ) : (
          pendingSellers.map((seller) => (
            <div key={seller.id} className="pending-card">
              
              {/* Card content with shop info and action buttons */}
              <div className="card-content">
                {/* Shop details section with avatar and information */}
                <div className="shop-info">
                  <div className="shop-avatar">
                    <FaStore size={20} />
                  </div>
                  <div className="shop-details">
                    <h2 className="shop-name">{seller.shop}</h2>
                    <div className="meta-grid">
                      <span className="meta-item">
                        <FaUser size={12} /> {seller.name}
                      </span>
                      <span className="meta-item">
                        <FaPhone size={12} /> {seller.phone}
                      </span>
                      <span className="meta-item">
                        <FaMapMarkerAlt size={12} /> {seller.address}
                      </span>
                      <span className="meta-item br-number">
                        BR No: {seller.br_no}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Approve and reject action buttons */}
                <div className="action-buttons">
                  <button 
                    className="approve-btn" 
                    onClick={() => handleStatusUpdate(seller.id, 'ACTIVE')}
                  >
                    <FaCheck /> Approve
                  </button>
                  
                  <button 
                    className="reject-btn" 
                    onClick={() => handleStatusUpdate(seller.id, 'REJECTED')}
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              </div>
              
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingPartners;