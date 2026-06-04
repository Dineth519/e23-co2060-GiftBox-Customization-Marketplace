import React, { useState, useEffect } from 'react';
import './AddressForm.css';

// REUSABLE ADDRESS FORM COMPONENT
// Usage in Profile:  <AddressForm />
// Usage in Cart:     <AddressForm onAddressSaved={(addr) => setDeliveryAddress(addr)} compact />

const AddressForm = ({ onAddressSaved, compact = false }) => {
  const username = localStorage.getItem('username');

  const [formData, setFormData] = useState({
    addressLine1: '',
    addressLine2: '',
    city: '',
    district: '',
    province: '',
    postalCode: '',
    phoneNumber: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');

  // ── Load existing address on mount ───────────────────────────────────────
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${username}/address`);
        const data = await res.json();
        if (data.success && data.address) {
          setFormData({
            addressLine1: data.address.addressLine1 || '',
            addressLine2: data.address.addressLine2 || '',
            city: data.address.city || '',
            district: data.address.district || '',
            province: data.address.province || '',
            postalCode: data.address.postalCode || '',
            phoneNumber: data.address.phoneNumber || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch address:', err);
      } finally {
        setFetching(false);
      }
    };

    
    setFetching(false);
  }, [username]);

  // ── Handle input change ──────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const newErrors = {};
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address line 1 is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.province.trim()) newErrors.province = 'Province is required';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
    if (!/^\d{5}$/.test(formData.postalCode)) newErrors.postalCode = 'Postal code must be 5 digits';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!/^(?:\+94|0)[0-9]{9}$/.test(formData.phoneNumber.replace(/\s/g, '')))
      newErrors.phoneNumber = 'Enter a valid Sri Lankan phone number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${username}/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg('Address saved successfully!');
        if (onAddressSaved) onAddressSaved(formData); // notify parent (cart)
      } else {
        setErrors({ general: data.message || 'Failed to save address.' });
      }
    } catch (err) {
      setErrors({ general: 'Could not connect to server.' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="address-loading">Loading address...</p>;

  return (
    <div className={`address-form-container ${compact ? 'compact' : ''}`}>
      {!compact && <h2 className="address-title">My Address</h2>}
      {!compact && <p className="address-sub">This address will be used for deliveries</p>}

      <form onSubmit={handleSubmit} className="address-form">
        {errors.general && <p className="address-error address-general-error">{errors.general}</p>}
        {successMsg && <p className="address-success">{successMsg}</p>}

        {/* Address Line 1 */}
        <div className="address-field">
          <label>Address Line 1 *</label>
          <input
            name="addressLine1"
            value={formData.addressLine1}
            onChange={handleChange}
            placeholder="No. 12, Main Street"
            disabled={loading}
          />
          {errors.addressLine1 && <p className="address-error">{errors.addressLine1}</p>}
        </div>

        {/* Address Line 2 */}
        <div className="address-field">
          <label>Address Line 2 <span className="optional">(Optional)</span></label>
          <input
            name="addressLine2"
            value={formData.addressLine2}
            onChange={handleChange}
            placeholder="Apartment, suite, floor..."
            disabled={loading}
          />
        </div>

        {/* City + Postal Code - side by side */}
        <div className="address-row">
          <div className="address-field">
            <label>City *</label>
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="Colombo"
              disabled={loading}
            />
            {errors.city && <p className="address-error">{errors.city}</p>}
          </div>

          <div className="address-field">
            <label>Postal Code *</label>
            <input
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="10100"
              maxLength={5}
              disabled={loading}
            />
            {errors.postalCode && <p className="address-error">{errors.postalCode}</p>}
          </div>
        </div>

        {/* District + Province - side by side */}
        <div className="address-row">
          <div className="address-field">
            <label>District *</label>
            <select
              name="district"
              value={formData.district}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select District</option>
              {[
                'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo',
                'Galle','Gampaha','Hambantota','Jaffna','Kalutara',
                'Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar',
                'Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya',
                'Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya'
              ].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.district && <p className="address-error">{errors.district}</p>}
          </div>

          <div className="address-field">
            <label>Province *</label>
            <select
              name="province"
              value={formData.province}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select Province</option>
              {[
                'Central','Eastern','North Central','Northern',
                'North Western','Sabaragamuwa','Southern','Uva','Western'
              ].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {errors.province && <p className="address-error">{errors.province}</p>}
          </div>
        </div>

        {/* Phone Number */}
        <div className="address-field">
          <label>Phone Number *</label>
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="0771234567 or +94771234567"
            disabled={loading}
          />
          {errors.phoneNumber && <p className="address-error">{errors.phoneNumber}</p>}
        </div>

        {/* Submit */}
        <button type="submit" className="address-save-btn" disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Address'}
        </button>
      </form>
    </div>
  );
};

export default AddressForm;
