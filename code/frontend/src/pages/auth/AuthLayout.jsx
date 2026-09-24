import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gift, ShieldCheck } from 'lucide-react';
import photo from '../../assets/login/giftora-auth-editorial.png';
import vendorPhoto from '../../assets/login/vendor-auth-editorial.png';
import logoMarkImg from '../../assets/logo_mark.png';
import './AuthLayout.css';

export default function AuthLayout({ children, vendor = false }) {
  return <div className={`auth-layout ${vendor ? 'auth-layout--vendor' : ''}`}>
    <header className="auth-topline"><Link to="/" className="auth-wordmark"><img src={logoMarkImg} alt="Giftora Logo" className="logo-mark-img" /><span className="logo-text">Giftora</span></Link><Link to="/"><ArrowLeft size={15} /> Back</Link></header>
    <main className="auth-split">
      <aside className="auth-editorial">
        <img src={vendor ? vendorPhoto : photo} alt="Giftora Editorial" />
      </aside>
      <section className="auth-form-panel">{children}</section>
    </main>
  </div>;
}
