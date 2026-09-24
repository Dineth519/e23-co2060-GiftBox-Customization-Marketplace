import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiCall } from '../../utils/api';
import './Profile.css';

export default function AssemblerProfile({ isOpen, onClose }) {
  const dialogRef = useRef(null);
  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current.showModal();
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [isOpen]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setLoading(true);
    setError('');
    async function load() {
      try {
        const response = await apiCall('/api/auth/me');
        if (!response.ok) throw new Error('Unable to load your profile. Please try again.');
        const data = await response.json();
        if (active) setProfile(data);
      } catch (failure) {
        if (active) setError(failure.message || 'Unable to load your profile.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, [isOpen, attempt]);

  if (!isOpen) return null;

  const name = profile?.name?.trim() || profile?.username || 'Assembler';
  return createPortal(
    <dialog ref={dialogRef} className="asm-account asm-profile-modal" aria-labelledby="asm-account-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
        <button type="button" className="asm-profile-close" onClick={onClose} aria-label="Close profile" autoFocus>✕</button>
        <h1 id="asm-account-title" style={{ fontSize: '24px', margin: '0 0 4px' }}>My profile</h1>
        <p className="asm-account-intro" style={{ marginBottom: '24px' }}>Your Giftora assembly team account.</p>
        
        {loading ? <p role="status">Loading your profile…</p> : error ?
          <div role="alert"><p>{error}</p><button className="asm-account-retry" onClick={() => setAttempt(value => value + 1)}>Retry</button></div> :
          profile && <div className="asm-account-card" style={{ border: 'none', padding: 0 }}>
            <header className="asm-account-heading">
              <span className="asm-account-avatar" aria-hidden="true">{Array.from(name)[0].toUpperCase()}</span>
              <div><h2>{name}</h2><p>Assembler</p></div>
            </header>
            <dl>
              <div><dt>Name</dt><dd>{profile.name?.trim() || 'Not provided'}</dd></div>
              <div><dt>Username</dt><dd>{profile.username || 'Not provided'}</dd></div>
              <div><dt>Email address</dt><dd>{profile.email || 'Not provided'}</dd></div>
              <div><dt>Account verification</dt><dd>{profile.verified ? 'Verified' : 'Not verified'}</dd></div>
            </dl>
          </div>}
    </dialog>, document.body
  );
}
