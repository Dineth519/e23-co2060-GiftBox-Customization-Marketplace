import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaEnvelope, FaMapMarkerAlt, FaSearch, FaUsers 
} from 'react-icons/fa';
import './Customers.css';

/**
 * Customers Component
 * Displays a list of all customers with search and filter functionality
 * Fetches customer data from the backend API and displays them in a grid layout
 */
const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch all users from backend API and filter for customers
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

  // Filter customers based on search term (username or email)
  const filteredCustomers = customers.filter(customer =>
    customer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="customers-container">
      
      {/* Page header section with title and search bar */}
      <div className="customers-header">
        <div className="header-text">
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage and view all customer accounts</p>
        </div>
        
        {/* Search input field for filtering customers */}
        <div className="search-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Display statistics cards for customer overview */}
      <div className="stats-grid">
        <div className="stat-card customers">
          <div className="stat-icon">
            <FaUsers size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{customers.length}</h3>
            <p className="stat-label">Total Customers</p>
          </div>
        </div>
        
        <div className="stat-card filtered">
          <div className="stat-icon">
            <FaSearch size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{filteredCustomers.length}</h3>
            <p className="stat-label">Filtered Results</p>
          </div>
        </div>
        
        <div className="stat-card with-address">
          <div className="stat-icon">
            <FaMapMarkerAlt size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">
              {customers.filter(c => c.address).length}
            </h3>
            <p className="stat-label">With Address</p>
          </div>
        </div>
      </div>

      {/* Main content area with loading state or customer grid */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading customers...</p>
        </div>
      ) : (
        <div className="customers-grid">
          {filteredCustomers.length === 0 ? (
            <div className="empty-state">
              <FaUsers size={48} className="empty-icon" />
              <p className="empty-text">No customers found.</p>
            </div>
          ) : (
            filteredCustomers.map((customer) => (
              <div key={customer.user_id} className="customer-card">
                
                {/* Customer avatar section */}
                <div className="card-avatar">
                  <div className="avatar-circle">
                    <FaUser size={22} />
                  </div>
                </div>

                {/* Customer information display */}
                <div className="card-body">
                  <h3 className="customer-name">{customer.username}</h3>
                  <div className="role-badge">Customer</div>
                  
                  <div className="info-row">
                    <FaEnvelope className="info-icon" />
                    <span className="info-text">{customer.email}</span>
                  </div>
                  
                  <div className="info-row">
                    <FaMapMarkerAlt className="info-icon" />
                    <span className="info-text">
                      {customer.address || "No Address Provided"}
                    </span>
                  </div>
                </div>

                {/* View profile action button */}
                <div className="card-footer">
                  <button className="view-profile-btn">
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

export default Customers;