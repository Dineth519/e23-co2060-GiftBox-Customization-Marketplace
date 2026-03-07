// Core libraries and routing
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Layout components
import Header from '../../components/homepage/Header';
import Footer from '../../components/homepage/Footer';

// Stylesheet
import './HomePage.css';

// ─── Data ────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { icon: '📦', label: 'Build Your Box',  gradient: 'linear-gradient(135deg,#C9A961,#D4AF37)', route: '/build'                       },
  { icon: '🎀', label: 'Gift Bundles',    gradient: 'linear-gradient(135deg,#5DADE2,#2E86C1)', route: '/products'                    },
  { icon: '👔', label: 'For Him',         gradient: 'linear-gradient(135deg,#1A1A2E,#16213E)', route: '/products?category=Watches'   },
  { icon: '👑', label: 'For Her',         gradient: 'linear-gradient(135deg,#C9A961,#E8C97A)', route: '/products?category=Bangles'   },
  { icon: '🏢', label: 'Corporate',       gradient: 'linear-gradient(135deg,#16213E,#1A1A2E)', route: '/products?category=Wine'      },
  { icon: '🌸', label: 'Seasonal',        gradient: 'linear-gradient(135deg,#5DADE2,#C9A961)', route: '/products?category=Chocolates'},
];

const FEATURES = [
  { icon: '🎨', title: 'Fully Custom',   desc: 'Build your own box from scratch' },
  { icon: '🚀', title: 'Fast Delivery',  desc: 'Same day delivery available'     },
  { icon: '💝', title: 'Luxury Packing', desc: 'Premium gift wrapping included'  },
];

const PRODUCTS = [
  { id: 1, emoji: '🍫', tag: 'Best Seller', name: 'Premium Choco Box',    vendor: 'Choco Heaven',    price: 'LKR 2,400', rating: '4.9', reviews: 128 },
  { id: 2, emoji: '🌹', tag: 'New',         name: 'Romantic Rose Bundle', vendor: 'Flower Paradise', price: 'LKR 3,800', rating: '4.8', reviews: 94  },
  { id: 3, emoji: '🕯️', tag: 'Popular',     name: 'Luxury Spa Set',       vendor: 'Glow & Bloom',    price: 'LKR 5,200', rating: '4.9', reviews: 213 },
  { id: 4, emoji: '🎁', tag: 'Custom',      name: 'Build Your Own Box',   vendor: 'Giftora',         price: 'From LKR 1,500', rating: '5.0', reviews: 421 },
  { id: 5, emoji: '🍷', tag: 'Premium',     name: 'Wine & Cheese Board',  vendor: 'Cellar Select',   price: 'LKR 6,800', rating: '4.7', reviews: 67  },
  { id: 6, emoji: '🧴', tag: 'Trending',    name: 'Skincare Ritual Kit',  vendor: 'Pure & Glow',     price: 'LKR 4,400', rating: '4.8', reviews: 155 },
];

const STEPS = [
  { icon: '🛍️', title: 'Browse & Pick',  desc: 'Choose items from any of our trusted local vendors'    },
  { icon: '📦', title: 'We Pack It',      desc: 'We hand-assemble everything into a beautiful gift box' },
  { icon: '🎀', title: 'Add a Message',   desc: 'Personalise with a handwritten card or ribbon'         },
  { icon: '🚚', title: 'Fast Delivery',   desc: "Delivered to your loved one's door island-wide"        },
];

const TESTIMONIALS = [
  { name: 'Priya M.',       location: 'Colombo',   quote: 'Absolutely stunning gift box. My friend was in tears — the packaging alone felt like unwrapping a treasure.',    stars: 5, initial: 'P' },
  { name: 'Roshan S.',      location: 'Kandy',     quote: 'Ordered a corporate hamper for our team. Arrived on time, perfectly curated, and the branding touch was elite.', stars: 5, initial: 'R' },
  { name: 'Anika de Silva', location: 'Galle',     quote: 'Build-your-own feature is genius. I mixed chocolates, flowers, and spa items — came out like a luxury boutique box.',  stars: 5, initial: 'A' },
  { name: 'Dinesh K.',      location: 'Negombo',   quote: "Third time ordering — never disappointed. Giftora has ruined every other gift shop for me. The gold ribbon is *chef's kiss*.",  stars: 5, initial: 'D' },
];

const STATS = [
  { value: '2,800+', label: 'Happy Customers' },
  { value: '150+',   label: 'Local Vendors'   },
  { value: '10K+',   label: 'Gifts Delivered' },
];

// ─── Scroll-reveal hook ───────────────────────────────────────────────────────

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, visible];
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <section className="hero">
      {/* Ambient orbs */}
      <div className="hero-orb hero-orb--gold" />
      <div className="hero-orb hero-orb--blue" />
      <div className="hero-orb hero-orb--mid" />

      {/* Noise grain overlay */}
      <div className="hero-grain" />

      <div className={`hero__inner ${mounted ? 'hero--mounted' : ''}`}>
        {/* ── Left content ── */}
        <div className="hero__content">
          <div className="hero__eyebrow">
            <span className="eyebrow-dot" />
            <span>Sri Lanka's #1 Gift Marketplace</span>
          </div>

          <h1 className="hero__title">
            Curate the <br />
            <span className="hero__title-accent">Perfect Gift</span>
          </h1>

          <p className="hero__subtitle">
            Choose items from multiple vendors and we'll hand-pack them into one
            luxury gift box — delivered with love, island-wide.
          </p>

          <div className="hero__cta-group">
            <button className="btn-hero-primary" onClick={() => navigate('/build')}>
              <span className="btn-icon">🎁</span>
              <span>Start Customizing</span>
              <span className="btn-arrow">→</span>
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/products')}>
              Browse Gifts
            </button>
          </div>

          <div className="hero__stats">
            {STATS.map((s, i) => (
              <div className="hero__stat" key={i}>
                <div className="hero__stat-value">{s.value}</div>
                <div className="hero__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right cards ── */}
        <div className="hero__cards">
          {FEATURES.map((f, i) => (
            <button key={i} className="hero__feature-card" style={{ animationDelay: `${0.1 + i * 0.12}s` }}>
              <div className="hero__feature-icon">{f.icon}</div>
              <div className="hero__feature-body">
                <div className="hero__feature-title">{f.title}</div>
                <div className="hero__feature-desc">{f.desc}</div>
              </div>
              <span className="hero__feature-arrow">→</span>
            </button>
          ))}

          <div className="hero__vendor-card">
            <div className="vendor-card__glow" />
            <div className="hero__vendor-icon">🏪</div>
            <div className="hero__vendor-title">Are you a Vendor?</div>
            <div className="hero__vendor-desc">
              Join our marketplace and reach thousands of customers island-wide.
            </div>
            <button className="btn-vendor-join" onClick={() => navigate('/join-us')}>
              Join With Us →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// ─── Marquee trust bar ────────────────────────────────────────────────────────

const TrustBar = () => {
  const brands = ['✦ Choco Heaven', '✦ Flower Paradise', '✦ Glow & Bloom', '✦ Sweet Delights', '✦ Gift Gallery', '✦ Cellar Select', '✦ Pure & Glow', '✦ Blossom Co.'];
  return (
    <div className="trust-bar">
      <div className="trust-bar__label">Trusted Vendors</div>
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {[...brands, ...brands].map((b, i) => (
            <span key={i} className="marquee-item">{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Categories ───────────────────────────────────────────────────────────────

const CategoriesStrip = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal();
  return (
    <section className={`categories-strip section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="section-inner">
        <div className="categories-strip__header">
          <div className="section-label center">Explore</div>
          <h2 className="section-title center">Shop by Category</h2>
        </div>
      </div>
      <div className="categories-strip__grid">
        {CATEGORIES.map((cat, i) => (
          <button
            key={i}
            className="category-tile"
            style={{ '--cat-gradient': cat.gradient, animationDelay: `${i * 0.08}s` }}
            onClick={() => navigate(cat.route)} 
          >
            <div className="category-tile__orb" />
            <span className="category-tile__icon">{cat.icon}</span>
            <span className="category-tile__label">{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

// ─── Featured Products (masonry-style) ───────────────────────────────────────

// For codes, write comments in English.

// ... (Other imports and components like Header, HeroSection remain the same) ...

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal();
  const [hovered, setHovered] = useState(null);

  // 1. Create a state to hold the products from the database
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 2. Fetch data from Spring Boot API when the component mounts
useEffect(() => {
  fetch('http://localhost:8080/api/products')
    .then(response => {
      console.log('Status:', response.status);        // ← add
      console.log('OK:', response.ok);                // ← add
      return response.json();
    })
    .then(data => {
      console.log('Full data:', data); 
      console.log('First product:', data[0]);         // already there
      setDbProducts(data.slice(0, 6));
      setLoading(false);
    })
    .catch(error => {
      console.error('FETCH ERROR:', error.message);   // ← add .message
      setLoading(false);
    });
}, []);

  return (
    <section className={`featured section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="section-inner">
        <div className="featured__header">
          <div>
            <div className="section-label">Curated Picks</div>
            <h2 className="section-title left">🔥 Featured Gifts</h2>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/products')}>
            View All Collection →
          </button>
        </div>

        {/* Show a loading message while fetching data */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--gold)' }}>
            Loading premium gifts...
          </div>
        ) : (
          <div className="featured__grid">
            {/* 3. Map over the dbProducts instead of the mock PRODUCTS array */}
            {dbProducts.map((p, i) => (
              <div
                key={p.id}
                className={`product-card ${i === 0 || i === 5 ? 'product-card--tall' : ''}`}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ animationDelay: `${i * 0.09}s` }}
              >
                <div className="product-card__image">
                  {/* Replace the emoji with the actual image from Cloudinary */}
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <div className="product-card__hover-actions">
                    <button className="product-action-btn">🛒 Add to Cart</button>
                    <button className="product-action-btn product-action-btn--outline">Quick View</button>
                  </div>
                </div>
                <div className="product-card__body">
                  <span className="product-card__tag">Premium</span>
                  <div className="product-card__name">{p.name}</div>
                  {/* Hardcoded vendor for now, as it's not in the DB yet */}
                  <div className="product-card__vendor">by Giftora Exclusive</div>
                  <div className="product-card__meta">
                    <span className="product-card__stars">
                      ★★★★★
                      <span className="product-card__rating-text">5.0 (New)</span>
                    </span>
                  </div>
                  <div className="product-card__footer">
                    <span className="product-card__price">LKR {p.price.toLocaleString()}</span>
                    <button className="btn-add-cart" title="Add to cart">+</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ... (Rest of the file like HowItWorks, Footer remains the same) ...

// ─── How It Works ─────────────────────────────────────────────────────────────

const HowItWorks = () => {
  const [ref, visible] = useReveal();
  return (
    <section className={`how-it-works section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="how-it-works__bg-accent" />
      <div className="section-inner">
        <div className="section-label center">Process</div>
        <h2 className="section-title center">How Giftora Works</h2>
        <p className="section-subtitle">From browsing to doorstep in four simple steps</p>

        <div className="how-it-works__steps">
          {STEPS.map((step, i) => (
            <React.Fragment key={i}>
              <div className="step-card" style={{ animationDelay: `${i * 0.13}s` }}>
                <div className="step-card__badge">{i + 1}</div>
                <div className="step-card__icon">{step.icon}</div>
                <div className="step-card__title">{step.title}</div>
                <p className="step-card__desc">{step.desc}</p>
              </div>
              {i < STEPS.length - 1 && <div className="step-connector" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Testimonials ─────────────────────────────────────────────────────────────

const Testimonials = () => {
  const [ref, visible] = useReveal();
  return (
    <section className={`testimonials section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="testimonials__bg" />
      <div className="section-inner">
        <div className="section-label center">Love Notes</div>
        <h2 className="section-title center">What Our Customers Say</h2>

        <div className="testimonials__grid">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="testimonial-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="testimonial-card__quote-icon">"</div>
              <p className="testimonial-card__text">{t.quote}</p>
              <div className="testimonial-card__stars">
                {'★'.repeat(t.stars)}
              </div>
              <div className="testimonial-card__author">
                <div className="testimonial-card__avatar">{t.initial}</div>
                <div>
                  <div className="testimonial-card__name">{t.name}</div>
                  <div className="testimonial-card__location">📍 {t.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─── Gift Builder CTA ─────────────────────────────────────────────────────────

const BuilderCTA = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal();
  return (
    <section className={`builder-cta section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="builder-cta__orb builder-cta__orb--1" />
      <div className="builder-cta__orb builder-cta__orb--2" />
      <div className="builder-cta__inner">
        <div className="builder-cta__emoji">🎁</div>
        <h2 className="builder-cta__title">Design Your Dream Gift Box</h2>
        <p className="builder-cta__desc">
          Mix items from different vendors, add a personal message, choose your ribbon color — then we'll turn it into something unforgettable.
        </p>
        <div className="builder-cta__steps">
          {['Pick Items', 'We Pack', 'They Smile'].map((s, i) => (
            <div key={i} className="builder-step">
              <span className="builder-step__n">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
        <button className="btn-hero-primary large" onClick={() => navigate('/build')}>
          <span className="btn-icon">✨</span>
          <span>Start Building Now</span>
          <span className="btn-arrow">→</span>
        </button>
      </div>p
    </section>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const HomePage = () => (
  <div className="home-page">
    <Header />
    <main>
      <HeroSection />
      <TrustBar />
      <CategoriesStrip />
      <FeaturedProducts />
      <HowItWorks />
      <Testimonials />
      <BuilderCTA />
    </main>
    <Footer />
  </div>
);

export default HomePage;