import React from 'react';
import { Link } from 'react-router-dom';
import { List, TriangleAlert, CircleCheck, BookOpen } from 'lucide-react';
import './Placeholder.css';

const sections = {
    queue: { title: 'Order Queue', icon: List, description: 'Receive items and organize gift boxes waiting for assembly.', detail: 'Order search, status filters, and receipt confirmation will be available here.' },
    issues: { title: 'Issues', icon: TriangleAlert, description: 'Keep track of items that need attention before packing.', detail: 'Missing items, damaged products, and issue updates will be available here.' },
    completed: { title: 'Completed', icon: CircleCheck, description: 'Review gift boxes that have finished the assembly process.', detail: 'Completed orders, preparation dates, and order details will be available here.' },
    'packing-guide': { title: 'Packing Guide', icon: BookOpen, description: 'Prepare every gift box with consistent care and presentation.', detail: 'Packing instructions, fragile-item guidance, and quality checklists will be available here.' },
};

export default function AssemblerPlaceholder({ section }) {
    const { title, icon: Icon, description, detail } = sections[section];
    return (
        <section className="asm-placeholder-page" aria-labelledby="asm-page-title">
            <nav className="asm-breadcrumb" aria-label="Breadcrumb"><Link to="/assembler">Overview</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
            <h1 id="asm-page-title">{title}</h1>
            <p className="asm-page-description">{description}</p>
            <div className="asm-placeholder-card">
                <span className="asm-placeholder-icon"><Icon size={32} aria-hidden="true" /></span>
                <span className="asm-placeholder-badge">Coming soon</span>
                <h2>Your {title.toLowerCase()} workspace</h2>
                <p>{detail}</p>
                <Link className="asm-placeholder-back" to="/assembler">Back to overview</Link>
            </div>
        </section>
    );
}
