// Profile.jsx
// Renders inside CustomerLayout via <Outlet />.
// No full-page reload — React Router handles navigation.

import React, { useState, useEffect } from 'react';
import './Profile.css';

// ─── SAMPLE DATA (replace with real API calls) ────────────────────────────────
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
  totalOrders: 4,
  delivered:   1,
  inProgress:  3,
  totalSpent:  11840,
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Profile() {

  const [profile,      setProfile]      = useState(null);
  const [addresses,    setAddresses]    = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeTab,    setActiveTab]    = useState('info');

  const [infoForm,     setInfoForm]     = useState({ firstName:'', lastName:'', email:'', phone:'' });
  const [infoSaved,    setInfoSaved]    = useState(false);
  const [infoError,    setInfoError]    = useState('');

  const [passForm,     setPassForm]     = useState({ current:'', newPass:'', confirm:'' });
  const [passSaved,    setPassSaved]    = useState(false);
  const [passError,    setPassError]    = useState('');

  const [showAddrForm, setShowAddrForm] = useState(false);
  const [newAddr,      setNewAddr]      = useState({ label:'', line1:'', city:'', province:'' });
  const [addrError,    setAddrError]    = useState('');

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/customer/profile`, {
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
        } else throw new Error();
      } catch {
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

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleSaveInfo() {
    if (!infoForm.firstName || !infoForm.lastName || !infoForm.email || !infoForm.phone) {
      setInfoError('Please fill in all fields.');
      return;
    }
    setInfoError('');
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/customer/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(infoForm),
      });
    } catch { /* backend not ready */ }
    setProfile((prev) => ({ ...prev, ...infoForm }));
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 2000);
  }

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
      await fetch(`${process.env.REACT_APP_API_URL}/api/customer/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passForm.current, newPassword: passForm.newPass }),
      });
    } catch { /* backend not ready */ }
    setPassSaved(true);
    setPassForm({ current: '', newPass: '', confirm: '' });
    setTimeout(() => setPassSaved(false), 2000);
  }

  async function handleAddAddress() {
    if (!newAddr.label || !newAddr.line1 || !newAddr.city || !newAddr.province) {
      setAddrError('Please fill in all address fields.');
      return;
    }
    setAddrError('');
    const address = { ...newAddr, id: Date.now(), isDefault: addresses.length === 0 };
    try {
      await fetch(`${process.env.REACT_APP_API_URL}/api/customer/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });
    } catch { /* backend not ready */ }
    setAddresses((prev) => [...prev, address]);
    setNewAddr({ label:'', line1:'', city:'', province:'' });
    setShowAddrForm(false);
  }

  function handleRemoveAddress(id) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }

  function handleSetDefault(id) {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="pf-loading">
        <div className="pf-spinner" />
        <p>Loading your profile...</p>
      </div>
    );
  }

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="pf-page">

      {/* ── HERO HEADER ── */}
      <div className="pf-hero">
        <div className="pf-hero-bg" />
        <div className="pf-hero-inner">
          <div className="pf-avatar">
            {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
          </div>
          <div className="pf-hero-info">
            <h1 className="pf-name">{profile.firstName} {profile.lastName}</h1>
            <p className="pf-meta">{profile.email}</p>
            <p className="pf-meta">Member since {formatDate(profile.joinDate)}</p>
            <span className="pf-badge">Premium Member</span>
          </div>
        </div>
      </div>

      {/* ── STATS ROW ── */}
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

      {/* ── TABS ── */}
      <div className="pf-tabs">
        {[
          { key: 'info',      label: 'Personal Info',     icon: '👤' },
          { key: 'password',  label: 'Password',          icon: '🔒' },
          { key: 'addresses', label: 'Addresses',         icon: '📍' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`pf-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <span className="pf-tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="pf-tab-content">

        {/* ─ Personal Info ─ */}
        {activeTab === 'info' && (
          <div className="pf-card">
            <div className="pf-card-header">
              <h3 className="pf-card-title">Personal Information</h3>
              <p className="pf-card-desc">Update your name, email and phone number.</p>
            </div>

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

            {infoError && <p className="pf-error">{infoError}</p>}

            <button
              className={`pf-btn-primary ${infoSaved ? 'saved' : ''}`}
              onClick={handleSaveInfo}
            >
              {infoSaved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* ─ Change Password ─ */}
        {activeTab === 'password' && (
          <div className="pf-card">
            <div className="pf-card-header">
              <h3 className="pf-card-title">Change Password</h3>
              <p className="pf-card-desc">Choose a strong password with at least 6 characters.</p>
            </div>

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

            {passError && <p className="pf-error">{passError}</p>}

            <button
              className={`pf-btn-primary ${passSaved ? 'saved' : ''}`}
              onClick={handleChangePassword}
            >
              {passSaved ? '✓ Password Updated!' : 'Update Password'}
            </button>
          </div>
        )}

        {/* ─ Delivery Addresses ─ */}
        {activeTab === 'addresses' && (
          <div>
            <div className="pf-addresses-list">
              {addresses.map((addr) => (
                <div key={addr.id} className={`pf-addr-card ${addr.isDefault ? 'default' : ''}`}>
                  <div className="pf-addr-top">
                    <div className="pf-addr-label-row">
                      <span className="pf-addr-label">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="pf-addr-default-badge">Default</span>
                      )}
                    </div>
                    <div className="pf-addr-actions">
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

            {!showAddrForm ? (
              <button className="pf-add-addr-btn" onClick={() => setShowAddrForm(true)}>
                + Add New Address
              </button>
            ) : (
              <div className="pf-card">
                <div className="pf-card-header">
                  <h3 className="pf-card-title">New Address</h3>
                </div>

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

                <div className="pf-form-row" style={{ marginTop: '8px' }}>
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

      </div>
    </div>
  );
}