// Core libraries and routing
import React from 'react';
import { useNavigate } from 'react-router-dom';

// Page components
import Header from '../../components/homepage/Header.jsx';
import Footer from '../../components/homepage/Footer.jsx';

// Stylesheet
import './HomePage.css';

// Sample category data for gift browsing
const CATEGORIES = [
  { icon: '📦', label: 'Build Your Box' },
  { icon: '🎀', label: 'Gift Bundles'   },
  { icon: '👔', label: 'For Him'        },
  { icon: '👑', label: 'For Her'        },
  { icon: '🏢', label: 'Corporate'      },
  { icon: '🌸', label: 'Seasonal'       },
];

// Feature highlights displayed in hero section
const FEATURES = [
  { icon: '🎨', title: 'Fully Custom',   desc: 'Build your own box from scratch' },
  { icon: '🚀', title: 'Fast Delivery',  desc: 'Same day delivery available'     },
  { icon: '💝', title: 'Luxury Packing', desc: 'Premium gift wrapping included'  },
];

// Featured gift products with pricing and vendor information
const PRODUCTS = [
  { id: 1, emoji: '🍫', tag: 'Best Seller', name: 'Premium Choco Box',    vendor: 'Choco Heaven',    price: 'LKR 2,400' },
  { id: 2, emoji: '🌹', tag: 'New',         name: 'Romantic Rose Bundle', vendor: 'Flower Paradise', price: 'LKR 3,800' },
  { id: 3, emoji: '🕯️', tag: 'Popular',     name: 'Luxury Spa Set',       vendor: 'Glow & Bloom',    price: 'LKR 5,200' },
  { id: 4, emoji: '🎁', tag: 'Custom',      name: 'Build Your Own Box',   vendor: 'Giftora',         price: 'From LKR 1,500' },
];

// Steps showing the gift creation and delivery process
const STEPS = [
  { icon: '🛍️', title: 'Browse & Pick',    desc: 'Choose items from any of our trusted local vendors'    },
  { icon: '📦', title: 'We Pack It',        desc: 'We hand-assemble everything into a beautiful gift box' },
  { icon: '🎀', title: 'Add a Message',     desc: 'Personalise with a handwritten card or ribbon'         },
  { icon: '🚚', title: 'Fast Delivery',     desc: "Delivered to your loved one's door island-wide"        },
];

// Hero section component with main call-to-action and value proposition
const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero__inner">
        {/* Text content and call-to-action buttons */}
        <div className="hero__content">
          <div className="hero__badge">
            <span>✨</span>
            <span className="hero__badge-text">Sri Lanka's #1 Gift Marketplace</span>
          </div>

          <h1 className="hero__title">
            Curate the{' '}
            <span className="hero__title-accent">Perfect Gift</span>
          </h1>

          <p className="hero__subtitle">
            Choose items from multiple vendors and we'll hand-pack them into one
            luxury gift box. Delivered with love, island-wide.
          </p>

          <div className="hero__cta-group">
            <button className="btn-hero-primary" onClick={() => navigate('/build')}>
              🎁 Start Customizing
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/products')}>
              Browse Gifts
            </button>
          </div>

          <div className="hero__stats">
            {[
              { value: '2,800+', label: 'Happy Customers' },
              { value: '150+',   label: 'Local Vendors'   },
              { value: '10K+',   label: 'Gifts Delivered' },
            ].map((s, i) => (
              <div key={i}>
                <div className="hero__stat-value">{s.value}</div>
                <div className="hero__stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature cards and vendor call-to-action */}
        <div className="hero__cards">
          {FEATURES.map((f, i) => (
            <button key={i} className="hero__feature-card">
              <div className="hero__feature-icon">{f.icon}</div>
              <div>
                <div className="hero__feature-title">{f.title}</div>
                <div className="hero__feature-desc">{f.desc}</div>
              </div>
              <span className="hero__feature-arrow">→</span>
            </button>
          ))}

          {/* Vendor CTA */}
          <div className="hero__vendor-card">
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

// Categories navigation strip for browsing by occasion
const CategoriesStrip = () => (
  <section className="categories-strip">
    <h2 className="categories-strip__title">Shop by Category</h2>
    <div className="categories-strip__grid">
      {CATEGORIES.map((cat, i) => (
        <button key={i} className="category-tile">
          <span className="category-tile__icon">{cat.icon}</span>
          <span className="category-tile__label">{cat.label}</span>
        </button>
      ))}
    </div>
  </section>
);

// Featured products section displaying best sellers and trending items
const FeaturedProducts = () => {
  const navigate = useNavigate();

  return (
    <section className="featured">
      <div className="featured__header">
        <h2 className="featured__title">🔥 Featured Gifts</h2>
        <button className="btn-view-all" onClick={() => navigate('/products')}>
          View All
        </button>
      </div>

      <div className="featured__grid">
        {PRODUCTS.map(p => (
          <div key={p.id} className="product-card">
            <div className="product-card__image" style={{
              background: `linear-gradient(135deg, rgba(201,169,97,0.08), rgba(93,173,226,0.08))`,
            }}>
              {p.emoji}
            </div>
            <div className="product-card__body">
              <span className="product-card__tag">{p.tag}</span>
              <div className="product-card__name">{p.name}</div>
              <div className="product-card__vendor">by {p.vendor}</div>
              <div className="product-card__footer">
                <span className="product-card__price">{p.price}</span>
                <button className="btn-add-cart" title="Add to cart">+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// How it works section explaining the gift creation process
const HowItWorks = () => (
  <section className="how-it-works">
    <h2 className="how-it-works__title">How Giftora Works</h2>
    <p className="how-it-works__subtitle">
      From browsing to doorstep in four simple steps
    </p>
    <div className="how-it-works__steps">
      {STEPS.map((step, i) => (
        <div key={i} className="step-card">
          <div className="step-card__number">{i + 1}</div>
          <div className="step-card__icon">{step.icon}</div>
          <div className="step-card__title">{step.title}</div>
          <p className="step-card__desc">{step.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

// Main home page component assembling all sections with header and footer
const HomePage = () => (
  <div className="home-page">
    <Header />
    <main>
      <HeroSection />
      <CategoriesStrip />
      <FeaturedProducts />
      <HowItWorks />
    </main>
    <Footer />
  </div>
);

export default HomePage;