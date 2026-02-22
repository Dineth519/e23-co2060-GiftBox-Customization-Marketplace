import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaClock, FaArrowRight, FaMapMarkerAlt, FaUser, 
  FaEnvelope, FaPhone, FaCalendarCheck, FaChevronDown, 
  FaChevronUp, FaStore, FaBell 
} from 'react-icons/fa';
import './Partners.css';

const Partners = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [activeSellers, setActiveSellers] = useState([]); 
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8080/api/partners')
      .then(res => res.json())
      .then(data => {
        const pending = data.filter(p => p.status === 'PENDING').length;
        setPendingCount(pending);

        const active = data
          .filter(p => p.status === 'ACTIVE')
          .map(p => ({
            id: p.partnerId,
            shop: p.shopName,
            name: p.fullName,
            address: p.shopAddress,
            email: p.email || 'No Email',
            phone: p.phoneNumber,
            br_no: p.brNo,
            joined: new Date().toLocaleDateString()
          }));
        
        setActiveSellers(active);
      })
      .catch(err => console.error("Error fetching partners:", err));
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="partners-container">
      
      {/* Header Section */}
      <div className="partners-header">
        <div className="header-text">
          <h1 className="page-title">Partners Management</h1>
          <p className="page-subtitle">Manage your business partners and monitor pending requests</p>
        </div>

        {/* Professional Pending Request Button */}
        {pendingCount > 0 && (
          <div className="pending-alert-wrapper">
            <button 
              onClick={() => navigate('/admin/partners/pending')} 
              className="pending-alert-btn"
            >
              <div className="alert-icon-wrapper">
                <FaBell className="bell-icon" />
                <span className="pulse-dot"></span>
              </div>
              
              <div className="alert-content">
                <div className="alert-header">
                  <span className="alert-count">{pendingCount}</span>
                  <span className="alert-text">Pending Request{pendingCount > 1 ? 's' : ''}</span>
                </div>
                <span className="alert-subtext">Requires your attention</span>
              </div>
              
              <FaArrowRight className="alert-arrow" />
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="stats-grid">
        <div className="stat-card active-card">
          <div className="stat-icon active">
            <FaStore size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{activeSellers.length}</h3>
            <p className="stat-label">Active Partners</p>
            <div className="stat-trend positive">
              <span>●</span> All systems operational
            </div>
          </div>
        </div>
        
        <div className="stat-card pending-card">
          <div className="stat-icon pending">
            <FaClock size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{pendingCount}</h3>
            <p className="stat-label">Pending Requests</p>
            <div className={`stat-trend ${pendingCount > 0 ? 'warning' : 'neutral'}`}>
              <span>●</span> {pendingCount > 0 ? 'Action required' : 'No pending'}
            </div>
          </div>
        </div>
        
        <div className="stat-card total-card">
          <div className="stat-icon total">
            <FaStore size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{activeSellers.length + pendingCount}</h3>
            <p className="stat-label">Total Partners</p>
            <div className="stat-trend neutral">
              <span>●</span> Overall count
            </div>
          </div>
        </div>
      </div>

      {/* Section Header with Quick Actions */}
      <div className="section-header">
        <h3 className="section-title">Active Partners</h3>
        <div className="section-actions">
          <button className="filter-btn">
            <span>All Partners</span>
            <FaChevronDown size={12} />
          </button>
        </div>
      </div>

      {/* Partners List */}
      <div className="partners-list">
        {activeSellers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrapper">
              <FaStore size={56} className="empty-icon" />
            </div>
            <h3 className="empty-title">No Active Partners</h3>
            <p className="empty-text">There are currently no active partners in the system.</p>
          </div>
        ) : (
          activeSellers.map((seller) => (
            <div 
              key={seller.id} 
              className={`partner-card ${expandedId === seller.id ? 'expanded' : ''}`}
            >
              
              {/* Card Header */}
              <div 
                onClick={() => toggleExpand(seller.id)} 
                className="card-header"
              >
                <div className="header-left">
                  <div className="shop-avatar">
                    <FaStore size={20} />
                  </div>
                  <div className="header-info">
                    <div className="shop-name">{seller.shop}</div>
                    <div className="card-meta">
                      <span className="meta-item">
                        <FaUser size={12}/> {seller.name}
                      </span>
                      <span className="meta-item">
                        <FaMapMarkerAlt size={12}/> {seller.address}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="header-right">
                  <span className="status-badge active">Active</span>
                  <div className="expand-icon">
                    {expandedId === seller.id ? 
                      <FaChevronUp size={18} /> : 
                      <FaChevronDown size={18} />
                    }
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === seller.id && (
                <div className="details-section">
                  <div className="details-grid">
                    <div className="info-block">
                      <label className="info-label">
                        <FaEnvelope className="label-icon" />
                        Email Address
                      </label>
                      <div className="info-value">{seller.email}</div>
                    </div>
                    
                    <div className="info-block">
                      <label className="info-label">
                        <FaPhone className="label-icon" />
                        Phone Number
                      </label>
                      <div className="info-value">{seller.phone}</div>
                    </div>
                    
                    <div className="info-block">
                      <label className="info-label">
                        Business Registration
                      </label>
                      <div className="info-value">{seller.br_no}</div>
                    </div>
                    
                    <div className="info-block">
                      <label className="info-label">
                        <FaCalendarCheck className="label-icon" />
                        Joined Date
                      </label>
                      <div className="info-value">{seller.joined}</div>
                    </div>
                  </div>
                  
                  <div className="card-actions">
                    <button className="action-btn secondary">View Details</button>
                    <button className="action-btn primary">Manage Shop</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Partners;