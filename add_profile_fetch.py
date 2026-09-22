import re

with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'r') as f:
    content = f.read()

# 1. Add State Variables
new_states = """  const [contactName, setContactName] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
"""
content = content.replace("  const [deliveryAddress, setDeliveryAddress] = useState('');", "  const [deliveryAddress, setDeliveryAddress] = useState('');\n" + new_states)

# 2. Add useEffect for fetching User profile
fetch_effect = """
  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/${userId}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.name) setContactName(data.name);
          const addrParts = [data.addressLine1, data.addressLine2].filter(p => p && p.trim() !== '');
          if (addrParts.length > 0) setDeliveryAddress(addrParts.join(', '));
          if (data.city) setCity(data.city);
          if (data.postalCode) setZipCode(data.postalCode);
          if (data.phoneNumber) setMobileNumber(data.phoneNumber);
        }
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUserData();
  }, []);
"""
content = content.replace("  useEffect(() => {", fetch_effect + "\n  useEffect(() => {", 1)

# 3. Update Step 5 JSX
old_step5 = """              <div className="bb-form-layout">
                <div className="bb-field">
                  <label>Delivery Destination Address *</label>
                  <input
                    type="text"
                    placeholder="Street, City, Zip / Postal Code"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div className="bb-field-row">
                  <div className="bb-field">
                    <label>Preferred Delivery Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>"""

new_step5 = """              <div className="bb-form-layout">
                <div className="bb-field-row">
                  <div className="bb-field">
                    <label>Contact Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                    />
                  </div>
                  <div className="bb-field">
                    <label>Mobile Number *</label>
                    <input
                      type="text"
                      placeholder="e.g. 077 123 4567"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bb-field">
                  <label>Delivery Destination Address *</label>
                  <input
                    type="text"
                    placeholder="Street, Building, Apartment"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                <div className="bb-field-row">
                  <div className="bb-field">
                    <label>Town / City *</label>
                    <input
                      type="text"
                      placeholder="e.g. Colombo 07"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div className="bb-field">
                    <label>Zip / Postal Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 00700"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>

                <div className="bb-field-row">
                  <div className="bb-field">
                    <label>Preferred Delivery Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>"""
              
content = content.replace(old_step5, new_step5)

with open('code/frontend/src/pages/customer/BoxBuilderPage.jsx', 'w') as f:
    f.write(content)

print("Done")
