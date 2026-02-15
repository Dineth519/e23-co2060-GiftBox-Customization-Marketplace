import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaCheck, FaTimes, FaMapMarkerAlt, FaUser, FaPhone } from 'react-icons/fa';

const PendingPartners = () => {
  const navigate = useNavigate();
  const [pendingSellers, setPendingSellers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8080/api/partners')
      .then(res => res.json())
      .then(data => {
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
    <div style={styles.pageContainer}>
      <div style={styles.headerSection}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <FaArrowLeft /> Back to Partners
        </button>
        <h1 style={styles.mainTitle}>Pending Requests</h1>
        <p style={styles.subTitle}>Review and approve new partner applications</p>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{pendingSellers.length}</h3>
          <p style={styles.statLabel}>Pending Requests</p>
        </div>
      </div>

      <div style={styles.cardListWrapper}>
        {pendingSellers.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No pending requests found.</p>
          </div>
        ) : (
          pendingSellers.map((seller) => (
            <div key={seller.id} style={styles.cardWrapper}>
              <div style={styles.cardContent}>
                <div style={{ flex: 1 }}>
                  <h2 style={styles.shopName}>{seller.shop}</h2>
                  <div style={styles.metaGrid}>
                    <span style={styles.metaItem}><FaUser /> {seller.name}</span>
                    <span style={styles.metaItem}><FaPhone /> {seller.phone}</span>
                    <span style={styles.metaItem}><FaMapMarkerAlt /> {seller.address}</span>
                    <span style={{ ...styles.metaItem, fontWeight: 'bold' }}>BR No: {seller.br_no}</span>
                  </div>
                </div>
                
                <div style={styles.actionButtons}>
                  <button 
                    style={styles.approveBtn} 
                    onClick={() => handleStatusUpdate(seller.id, 'ACTIVE')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                  >
                    <FaCheck /> Approve
                  </button>
                  
                  <button 
                    style={styles.rejectBtn} 
                    onClick={() => handleStatusUpdate(seller.id, 'REJECTED')}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
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

// Styles
const styles = {
  pageContainer: { 
    padding: '40px',
    position: 'relative',
    zIndex: 1,
    marginLeft: '300px'
  },
  headerSection: { 
    marginBottom: '30px' 
  },
  backBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px', 
    background: 'none', 
    border: 'none', 
    color: '#4f46e5', 
    fontWeight: 'bold', 
    cursor: 'pointer', 
    marginBottom: '10px',
    fontSize: '14px',
    transition: 'color 0.2s'
  },
  mainTitle: { 
    fontSize: '36px', 
    fontWeight: '700', 
    color: '#010911',
    margin: '0 0 8px 0'
  },
  subTitle: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0,
    marginBottom: '20px'
  },
  
  // Stats Summary
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#ef4444',
    margin: '0 0 8px 0'
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  
  cardListWrapper: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px 20px',
    textAlign: 'center'
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '16px',
    margin: 0
  },
  cardWrapper: { 
    background: '#fff', 
    borderRadius: '16px', 
    padding: '25px', 
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    border: '1px solid #f1f5f9',
    position: 'relative',
    zIndex: 1,
    transition: 'all 0.2s'
  },
  cardContent: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap'
  },
  shopName: { 
    margin: '0 0 10px 0', 
    fontSize: '24px', 
    fontWeight: '700',
    color: '#111827'
  },
  metaGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '15px', 
    color: '#64748b', 
    fontSize: '14px' 
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actionButtons: { 
    display: 'flex', 
    gap: '10px',
    flexWrap: 'wrap'
  },
  approveBtn: { 
    display: 'flex', 
    gap: '8px', 
    alignItems: 'center', 
    padding: '12px 20px', 
    backgroundColor: '#10b981', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '600',
    transition: 'background 0.2s',
    fontSize: '14px'
  },
  rejectBtn: { 
    display: 'flex', 
    gap: '8px', 
    alignItems: 'center', 
    padding: '12px 20px', 
    backgroundColor: '#ef4444', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer', 
    fontWeight: '600',
    transition: 'background 0.2s',
    fontSize: '14px'
  }
};

export default PendingPartners;