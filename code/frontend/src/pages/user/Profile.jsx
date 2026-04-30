// Profile.jsx
// This is the customer Profile page.
// It has 4 sections:
// 1. Personal Info — name, email, phone
// 2. Change Password — current + new password fields
// 3. Delivery Addresses — saved addresses list
// 4. Order Statistics — quick summary of customer's order history

import React, { useState, useEffect } from 'react';
import './Profile.css';

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────
// Used as fallback when Spring Boot backend is not running.
// Replace with real API calls later:
// GET  /api/customer/profile
// GET  /api/customer/addresses
// GET  /api/customer/stats

const sampleProfile = {
  firstName: 'Nimasha',
  lastName:  'Perera',
  email:     'nimasha@gmail.com',
  phone:     '077 123 4567',
  joinDate:  '2025-10-01',
};

const sampleAddresses = [
  {
    id: 1,
    label: 'Home',
    line1: '42 Galle Road',
    city:  'Colombo 03',
    province: 'Western Province',
    isDefault: true,
  },
  {
    id: 2,
    label: 'Office',
    line1: '10 Union Place',
    city:  'Colombo 02',
    province: 'Western Province',
    isDefault: false,
  },
];

const sampleStats = {
  totalOrders:    4,
  delivered:      1,
  inProgress:     3,
  totalSpent:     11840,
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Profile() {

  // ── State ─────────────────────────────────────────────────────────────────
  const [profile,       setProfile]       = useState(null);
  const [addresses,     setAddresses]     = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [activeTab,     setActiveTab]     = useState('info');  // which tab is open

  // Form fields for personal info section
  const [infoForm,      setInfoForm]      = useState({ firstName:'', lastName:'', email:'', phone:'' });
  const [infoSaved,     setInfoSaved]     = useState(false);   // shows "Saved!" message
  const [infoError,     setInfoError]     = useState('');      // shows error if fields empty

  // Form fields for change password section
  const [passForm,      setPassForm]      = useState({ current:'', newPass:'', confirm:'' });
  const [passSaved,     setPassSaved]     = useState(false);
  const [passError,     setPassError]     = useState('');

  // Controls the "Add new address" form visibility
  const [showAddrForm,  setShowAddrForm]  = useState(false);
  const [newAddr,       setNewAddr]       = useState({ label:'', line1:'', city:'', province:'' });
  const [addrError,     setAddrError]     = useState('');

  // ── Fetch profile data on page load ───────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('http://localhost:8080/api/customer/profile', {
          headers: { 'Content-Type': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setAddresses(data.addresses);
          setStats(data.stats);
          setInfoForm({
            firstName: data.profile.firstName,
            lastName:  data.profile.lastName,
            email:     data.profile.email,
            phone:     data.profile.phone,
          });
        } else {
          throw new Error('API not ready');
        }
      } catch {
        // Fall back to sample data if backend not running
        setProfile(sampleProfile);
        setAddresses(sampleAddresses);
        setStats(sampleStats);
        setInfoForm({
          firstName: sampleProfile.firstName,
          lastName:  sampleProfile.lastName,
          email:     sampleProfile.email,
          phone:     sampleProfile.phone,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // ── Save personal info ────────────────────────────────────────────────────
  async function handleSaveInfo() {
    // Basic validation — all fields must be filled
    if (!infoForm.firstName || !infoForm.lastName || !infoForm.email || !infoForm.phone) {
      setInfoError('Please fill in all fields.');
      return;
    }
    setInfoError('');
    try {
      await fetch('http://localhost:8080/api/customer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infoForm),
      });
    } catch {
      // Backend not ready — just show success for demo
    }
    // Update local profile state and show "Saved!" for 2 seconds
    setProfile((prev) => ({ ...prev, ...infoForm }));
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2000);
  }

  // ── Change password ───────────────────────────────────────────────────────
  async function handleChangePassword() {
    if (!passForm.current || !passForm.newPass || !passForm.confirm) {
      setPassError('Please fill in all fields.');
      return;
    }
    if (passForm.newPass !== passForm.confirm) {
      setPassError('New passwords do not match.');
      return;
    }
    if (passForm.newPass.length < 6) {
      setPassError('Password must be at least 6 characters.');
      return;
    }
    setPassError('');
    try {
      await fetch('http://localhost:8080/api/customer/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.newPass }),
      });
    } catch {
      // Backend not ready — show success for demo
    }
    setPassSaved(true);
    setPassForm({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPassSaved(false), 2000);
  }

  // ── Add new address ───────────────────────────────────────────────────────
  async function handleAddAddress() {
    if (!newAddr.label || !newAddr.line1 || !newAddr.city || !newAddr.province) {
      setAddrError('Please fill in all address fields.');
      return;
    }
    setAddrError('');
    const address = { ...newAddr, id: Date.now(), isDefault: addresses.length === 0 };
    try {
      await fetch('http://localhost:8080/api/customer/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
    } catch {
      // Backend not ready — add locally
    }
    setAddresses((prev) => [...prev, address]);
    setNewAddr({ label: '', line1: '', city: '', province: '' });
    setShowAddrForm(false);
  }

  // ── Remove address ────────────────────────────────────────────────────────
  function handleRemoveAddress(id) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  // ── Set default address ───────────────────────────────────────────────────
  function handleSetDefault(id) {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  }

  // ── Format join date ──────────────────────────────────────────────────────
  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long',
    });
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pf-loading">
        <div className="pf-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="pf-page">

      {/* ══ PROFILE HEADER ══ */}
      {/* Avatar circle with initials + name + member since */}
      <div className="pf-header">
        <div className="pf-avatar">
          {/* Shows first letter of first and last name */}
          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
        </div>
        <div className="pf-header-info">
          <h1 className="pf-name">{profile.firstName} {profile.lastName}</h1>
          <p className="pf-meta">{profile.email}</p>
          <p className="pf-meta">Member since {formatDate(profile.joinDate)}</p>
        </div>
      </div>

      {/* ══ ORDER STATS ROW ══ */}
      {/* 4 quick-stat boxes shown at the top */}
      <div className="pf-stats-row">
        <div className="pf-stat-box">
          <span className="pf-stat-num">{stats.totalOrders}</span>
          <span className="pf-stat-label">Total Orders</span>
        </div>
        <div className="pf-stat-box">
          <span className="pf-stat-num green">{stats.delivered}</span>
          <span className="pf-stat-label">Delivered</span>
        </div>
        <div className="pf-stat-box">
          <span className="pf-stat-num blue">{stats.inProgress}</span>
          <span className="pf-stat-label">In Progress</span>
        </div>
        <div className="pf-stat-box">
          <span className="pf-stat-num gold">Rs {stats.totalSpent.toLocaleString()}</span>
          <span className="pf-stat-label">Total Spent</span>
        </div>
      </div>

      {/* ══ TAB NAVIGATION ══ */}
      {/* Switches between the 3 main sections */}
      <div className="pf-tabs">
        {[
          { key: 'info',      label: '👤 Personal Info'    },
          { key: 'password',  label: '🔒 Password'         },
          { key: 'addresses', label: '📍 Addresses'        },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`pf-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══ TAB CONTENT ══ */}
      <div className="pf-tab-content">

        {/* ── TAB 1: Personal Info ── */}
        {activeTab === 'info' && (
          <div className="pf-card">
            <h3 className="pf-card-title">Personal Information</h3>
            <p className="pf-card-desc">Update your name, email and phone number.</p>

            {/* Two column: first name + last name */}
            <div className="pf-form-row">
              <div className="pf-form-group">
                <label className="pf-label">First Name</label>
                <input
                  className="pf-input"
                  type="text"
                  value={infoForm.firstName}
                  onChange={(e) => setInfoForm({ ...infoForm, firstName: e.target.value })}
                  placeholder="First name"
                />
              </div>
              <div className="pf-form-group">
                <label className="pf-label">Last Name</label>
                <input
                  className="pf-input"
                  type="text"
                  value={infoForm.lastName}
                  onChange={(e) => setInfoForm({ ...infoForm, lastName: e.target.value })}
                  placeholder="Last name"
                />
              </div>
            </div>

            {/* Email */}
            <div className="pf-form-group">
              <label className="pf-label">Email Address</label>
              <input
                className="pf-input"
                type="email"
                value={infoForm.email}
                onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>

            {/* Phone */}
            <div className="pf-form-group">
              <label className="pf-label">Phone Number</label>
              <input
                className="pf-input"
                type="tel"
                value={infoForm.phone}
                onChange={(e) => setInfoForm({ ...infoForm, phone: e.target.value })}
                placeholder="077 000 0000"
              />
            </div>

            {/* Error message */}
            {infoError && <p className="pf-error">{infoError}</p>}

            {/* Save button */}
            <button
              className={`pf-btn-primary ${infoSaved ? 'saved' : ''}`}
              onClick={handleSaveInfo}
            >
              {infoSaved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ── TAB 2: Change Password ── */}
        {activeTab === 'password' && (
          <div className="pf-card">
            <h3 className="pf-card-title">Change Password</h3>
            <p className="pf-card-desc">Choose a strong password with at least 6 characters.</p>

            <div className="pf-form-group">
              <label className="pf-label">Current Password</label>
              <input
                className="pf-input"
                type="password"
                value={passForm.current}
                onChange={(e) => setPassForm({ ...passForm, current: e.target.value })}
                placeholder="Enter current password"
              />
            </div>

            <div className="pf-form-group">
              <label className="pf-label">New Password</label>
              <input
                className="pf-input"
                type="password"
                value={passForm.newPass}
                onChange={(e) => setPassForm({ ...passForm, newPass: e.target.value })}
                placeholder="Enter new password"
              />
            </div>

            <div className="pf-form-group">
              <label className="pf-label">Confirm New Password</label>
              <input
                className="pf-input"
                type="password"
                value={passForm.confirm}
                onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>

            {/* Error message */}
            {passError && <p className="pf-error">{passError}</p>}

            {/* Save button */}
            <button
              className={`pf-btn-primary ${passSaved ? 'saved' : ''}`}
              onClick={handleChangePassword}
            >
              {passSaved ? '✓ Password Updated!' : 'Update Password'}
            </button>
          </div>
        )}

        {/* ── TAB 3: Delivery Addresses ── */}
        {activeTab === 'addresses' && (
          <div>
            {/* Saved address cards */}
            <div className="pf-addresses-list">
              {addresses.map((addr) => (
                <div key={addr.id} className={`pf-addr-card ${addr.isDefault ? 'default' : ''}`}>
                  <div className="pf-addr-top">
                    <div className="pf-addr-label-row">
                      <span className="pf-addr-label">{addr.label}</span>
                      {/* Green "Default" badge for the default address */}
                      {addr.isDefault && (
                        <span className="pf-addr-default-badge">Default</span>
                      )}
                    </div>
                    <div className="pf-addr-actions">
                      {/* Only show "Set Default" if not already default */}
                      {!addr.isDefault && (
                        <button
                          className="pf-addr-btn"
                          onClick={() => handleSetDefault(addr.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        className="pf-addr-btn danger"
                        onClick={() => handleRemoveAddress(addr.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="pf-addr-text">{addr.line1}, {addr.city}</p>
                  <p className="pf-addr-text muted">{addr.province}</p>
                </div>
              ))}
            </div>

            {/* Add New Address button / form */}
            {!showAddrForm ? (
              <button
                className="pf-add-addr-btn"
                onClick={() => setShowAddrForm(true)}
              >
                + Add New Address
              </button>
            ) : (
              <div className="pf-card">
                <h3 className="pf-card-title">New Address</h3>

                <div className="pf-form-row">
                  <div className="pf-form-group">
                    <label className="pf-label">Label (e.g. Home, Office)</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={newAddr.label}
                      onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })}
                      placeholder="Home"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-label">Street / Line 1</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={newAddr.line1}
                      onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })}
                      placeholder="42 Galle Road"
                    />
                  </div>
                </div>

                <div className="pf-form-row">
                  <div className="pf-form-group">
                    <label className="pf-label">City</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                      placeholder="Colombo 03"
                    />
                  </div>
                  <div className="pf-form-group">
                    <label className="pf-label">Province</label>
                    <input
                      className="pf-input"
                      type="text"
                      value={newAddr.province}
                      onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })}
                      placeholder="Western Province"
                    />
                  </div>
                </div>

                {addrError && <p className="pf-error">{addrError}</p>}

                <div className="pf-form-row">
                  <button className="pf-btn-primary" onClick={handleAddAddress}>
                    Save Address
                  </button>
                  <button
                    className="pf-btn-outline"
                    onClick={() => { setShowAddrForm(false); setAddrError(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>{/* end pf-tab-content */}
    </div>
  );
}
