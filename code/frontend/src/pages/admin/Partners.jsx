import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaClock, FaArrowRight, FaMapMarkerAlt, FaUser, 
  FaEnvelope, FaPhone, FaCalendarCheck, FaChevronDown, FaChevronUp 
} from 'react-icons/fa';

const Partners = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);
  const [activeSellers, setActiveSellers] = useState([]); 
  const [pendingCount, setPendingCount] = useState(0);

  // --- Fetch Data from Backend ---
  useEffect(() => {
    fetch('http://localhost:8080/api/partners')
      .then(res => res.json())
      .then(data => {
        // 1. Calculate Pending Count
        const pending = data.filter(p => p.status === 'PENDING').length;
        setPendingCount(pending);

        // 2. Filter Active Partners and Map to UI format
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
    <div style={styles.pageContainer}>
      
      {/* --- HEADER SECTION --- */}
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.mainTitle}>Partners</h1>
          <p style={styles.subTitleText}>Manage your business partners and pending requests</p>
        </div>

        <button onClick={() => navigate('/admin/partners/pending')} style={styles.pendingActionBtn}>
          {/* Dynamic Pending Count */}
          <div style={styles.notificationBadge}>{pendingCount}</div>
          
          <FaClock size={16} style={{ color: '#94a3b8' }} />
          <div style={styles.btnTextWrapper}>
             <span style={styles.btnLabel}>View Pending</span>
             <span style={styles.btnLabel}>Requests</span>
          </div>
          <FaArrowRight size={12} style={{ color: '#ffffff', opacity: 0.8 }} />
        </button>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{activeSellers.length}</h3>
          <p style={styles.statLabel}>Active Partners</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{pendingCount}</h3>
          <p style={styles.statLabel}>Pending Requests</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{activeSellers.length + pendingCount}</h3>
          <p style={styles.statLabel}>Total Partners</p>
        </div>
      </div>

      <h3 style={styles.subTitle}>Active Partners</h3>

      {/* --- PARTNERS LIST SECTION --- */}
      <div style={styles.cardListWrapper}>
        
        {activeSellers.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No active partners found.</p>
            </div>
        ) : (
            activeSellers.map((seller) => (
            <div key={seller.id} style={styles.getCardWrapperStyle(expandedId === seller.id)}>
                
                {/* Header portion */}
                <div onClick={() => toggleExpand(seller.id)} style={styles.cardHeader}>
                  <div style={{ flex: 1 }}>
                      <div style={styles.shopNameText}>{seller.shop}</div>
                      <div style={styles.cardMeta}>
                      <span style={styles.metaItem}><FaUser size={12}/> {seller.name}</span>
                      <span style={styles.metaItem}><FaMapMarkerAlt size={12}/> {seller.address}</span>
                      </div>
                  </div>
                  <div>
                      {expandedId === seller.id ? <FaChevronUp color="#94a3b8"/> : <FaChevronDown color="#94a3b8"/>}
                  </div>
                </div>

                {/* Hidden details */}
                {expandedId === seller.id && (
                <div style={styles.detailsSection}>
                    <div style={styles.detailsGrid}>
                    <div style={styles.infoBlock}>
                        <label style={styles.infoLabel}>Email Address</label>
                        <div style={styles.infoValue}><FaEnvelope style={{marginRight: '8px'}}/> {seller.email}</div>
                    </div>
                    <div style={styles.infoBlock}>
                        <label style={styles.infoLabel}>Phone Number</label>
                        <div style={styles.infoValue}><FaPhone style={{marginRight: '8px'}}/> {seller.phone}</div>
                    </div>
                    <div style={styles.infoBlock}>
                        <label style={styles.infoLabel}>BR Number</label>
                        <div style={styles.infoValue}>{seller.br_no}</div>
                    </div>
                    <div style={styles.infoBlock}>
                        <label style={styles.infoLabel}>Joined Date</label>
                        <div style={styles.infoValue}><FaCalendarCheck style={{marginRight: '8px'}}/> {seller.joined}</div>
                    </div>
                    </div>
                    <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button style={styles.manageBtn}>Manage Shop</button>
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

// --- STYLES OBJECT ---
const styles = {
  pageContainer: { 
    padding: '40px',
    position: 'relative',
    zIndex: 1,
    marginLeft: '300px'
  },
  headerSection: { 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'flex-start', 
    gap: '20px', 
    marginBottom: '30px',
    flexWrap: 'wrap'
  },
  mainTitle: { 
    fontSize: '36px', 
    fontWeight: '700', 
    color: '#010911', 
    margin: '0 0 8px 0' 
  },
  subTitleText: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  pendingActionBtn: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    padding: '12px 24px', 
    backgroundColor: '#1e293b', 
    color: 'white', 
    border: 'none', 
    borderRadius: '16px', 
    cursor: 'pointer', 
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s'
  },
  notificationBadge: { 
    background: '#ef4444', 
    color: 'white', 
    width: '24px', 
    height: '24px', 
    borderRadius: '50%', 
    fontSize: '12px', 
    fontWeight: 'bold', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  btnTextWrapper: { 
    display: 'flex', 
    flexDirection: 'column', 
    textAlign: 'left', 
    lineHeight: '1.1' 
  },
  btnLabel: { 
    fontSize: '13px', 
    fontWeight: '600' 
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
    color: '#4f46e5',
    margin: '0 0 8px 0'
  },
  statLabel: {
    fontSize: '14px',
    color: '#64748b',
    margin: 0
  },
  
  subTitle: { 
    fontSize: '22px', 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: '25px' 
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
  
  // Dynamic Style Function
  getCardWrapperStyle: (isOpen) => ({ 
    background: '#ffffff', 
    borderRadius: '24px', 
    border: isOpen ? '2px solid #4f46e5' : '1px solid #f1f5f9', 
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', 
    overflow: 'hidden', 
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: 1
  }),

  cardHeader: { 
    padding: '30px', 
    display: 'flex', 
    alignItems: 'center', 
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  shopNameText: { 
    fontSize: '26px', 
    fontWeight: '800', 
    color: '#111827' 
  },
  cardMeta: { 
    display: 'flex', 
    gap: '20px', 
    marginTop: '10px', 
    color: '#6b7280', 
    fontSize: '15px',
    flexWrap: 'wrap'
  },
  metaItem: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '8px' 
  },
  detailsSection: { 
    padding: '0 30px 30px 30px', 
    borderTop: '1px solid #f3f4f6', 
    backgroundColor: '#f9fafb' 
  },
  detailsGrid: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
    gap: '24px', 
    marginTop: '24px' 
  },
  infoBlock: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '6px' 
  },
  infoLabel: { 
    fontSize: '11px', 
    color: '#9ca3af', 
    fontWeight: '800', 
    textTransform: 'uppercase' 
  },
  infoValue: { 
    fontSize: '15px', 
    color: '#374151', 
    display: 'flex', 
    alignItems: 'center' 
  },
  manageBtn: { 
    padding: '12px 24px', 
    background: '#4f46e5', 
    color: 'white', 
    border: 'none', 
    borderRadius: '10px', 
    fontWeight: '700', 
    cursor: 'pointer',
    transition: 'background 0.2s'
  }
};

export default Partners;