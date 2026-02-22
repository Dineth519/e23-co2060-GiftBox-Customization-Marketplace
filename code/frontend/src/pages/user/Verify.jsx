import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Verify = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();
      if (data.success) {
        alert(data.message);
        navigate('/login'); // Verify වුණාට පස්සේ Login එකට යනවා
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  };

  return (
    <div className="verify-container" style={{ padding: '50px', textAlign: 'center' }}>
      <h2>Verify Your Email</h2>
      <p>Enter the 6-digit code sent to your email.</p>
      <form onSubmit={handleVerify}>
        <input 
          type="email" 
          placeholder="Enter your email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ display: 'block', margin: '10px auto', padding: '10px' }}
        />
        <input 
          type="text" 
          placeholder="6-digit code" 
          value={code} 
          onChange={(e) => setCode(e.target.value)} 
          required 
          style={{ display: 'block', margin: '10px auto', padding: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', cursor: 'pointer' }}>Verify Account</button>
      </form>
    </div>
  );
};

export default Verify;