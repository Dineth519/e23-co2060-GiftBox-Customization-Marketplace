import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Gift, House, List, TriangleAlert, CircleCheck, BookOpen, LogOut } from 'lucide-react';
import './AssemblerSidebar.css';

const links = [
    ['/assembler', 'Overview', House],
    ['/assembler/queue', 'Order Queue', List],
    ['/assembler/issues', 'Issues', TriangleAlert],
    ['/assembler/completed', 'Completed', CircleCheck],
    ['/assembler/packing-guide', 'Packing Guide', BookOpen],
];

export default function AssemblerSidebar() {
    const navigate = useNavigate();
    const username = localStorage.getItem('username')?.trim() || 'Assembler';
    const handleLogout = () => {
        if (!window.confirm('Are you sure you want to log out?')) return;
        if (!window.dispatchEvent(new Event('assembly:logout', { cancelable: true }))) return;
        ['accessToken', 'refreshToken', 'role', 'userRole', 'userId', 'username'].forEach(key => localStorage.removeItem(key));
        navigate('/login', { replace: true });
    };
    return (
        <aside className="assembler-sidebar" aria-label="Assembler sidebar">
            <div className="asm-brand">
                <Gift size={34} strokeWidth={1.5} aria-hidden="true" />
                <div><span className="asm-brand-name">Giftora</span><span className="asm-brand-subtitle">Assembly team</span></div>
            </div>
            <nav className="asm-navigation" aria-label="Assembler navigation">
                {links.map(([to, label, Icon]) => (
                    <NavLink key={to} to={to} end={to === '/assembler'} className={({ isActive }) => 'asm-nav-link' + (isActive ? ' is-active' : '')}>
                        <Icon size={21} aria-hidden="true" /><span>{label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="asm-sidebar-footer">
                <div className="asm-profile">
                    <span className="asm-avatar" aria-hidden="true">{Array.from(username)[0].toUpperCase()}</span>
                    <div className="asm-profile-details"><span className="asm-profile-name" title={username}>{username}</span><span className="asm-profile-role">Assembler</span></div>
                </div>
                <button type="button" className="asm-logout" onClick={handleLogout}><LogOut size={20} aria-hidden="true" /><span>Logout</span></button>
            </div>
        </aside>
    );
}
