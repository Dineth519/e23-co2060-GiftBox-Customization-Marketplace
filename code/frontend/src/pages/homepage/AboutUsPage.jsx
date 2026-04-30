import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/homepage/Header';
import Footer from '../../components/homepage/Footer';
import './AboutUsPage.css';

// Story timeline replacing the "How it Works" steps
const STORY_STEPS = [
  {
    num: '01',
    icon: '💡',
    title: 'The Vision',
    desc: 'Giftora was born from a simple idea: gifting should be personal, seamless, and memorable. We envisioned a multi-vendor platform where anyone could curate the perfect gift box for their loved ones.',
    features: ['Multi-vendor marketplace', 'Personalized customization', 'User-centric design'],
    color: 'gold',
  },
  {
    num: '02',
    icon: '⚙️',
    title: 'The Architecture',
    desc: 'To build a robust platform, we relied on a modern tech stack. We chose React for a dynamic frontend and Spring Boot with MySQL/MariaDB for a powerful backend, ensuring a smooth experience without unnecessary overhead.',
    features: ['React frontend', 'Spring Boot backend', 'Optimized database routing'],
    color: 'cyan',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'The Execution',
    desc: 'Through dedicated sprint planning, regular Scrum meetings, and collaborative coding, Giftora evolved from wireframes and ER diagrams into a fully functional, premium marketplace ready to serve Sri Lanka.',
    features: ['Agile development', 'Continuous integration', 'Thorough testing'],
    color: 'gold',
  }
];

// Team grid replacing the "Perks" grid
const TEAM_NEXUS = [
  { icon: '👨‍💻', title: 'Dineth Sanjuna', desc: 'Full-Stack Developer & Co-creator (E/23/351)' },
  { icon: '👩‍💻', title: 'A.P.S. Vidanya (Seni)', desc: 'Developer & Co-creator (E/23/412)' },
  { icon: '🧑‍💻', title: 'Jarshigan', desc: 'Developer & Technical Specialist' },
  { icon: '👨‍💻', title: 'Karunarathna', desc: 'Developer & Systems Analyst' },
  { icon: '🧑‍💻', title: 'Vishwaka', desc: 'Developer & UI/UX Contributor' },
  { icon: '🎓', title: 'Team Nexus', desc: 'University of Peradeniya Engineering Undergraduates' },
];

// Core values replacing the FAQ
const CORE_VALUES = [
  {
    q: 'Why focus on a multi-vendor model?',
    a: 'We believe in giving users the widest variety of high-quality items. By allowing multiple vendors to list their premium products, Giftora becomes a one-stop hub for everything from chocolates to watches.',
  },
  {
    q: 'What is our commitment to quality?',
    a: 'Whether it is the code we write or the vendors we approve, quality is at the forefront. We ensure a secure, fast, and beautifully designed interface that reflects the premium nature of the gifts being sent.',
  },
  {
    q: 'How do we handle customization?',
    a: 'Customization is the heart of Giftora. We built our platform specifically to let users mix and match items freely, add personal notes, and select premium packaging options before checking out.',
  },
];

const AboutUsPage = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [visibleSteps, setVisibleSteps] = useState([]);

  // Trigger hero animation on mount
  useEffect(() => {
    const t = setTimeout(() => {
      if (heroRef.current) heroRef.current.classList.add('about-hero--visible');
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // Intersection observer for scroll animations on the timeline
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
      <Header />

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-hero__orb about-hero__orb--1" />
        <div className="about-hero__orb about-hero__orb--2" />
        <div className="about-hero__orb about-hero__orb--3" />
        <div className="about-hero__grid" />

        <div className="about-hero__inner" ref={heroRef}>
          <div className="about-hero__label">Our Story</div>
          <h1 className="about-hero__title">
            Meet the Minds<br />
            Behind <span className="about-hero__title-accent">Giftora</span>
          </h1>
          <p className="about-hero__sub">
            We are Team Nexus. A group of passionate engineering undergraduates dedicated to revolutionizing the art of gifting through technology.
          </p>
        </div>

        {/* Floating pill strip showcasing project highlights */}
        <div className="about-hero__pills">
          {['Team Nexus', 'Built in Sri Lanka', 'Multi-Vendor Platform', 'React & Spring Boot', 'Premium Gifting'].map((p) => (
            <span key={p} className="about-hero-pill">{p}</span>
          ))}
        </div>
      </section>

      {/* ── OUR JOURNEY (Timeline) ── */}
      <section className="about-steps-section">
        <div className="about-section-header">
          <div className="about-section-label">The Journey</div>
          <h2 className="about-section-title">Building Giftora</h2>
          <p className="about-section-sub">From a university project concept to a fully realized custom gift marketplace.</p>
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

      {/* ── MEET THE TEAM (Grid) ── */}
      <section className="about-perks-section">
        <div className="about-section-header">
          <div className="about-section-label">The Creators</div>
          <h2 className="about-section-title">Meet Team Nexus</h2>
        </div>
        <div className="about-perks-grid">
          {TEAM_NEXUS.map((member, i) => (
            <div key={i} className="about-perk-card" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="about-perk-icon">{member.icon}</div>
              <h4 className="about-perk-title">{member.title}</h4>
              <p className="about-perk-desc">{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CORE VALUES (FAQ Style) ── */}
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

      <Footer />
    </div>
  );
};

export default AboutUsPage;