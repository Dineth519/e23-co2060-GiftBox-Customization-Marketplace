import React from 'react';
import { FaUsers, FaBoxOpen, FaShoppingCart, FaDollarSign, FaTruck, FaStar } from 'react-icons/fa';
import './Dashboard.css';

/**
 * Dashboard Component
 * Displays admin dashboard with key metrics and activity overview
 * Shows statistics cards, recent orders, and top vendors
 */
const SellerDashboard = () => {
  
  // Static dashboard statistics data with icons and trends
  const statsData = [
    { icon: <FaUsers />, title: 'Total Customers', value: '2,847', change: '+12.5%', trend: 'up' },
    { icon: <FaBoxOpen />, title: 'Gift Boxes Created', value: '1,234', change: '+8.2%', trend: 'up' },
    { icon: <FaShoppingCart />, title: 'Orders Today', value: '89', change: '+23.1%', trend: 'up' },
    { icon: <FaDollarSign />, title: 'Revenue (LKR)', value: '485,600', change: '+15.3%', trend: 'up' },
  ];

  return (
    <div className="dashboard-container">
      
      {/* Welcome header section with greeting message */}
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">Welcome back, Mathew! 👋</h1>
          <p className="dashboard-subtitle">Here's what's happening with your gift marketplace today.</p>
        </div>
      </div>

      {/* Statistics grid displaying key metrics with icons and trend indicators */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div className="stat-card" key={index}>
            <div className="stat-icon-wrapper">
              <div className="stat-icon">{stat.icon}</div>
            </div>
            <div className="stat-details">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <span className={`stat-change ${stat.trend}`}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Activity section with recent orders and top vendors cards */}
      <div className="activity-section">
        {/* Recent orders card with list of current orders */}
        <div className="activity-card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {[1, 2, 3, 4].map((item) => (
              <div className="activity-item" key={item}>
                <div className="activity-icon">
                  <FaTruck />
                </div>
                <div className="activity-info">
                  <p className="activity-text">Order #GB{1000 + item} - Premium Gift Box</p>
                  <span className="activity-time">2 hours ago</span>
                </div>
                <span className="activity-badge">Processing</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top vendors card showing best performing vendors with ratings */}
        <div className="activity-card">
          <div className="card-header">
            <h2 className="card-title">Top Vendors</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="card-content">
            {['Sweet Delights', 'Flower Paradise', 'Choco Heaven', 'Gift Gallery'].map((vendor, idx) => (
              <div className="activity-item" key={idx}>
                <div className="vendor-avatar">{vendor.charAt(0)}</div>
                <div className="activity-info">
                  <p className="activity-text">{vendor}</p>
                  <span className="activity-time">{150 - idx * 10} products</span>
                </div>
                <div className="rating">
                  <FaStar className="star-icon" />
                  <span>4.{9 - idx}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SellerDashboard;