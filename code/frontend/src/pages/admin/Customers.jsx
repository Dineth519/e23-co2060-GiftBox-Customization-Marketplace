import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaMapMarkerAlt, FaSearch, FaEllipsisV 
} from 'react-icons/fa';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fetch Data from Backend ---
  useEffect(() => {
    fetch('http://localhost:8080/api/users') 
      .then(res => res.json())
      .then(data => {
        const customerData = data.filter(user => user.role === 'CUSTOMER');
        setCustomers(customerData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching customers:", err);
        setLoading(false);
      });
  }, []);

  // Filter based on Search
  const filteredCustomers = customers.filter(customer =>
    customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.pageContainer}>
      
      {/* --- HEADER SECTION --- */}
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.mainTitle}>Customers</h1>
          <p style={styles.subTitle}>Manage and view all customer accounts</p>
        </div>
        
        {/* Modern Search Bar */}
        <div style={styles.searchWrapper}>
          <FaSearch style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{customers.length}</h3>
          <p style={styles.statLabel}>Total Customers</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>{filteredCustomers.length}</h3>
          <p style={styles.statLabel}>Filtered Results</p>
        </div>
        <div style={styles.statCard}>
          <h3 style={styles.statNumber}>
            {customers.filter(c => c.address).length}
          </h3>
          <p style={styles.statLabel}>With Address</p>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      {loading ? (
        <div style={styles.loadingContainer}>
          <p style={styles.loadingText}>Loading customers...</p>
        </div>
      ) : (
        <div style={styles.gridContainer}>
          {filteredCustomers.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>No customers found.</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div 
                key={customer.user_id} 
                style={styles.card}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.05)';
                }}
              >
                
                {/* Top: Avatar & Menu */}
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>
                    <FaUser size={20} color="#4f46e5" />
                  </div>
                  <button 
                    style={styles.menuBtn}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FaEllipsisV color="#94a3b8" />
                  </button>
                </div>

                {/* Middle: User Info */}
                <div style={styles.cardBody}>
                  <h3 style={styles.userName}>{customer.username}</h3>
                  <div style={styles.roleBadge}>Customer</div>
                  
                  <div style={styles.infoRow}>
                    <FaEnvelope size={12} color="#94a3b8" />
                    <span style={styles.infoText}>{customer.email}</span>
                  </div>
                  
                  <div style={styles.infoRow}>
                    <FaMapMarkerAlt size={12} color="#94a3b8" />
                    <span style={styles.infoText}>
                      {customer.address || "No Address Provided"}
                    </span>
                  </div>
                </div>

                {/* Bottom: Action Button */}
                <div style={styles.cardFooter}>
                  <button 
                    style={styles.viewBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    View Profile
                  </button>
                </div>

              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// --- STYLES OBJECT (CSS-in-JS) ---
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
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px'
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
    margin: 0
  },
  searchWrapper: { 
    position: 'relative', 
    minWidth: '300px',
    flex: '0 1 auto'
  },
  searchIcon: { 
    position: 'absolute', 
    left: '15px', 
    top: '50%', 
    transform: 'translateY(-50%)', 
    color: '#94a3b8' 
  },
  searchInput: { 
    width: '100%', 
    padding: '12px 12px 12px 45px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    outline: 'none', 
    fontSize: '14px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
    backgroundColor: 'white'
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
  
  // Grid Layout for Cards
  gridContainer: { 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
    gap: '25px' 
  },
  
  // Loading & Empty States
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '16px'
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px'
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '16px'
  },
  
  // Card Styles
  card: { 
    backgroundColor: '#ffffff', 
    borderRadius: '20px', 
    padding: '25px', 
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', 
    border: '1px solid #f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    zIndex: 1
  },
  cardHeader: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  avatar: { 
    width: '50px', 
    height: '50px', 
    borderRadius: '16px', 
    backgroundColor: '#eef2ff', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  menuBtn: { 
    background: 'transparent', 
    border: 'none', 
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '8px',
    transition: 'background 0.2s'
  },
  cardBody: { 
    marginBottom: '20px' 
  },
  userName: { 
    fontSize: '18px', 
    fontWeight: '700', 
    color: '#334155', 
    margin: '0 0 8px 0' 
  },
  roleBadge: { 
    display: 'inline-block', 
    padding: '4px 12px', 
    borderRadius: '20px', 
    backgroundColor: '#f0fdf4', 
    color: '#16a34a', 
    fontSize: '11px', 
    fontWeight: '600',
    marginBottom: '15px'
  },
  infoRow: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    marginBottom: '10px' 
  },
  infoText: { 
    fontSize: '13px', 
    color: '#64748b',
    wordBreak: 'break-word'
  },
  cardFooter: { 
    marginTop: 'auto', 
    borderTop: '1px solid #f1f5f9', 
    paddingTop: '15px' 
  },
  viewBtn: { 
    width: '100%', 
    padding: '10px', 
    borderRadius: '10px', 
    border: '1px solid #e2e8f0', 
    backgroundColor: 'transparent', 
    color: '#475569', 
    fontWeight: '600', 
    fontSize: '13px', 
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  }
};

export default Customers;