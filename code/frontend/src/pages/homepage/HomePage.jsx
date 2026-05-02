// Core libraries and routing
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// Layout components
import Header from '../../components/homepage/Header';
import Footer from '../../components/homepage/Footer';

// Stylesheet
import './HomePage.css';

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: '🎨', title: 'Fully Custom',   desc: 'Build your own box from scratch' },
  { icon: '🚀', title: 'Fast Delivery',  desc: 'Same day delivery available'     },
  { icon: '💝', title: 'Luxury Packing', desc: 'Premium gift wrapping included'  },
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

// ─── NEW DATA ─────────────────────────────────────────────────────────────────

const PROMOTIONS = [
  {
    id: 1,
    badge: '🔥 Limited Time',
    headline: '20% OFF Sitewide',
    desc: 'This weekend only — use code GIFTLOVE at checkout',
    expiry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    cta: 'Shop Now',
    gradient: 'linear-gradient(135deg, #C9A961 0%, #D4AF37 100%)',
    accent: '#fff8e8',
    route: '/products',
  },
  {
    id: 2,
    badge: '🌸 Seasonal',
    headline: "Avurudu Gift Collection",
    desc: 'Celebrate the New Year with curated traditional hampers',
    expiry: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    cta: 'Explore',
    gradient: 'linear-gradient(135deg, #5DADE2 0%, #2E86C1 100%)',
    accent: '#e8f6ff',
    route: '/products?category=Chocolates',
  },
  {
    id: 3,
    badge: '✨ Just Arrived',
    headline: 'New Arrivals This Week',
    desc: 'Fresh picks from our local vendors — first to love them',
    expiry: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    cta: 'Discover',
    gradient: 'linear-gradient(135deg, #1A1A2E 0%, #C9A961 100%)',
    accent: '#f5f0e8',
    route: '/products',
  },
];

const SHOWCASE_BOXES = [
  {
    id: 1,
    name: 'Romantic Bliss Box',
    desc: 'A carefully curated collection of romance-sparking treasures — from velvety chocolates to delicate florals, wrapped in signature gold ribbon.',
    price: 'LKR 6,800',
    items: ['Artisan Chocolates', 'Red Roses', 'Scented Candle', 'Silk Ribbon', 'Love Note Card'],
    bg: 'linear-gradient(135deg, #1a0a0a 0%, #3d1515 40%, #1A1A2E 100%)',
    accent: '#C9A961',
    emoji: '🌹',
    tag: 'Best Seller',
  },
  {
    id: 2,
    name: 'Birthday Spectacular',
    desc: 'Every birthday deserves extraordinary. Packed with gourmet treats, personalised keepsakes, and a burst of colour that says: you matter.',
    price: 'LKR 4,500',
    items: ['Mini Cake', 'Party Crackers', 'Personalised Mug', 'Gummies', 'Balloon Kit'],
    bg: 'linear-gradient(135deg, #0a1a2e 0%, #16213E 50%, #0d2b1a 100%)',
    accent: '#5DADE2',
    emoji: '🎂',
    tag: 'Most Popular',
  },
  {
    id: 3,
    name: 'Corporate Prestige Hamper',
    desc: 'Make a powerful first impression. Thoughtfully assembled premium items that reflect your company\'s values and appreciation for people.',
    price: 'LKR 12,500',
    items: ['Premium Wine', 'Imported Cheese', 'Branded Notebook', 'Artisan Coffee', 'Gold Pen'],
    bg: 'linear-gradient(135deg, #0a0a1a 0%, #1A1A2E 60%, #0d1520 100%)',
    accent: '#D4AF37',
    emoji: '💼',
    tag: 'Corporate',
  },
  {
    id: 4,
    name: 'Self-Care Sanctuary',
    desc: 'Because she deserves a day just for herself. Luxurious bath, skin, and wellness essentials wrapped in our signature pastel palette.',
    price: 'LKR 7,200',
    items: ['Bath Bombs', 'Face Mask Set', 'Body Butter', 'Herbal Tea', 'Eye Pillow'],
    bg: 'linear-gradient(135deg, #1a0e1a 0%, #2d1a2d 50%, #1A1A2E 100%)',
    accent: '#E8C97A',
    emoji: '🧴',
    tag: 'For Her',
  },
  {
    id: 5,
    name: 'The Gourmet Journey',
    desc: 'A world tour of flavours — rare spices, handcrafted sweets, aged cheeses, and exotic teas curated for the passionate foodie.',
    price: 'LKR 9,400',
    items: ['Aged Cheddar', 'Turkish Delight', 'Saffron', 'Earl Grey Tea', 'Dark Chocolate'],
    bg: 'linear-gradient(135deg, #1a1000 0%, #2d2010 50%, #16213E 100%)',
    accent: '#C9A961',
    emoji: '🍽️',
    tag: 'Gourmet',
  },
];

const VALUE_STATS = [
  { num: 2800, suffix: '+', label: 'Happy Customers',  desc: 'Smiles delivered island-wide',       icon: '😊' },
  { num: 150,  suffix: '+', label: 'Local Vendors',    desc: 'Trusted Sri Lankan makers & brands', icon: '🏪' },
  { num: 10000,suffix: '+', label: 'Gifts Delivered',  desc: 'Memories created, one box at a time',icon: '📦' },
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

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCountUp(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function CountdownTimer({ expiry }) {
  const [timeLeft, setTimeLeft] = useState({});

  useEffect(() => {
    const calc = () => {
      const diff = expiry - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const iv = setInterval(calc, 1000);
    return () => clearInterval(iv);
  }, [expiry]);

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="promo-timer">
      <span className="timer-label">Ends in:</span>
      <div className="timer-blocks">
        {timeLeft.d > 0 && <><span className="timer-block">{pad(timeLeft.d)}<span>d</span></span><span className="timer-sep">:</span></>}
        <span className="timer-block">{pad(timeLeft.h)}<span>h</span></span>
        <span className="timer-sep">:</span>
        <span className="timer-block">{pad(timeLeft.m)}<span>m</span></span>
        <span className="timer-sep">:</span>
        <span className="timer-block">{pad(timeLeft.s)}<span>s</span></span>
      </div>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

const HeroSection = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const toggleMute = () => {
    setMuted(m => {
      if (videoRef.current) videoRef.current.muted = !m;
      return !m;
    });
  };

  return (
    <section className="hero">
      {/* Video background — falls back to orbs if error */}
      {!videoError && (
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          loop
          muted
          playsInline
          onError={() => setVideoError(true)}
          src="https://assets.mixkit.co/videos/preview/mixkit-hands-wrapping-a-gift-2553-large.mp4"
        />
      )}
      <div className="hero-video-overlay" />

      {/* Ambient orbs — always visible, more visible if no video */}
      <div className={`hero-orb hero-orb--gold ${videoError ? 'hero-orb--prominent' : ''}`} />
      <div className={`hero-orb hero-orb--blue ${videoError ? 'hero-orb--prominent' : ''}`} />
      <div className="hero-orb hero-orb--mid" />
      <div className="hero-grain" />

      {/* Mute toggle */}
      {!videoError && (
        <button className="hero-mute-btn" onClick={toggleMute} title={muted ? 'Unmute' : 'Mute'}>
          {muted ? '🔇' : '🔊'}
        </button>
      )}

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
            <button className="btn-hero-primary" onClick={() => navigate('/build-box')}>
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
            <button className="btn-vendor-join" onClick={() => navigate('/vendor-landing')}>
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

// ─── NEW: Promotions & Seasonal Specials Banner ───────────────────────────────

const PromoBanner = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [ref, visible] = useReveal(0.1);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    const iv = setInterval(() => {
      setActive(a => (a + 1) % PROMOTIONS.length);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  return (
    <section className={`promo-banner section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="promo-track-wrapper">
        <div className="promo-track" style={{ transform: `translateX(-${active * 100}%)` }}>
          {PROMOTIONS.map((p, i) => (
            <div key={p.id} className="promo-card" style={{ '--promo-gradient': p.gradient }}>
              <div className="promo-card__bg" />
              <div className="promo-card__content">
                <span className="promo-badge">{p.badge}</span>
                <h3 className="promo-headline">{p.headline}</h3>
                <p className="promo-desc">{p.desc}</p>
                <CountdownTimer expiry={p.expiry} />
                <button className="promo-cta" onClick={() => navigate(p.route)}>
                  {p.cta} →
                </button>
              </div>
              <div className="promo-card__deco">
                <div className="promo-deco-ring promo-deco-ring--1" />
                <div className="promo-deco-ring promo-deco-ring--2" />
                <div className="promo-deco-ring promo-deco-ring--3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation dots */}
      <div className="promo-dots">
        {PROMOTIONS.map((_, i) => (
          <button
            key={i}
            className={`promo-dot ${active === i ? 'active' : ''}`}
            onClick={() => setActive(i)}
          />
        ))}
      </div>
    </section>
  );
};

// ─── Featured Gift Boxes Showcase ────────────

const GiftBoxShowcase = () => {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [ref, visible] = useReveal(0.1);
  const timerRef = useRef(null);

  const goTo = useCallback((idx) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setActive(idx);
      setTransitioning(false);
    }, 300);
  }, [transitioning]);

  // Auto-advance every 5 seconds
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % SHOWCASE_BOXES.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetTimer = (idx) => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive(a => (a + 1) % SHOWCASE_BOXES.length);
    }, 5000);
    goTo(idx);
  };

  const box = SHOWCASE_BOXES[active];

  return (
    <section className={`showcase section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="section-inner">
        <div className="section-label">Featured Collections</div>
        <h2 className="section-title left">🎁 Gift Box Showcase</h2>
      </div>

      <div className={`showcase__stage ${transitioning ? 'showcase__stage--fade' : ''}`}
           style={{ background: box.bg }}>
        {/* Parallax deco */}
        <div className="showcase__parallax-orb" style={{ background: `radial-gradient(circle, ${box.accent}30, transparent 60%)` }} />

        {/* Content */}
        <div className="showcase__content">
          <div className="showcase__tag" style={{ color: box.accent, borderColor: `${box.accent}50`, background: `${box.accent}15` }}>
            {box.tag}
          </div>
          <div className="showcase__emoji">{box.emoji}</div>
          <h2 className="showcase__name">{box.name}</h2>
          <p className="showcase__desc">{box.desc}</p>

          <div className="showcase__items">
            {box.items.map((item, i) => (
              <span key={i} className="showcase__item-pill" style={{ borderColor: `${box.accent}40`, color: box.accent }}>
                {item}
              </span>
            ))}
          </div>

          <div className="showcase__price-row">
            <span className="showcase__price" style={{ color: box.accent }}>{box.price}</span>
            <div className="showcase__actions">
              <button className="showcase__btn-primary" style={{ background: `linear-gradient(135deg, ${box.accent}, #D4AF37)` }}
                      onClick={() => navigate('/products')}>
                View Box →
              </button>
              <button className="showcase__btn-secondary" style={{ borderColor: `${box.accent}60`, color: box.accent }}>
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="showcase__progress">
          <div className="showcase__progress-bar" key={active} style={{ '--bar-color': box.accent }} />
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="showcase__thumbs">
        {SHOWCASE_BOXES.map((b, i) => (
          <button
            key={b.id}
            className={`showcase__thumb ${active === i ? 'active' : ''}`}
            style={{ background: b.bg, '--thumb-accent': b.accent }}
            onClick={() => resetTimer(i)}
          >
            <span className="showcase__thumb-emoji">{b.emoji}</span>
            <span className="showcase__thumb-name">{b.name}</span>
            <span className="showcase__thumb-price">{b.price}</span>
          </button>
        ))}
      </div>
    </section>
  );
};

// ─── Featured Products (masonry-style) ───────────────────────────────────────

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal();
  const [hovered, setHovered] = useState(null);
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(response => response.json())
      .then(data => {
        setDbProducts(data.slice(0, 6));
        setLoading(false);
      })
      .catch(error => {
        console.error('FETCH ERROR:', error.message);
        setLoading(false);
      });
  }, []);

  return (
    <section className={`f ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="section-inner"eatured section-reveal>
        <div className="featured__header">
          <div>
            <div className="section-label">Curated Picks</div>
            <h2 className="section-title left">🔥 Featured Gifts</h2>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/products')}>
            View All Collection →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px', color: 'var(--gold)' }}>
            Loading premium gifts...
          </div>
        ) : (
          <div className="featured__grid">
            {dbProducts.map((p, i) => (
              <div
                key={p.id}
                className={`product-card ${i === 0 || i === 5 ? 'product-card--tall' : ''}`}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ animationDelay: `${i * 0.09}s` }}
              >
                <div className="product-card__image">
                  <img src={p.imageUrl} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="product-card__hover-actions">
                    <button className="product-action-btn">🛒 Add to Cart</button>
                    <button className="product-action-btn product-action-btn--outline">Quick View</button>
                  </div>
                </div>
                <div className="product-card__body">
                  <span className="product-card__tag">Premium</span>
                  <div className="product-card__name">{p.name}</div>
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

// ─── NEW: Trending Items Grid ─────────────────────────────────────────────────

const CATEGORY_MAP = {
  1: 'Wine', 2: 'Watches', 3: 'Perfume', 4: 'Teddy Bears', 5: 'Bangles', 6: 'Chocolates',
};

const TrendingGrid = () => {
  const navigate = useNavigate();
  const [ref, visible] = useReveal(0.1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlisted, setWishlisted] = useState({});
  const [quickView, setQuickView] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data.slice(0, 8));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleWishlist = (id) => {
    setWishlisted(w => ({ ...w, [id]: !w[id] }));
  };

  return (
    <section className={`trending section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="section-inner">
        <div className="trending__header">
          <div>
            <div className="section-label">Hot Right Now</div>
            <h2 className="section-title left">Trending This Week 🔥</h2>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/products')}>
            View All →
          </button>
        </div>

        {loading ? (
          <div className="trending-skeleton">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="trending-skeleton__card">
                <div className="trending-skeleton__img" />
                <div className="trending-skeleton__line trending-skeleton__line--short" />
                <div className="trending-skeleton__line" />
              </div>
            ))}
          </div>
        ) : (
          <div className="trending-grid">
            {products.map((p, i) => (
              <div
                key={p.id}
                className="t-card"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                {/* Wishlist heart */}
                <button
                  className={`t-card__heart ${wishlisted[p.id] ? 'active' : ''}`}
                  onClick={() => toggleWishlist(p.id)}
                >
                  {wishlisted[p.id] ? '❤️' : '🤍'}
                </button>

                {/* Image */}
                <div className="t-card__image">
                  <img src={p.imageUrl} alt={p.name} loading="lazy" />
                  {/* Quick View overlay */}
                  <div className="t-card__overlay" onClick={() => setQuickView(p)}>
                    <span className="t-card__qv-btn">Quick View</span>
                  </div>
                </div>

                {/* Body */}
                <div className="t-card__body">
                  <span className="t-card__category">
                    {CATEGORY_MAP[p.categoryId] || 'Gift'}
                  </span>
                  <div className="t-card__name">{p.name}</div>
                  <div className="t-card__stars">★★★★★ <span>5.0</span></div>
                  <div className="t-card__price">LKR {Number(p.price).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickView && (
        <div className="qv-overlay" onClick={() => setQuickView(null)}>
          <div className="qv-modal" onClick={e => e.stopPropagation()}>
            <button className="qv-close" onClick={() => setQuickView(null)}>✕</button>
            <div className="qv-image">
              <img src={quickView.imageUrl} alt={quickView.name} />
            </div>
            <div className="qv-body">
              <span className="t-card__category">{CATEGORY_MAP[quickView.categoryId] || 'Gift'}</span>
              <h3 className="qv-name">{quickView.name}</h3>
              <div className="qv-stars">★★★★★ <span>5.0 rating</span></div>
              <div className="qv-price">LKR {Number(quickView.price).toLocaleString()}</div>
              <p className="qv-desc">A premium curated gift from Giftora's exclusive collection. Beautifully packaged and ready to delight.</p>
              <button className="qv-view-btn" onClick={() => { setQuickView(null); navigate('/products'); }}>
                View in Collection →
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

// ─── NEW: Why Giftora — Value Props Strip ────────────────────────────────────

const StatCounter = ({ num, suffix, start }) => {
  const count = useCountUp(num, 2000, start);
  return <>{count.toLocaleString()}{suffix}</>;
};

const WhyGiftora = () => {
  const [ref, visible] = useReveal(0.2);

  return (
    <section className={`why-giftora section-reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <div className="why-giftora__bg" />
      <div className="section-inner">
        <div className="section-label center">Why Choose Us</div>
        <h2 className="section-title center">The Giftora Difference</h2>
        <p className="section-subtitle">Numbers that speak louder than words</p>

        <div className="why-giftora__grid">
          {VALUE_STATS.map((s, i) => (
            <div key={i} className="why-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="why-card__glow" />
              <div className="why-card__icon">{s.icon}</div>
              <div className="why-card__number">
                <StatCounter num={s.num} suffix={s.suffix} start={visible} />
              </div>
              <div className="why-card__label">{s.label}</div>
              <div className="why-card__desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

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
              <div className="testimonial-card__stars">{'★'.repeat(t.stars)}</div>
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
      </div>
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
      <PromoBanner />
      <GiftBoxShowcase />
      <FeaturedProducts />
      <TrendingGrid />
      <WhyGiftora />
      <HowItWorks />
      <Testimonials />
      <BuilderCTA />
    </main>
    <Footer />
  </div>
);

export default HomePage;