import React, { useEffect, useRef, useState } from 'react';
import './AboutUsPage.css';

// Story timeline
const STORY_STEPS = [
  {
    num: '01',
    icon: '💡',
    title: 'The Vision',
    desc: 'Giftora was born from a simple idea: gifting should be personal, seamless, and memorable. We envisioned a multi-vendor platform where anyone could curate the perfect gift box for their loved ones — from a single click.',
    features: ['Multi-vendor marketplace', 'Personalized customization', 'User-centric design'],
    color: 'gold',
  },
  {
    num: '02',
    icon: '⚙️',
    title: 'The Architecture',
    desc: 'We built on a modern tech stack — React for a dynamic, responsive frontend and Spring Boot with MySQL for a powerful, scalable backend. Deployed on Azure for enterprise-grade reliability and speed.',
    features: ['React & Spring Boot', 'Azure cloud hosting', 'Optimized database routing'],
    color: 'cyan',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'The Execution',
    desc: 'Through agile sprints, collaborative coding sessions, and continuous delivery, Giftora evolved from wireframes and ER diagrams into a fully functional premium marketplace — proudly built in Sri Lanka.',
    features: ['Agile development', 'Continuous integration', 'Thorough QA testing'],
    color: 'gold',
  },
];

// Team members
const TEAM_NEXUS = [
  { icon: '👨‍💻', title: 'Dineth Sanjuna', sub: 'E/23/351' },
  { icon: '👩‍💻', title: 'Seniduni Vidanya', sub: 'E/23/412' },
  { icon: '👩‍💻', title: 'Janadhi Pradhiba', sub: 'E/23/167' },
  { icon: '👨‍💻', title: 'Senath Viswaka', sub: 'E/23/416' },
];

// Core values
const CORE_VALUES = [
  {
    q: 'Why focus on a multi-vendor model?',
    a: 'We believe in giving users the widest variety of high-quality items. By allowing multiple vendors to list their premium products, Giftora becomes a one-stop hub for everything from artisan chocolates to luxury accessories.',
  },
  {
    q: 'What is our commitment to quality?',
    a: 'Quality is at the forefront of everything we do — from the code we write to the vendors we onboard. We ensure a secure, fast, and beautifully designed experience that reflects the premium nature of every gift.',
  },
  {
    q: 'How do we handle customization?',
    a: 'Customization is the heart of Giftora. Our platform lets users freely mix and match items, add personal notes, and select premium packaging options — making every box one-of-a-kind before checkout.',
  },
];

// Contact details
const CONTACT_INFO = [
  {
    icon: '📧',
    label: 'Email Us',
    value: 'giftora033@gmail.com',
    href: 'mailto:giftora033@gmail.com',
    desc: 'We typically respond within 24 hours.',
  },
  {
    icon: '📍',
    label: 'Based In',
    value: 'Peradeniya, Sri Lanka',
    href: null,
    desc: 'University of Peradeniya, Faculty of Engineering.',
  },
  {
    icon: '🕐',
    label: 'Support Hours',
    value: 'Mon – Fri, 9 AM – 6 PM',
    href: null,
    desc: 'Sri Lanka Standard Time (SLST, UTC+5:30).',
  },
  {
    icon: '🌐',
    label: 'Platform',
    value: 'giftora.lk',
    href: null,
    desc: 'Available online, 24/7 across Sri Lanka.',
  },
];

const AboutUsPage = () => {
  const heroRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [visibleSteps, setVisibleSteps] = useState([]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (heroRef.current) heroRef.current.classList.add('about-hero--visible');
    }, 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = parseInt(entry.target.dataset.idx);
            setVisibleSteps((prev) => [...new Set([...prev, idx])]);
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('.about-step').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero__orb about-hero__orb--1" />
        <div className="about-hero__orb about-hero__orb--2" />
        <div className="about-hero__orb about-hero__orb--3" />
        <div className="about-hero__grid" />

        <div className="about-hero__inner" ref={heroRef}>
          <div className="about-hero__label">Who We Are</div>
          <h1 className="about-hero__title">
            Crafting Moments,<br />
            Powered by <span className="about-hero__title-accent">Giftora</span>
          </h1>
          <p className="about-hero__sub">
            We are Team Nexus — a group of passionate engineering undergraduates from the University of Peradeniya, dedicated to transforming the way Sri Lanka gives gifts through technology and creativity.
          </p>
        </div>

        <div className="about-hero__pills">
          {['Team Nexus', 'Built in Sri Lanka 🇱🇰', 'Multi-Vendor Platform', 'Azure Powered', 'Premium Gifting Experience'].map((p) => (
            <span key={p} className="about-hero-pill">{p}</span>
          ))}
        </div>
      </section>

      {/* ── MISSION STRIP ── */}
      <section className="about-mission-strip">
        <div className="about-mission-strip__inner">
          <div className="about-mission-item">
            <span className="about-mission-num">5+</span>
            <span className="about-mission-label">Team Members</span>
          </div>
          <div className="about-mission-divider" />
          <div className="about-mission-item">
            <span className="about-mission-num">100%</span>
            <span className="about-mission-label">Customizable Gifts</span>
          </div>
          <div className="about-mission-divider" />
          <div className="about-mission-item">
            <span className="about-mission-num">24/7</span>
            <span className="about-mission-label">Platform Availability</span>
          </div>
          <div className="about-mission-divider" />
          <div className="about-mission-item">
            <span className="about-mission-num">🇱🇰</span>
            <span className="about-mission-label">Proudly Sri Lankan</span>
          </div>
        </div>
      </section>

      {/* ── OUR JOURNEY (Timeline) ── */}
      <section className="about-steps-section">
        <div className="about-section-header">
          <div className="about-section-label">The Journey</div>
          <h2 className="about-section-title">How Giftora Came to Life</h2>
          <p className="about-section-sub">From a university project concept to a fully realized, Azure-hosted custom gift marketplace.</p>
        </div>

        <div className="about-steps-track">
          <div className="about-steps-line" />
          {STORY_STEPS.map((step, i) => (
            <div
              key={i}
              className={`about-step about-step--${step.color} ${visibleSteps.includes(i) ? 'about-step--visible' : ''} ${i % 2 === 1 ? 'about-step--right' : ''}`}
              data-idx={i}
              style={{ animationDelay: `${i * 0.12}s` }}
            >
              <div className="about-step__node">
                <span>{step.num}</span>
              </div>
              <div className="about-step__card">
                <div className="about-step__icon">{step.icon}</div>
                <h3 className="about-step__title">{step.title}</h3>
                <p className="about-step__desc">{step.desc}</p>
                <ul className="about-step__features">
                  {step.features.map((f) => (
                    <li key={f}><span className="about-feat-dot" />  {f}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MEET THE TEAM ── */}
      <section className="about-perks-section">
        <div className="about-section-header">
          <div className="about-section-label">The Creators</div>
          <h2 className="about-section-title">Meet Team Nexus</h2>
          <p className="about-section-sub" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Five engineering undergraduates united by a passion for building things that matter.
          </p>
        </div>
        <div className="about-perks-grid about-perks-grid--4">
          {TEAM_NEXUS.map((member, i) => (
            <div key={i} className="about-perk-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="about-perk-icon">{member.icon}</div>
              <h4 className="about-perk-title">{member.title}</h4>
              <span className="about-perk-sub">{member.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section className="about-faq-section">
        <div className="about-faq-inner">
          <div className="about-section-header about-section-header--left">
            <div className="about-section-label">Our Philosophy</div>
            <h2 className="about-section-title">Core Values & Goals</h2>
          </div>
          <div className="about-faq-list">
            {CORE_VALUES.map((item, i) => (
              <div
                key={i}
                className={`about-faq-item ${openFaq === i ? 'about-faq-item--open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="about-faq-q">
                  <span>{item.q}</span>
                  <span className="about-faq-chevron">{openFaq === i ? '−' : '+'}</span>
                </div>
                <div className="about-faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section className="about-contact-section">
        <div className="about-contact-inner">
          <div className="about-section-header">
            <div className="about-section-label">Reach Out</div>
            <h2 className="about-section-title">Get In Touch</h2>
            <p className="about-section-sub">
              Have a question, a partnership idea, or just want to say hello? We would love to hear from you.
            </p>
          </div>

          <div className="about-contact-grid">
            {CONTACT_INFO.map((item, i) => (
              <div key={i} className="about-contact-card">
                <div className="about-contact-icon">{item.icon}</div>
                <div className="about-contact-label">{item.label}</div>
                {item.href ? (
                  <a href={item.href} className="about-contact-value about-contact-value--link">
                    {item.value}
                  </a>
                ) : (
                  <div className="about-contact-value">{item.value}</div>
                )}
                <p className="about-contact-desc">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="about-contact-cta">
            <a href="mailto:giftora033@gmail.com" className="about-hero__cta">
              ✉️ &nbsp; Send Us an Email
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUsPage;