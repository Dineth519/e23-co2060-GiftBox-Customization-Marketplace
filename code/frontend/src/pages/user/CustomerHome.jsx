// Core libraries
import React, { useState, useEffect } from 'react';

// Routing and navigation
import { useNavigate } from 'react-router-dom';

// Icons for UI components
import { FaGift, FaHeart, FaTruck, FaShieldAlt, FaStar, FaArrowRight, FaQuoteLeft } from 'react-icons/fa';

// Stylesheet for customer home page
import './CustomerHome.css';

// Customer home page component displaying gift marketplace with categories, products, and vendors
const CustomerHome = () => {
  // Track active category for filtering
  const [activeCategory, setActiveCategory] = useState(0);
  // Track scroll position for header styling
  const [scrolled, setScrolled] = useState(false);
  // Navigation hook for programmatic routing
  const navigate = useNavigate();

  // Handle scroll event to update header styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Best-selling gift boxes with ratings and pricing
  const featuredBoxes = [
    {
      name: 'The Luxe Collection',
      price: '12,500',
      image: '🎁',
      rating: 4.9,
      reviews: 234
    },
    {
      name: 'Sweet Serenity',
      price: '8,900',
      image: '🍬',
      rating: 4.8,
      reviews: 189
    },
    {
      name: 'Executive Pride',
      price: '15,000',
      image: '💼',
      rating: 5.0,
      reviews: 156
    }
  ];

  // Customer testimonials and reviews
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Corporate Client',
      text: 'Absolutely stunning! The attention to detail in every gift box is incredible. Our clients were thrilled.',
      rating: 5
    },
    {
      name: 'Rajesh Kumar',
      role: 'Birthday Surprise',
      text: 'Made my wife\'s birthday unforgettable. The customization options are endless and the quality is premium.',
      rating: 5
    },
    {
      name: 'Emily Chen',
      role: 'Wedding Gifts',
      text: 'Perfect for our wedding favors! The team helped us create something truly unique for our guests.',
      rating: 5
    }
  ];

  // Render complete customer home page with all sections
  return (
    <div className="customer-home">
      {/* Hero section with main call-to-action and value proposition */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            Curated with Love
          </div>
          <h1 className="hero-title">
            Gift Experiences,<br />
            <span className="title-accent">Not Just Boxes</span>
          </h1>
          <p className="hero-subtitle">
            Discover handcrafted gift collections from Sri Lanka's finest artisans.<br />
            Each box tells a story, each gift creates a memory.
          </p>
          <div className="hero-cta">
            {/* Explore Collections button */}
            <button 
              className="btn-primary"
              onClick={() => navigate('/products')}
            >
              Explore Collections
              <FaArrowRight className="btn-icon" />
            </button>

             {/* Custom Gift Box button */}
            <button 
              className="btn-secondary"
              onClick={() => navigate('/customize')}
            >
              Custom Gift Box
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">5000+</span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Unique Products</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">4.9</span>
              <span className="stat-label">Average Rating</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-emoji">🎁</div>
            <div className="card-shine"></div>
          </div>
          <div className="floating-card card-2">
            <div className="card-emoji">💝</div>
            <div className="card-shine"></div>
          </div>
          <div className="floating-card card-3">
            <div className="card-emoji">🌸</div>
            <div className="card-shine"></div>
          </div>
        </div>
      </section>

      {/* Featured bestselling gift boxes with ratings and prices */}
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Bestselling Collections</h2>
          <p className="section-subtitle">Our most loved gift experiences</p>
        </div>
        <div className="featured-grid">
          {featuredBoxes.map((box, idx) => (
            <div 
              className="featured-card"
              key={idx}
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="featured-image">
                <div className="image-emoji">{box.image}</div>
                <div className="featured-badge">Trending</div>
              </div>
              <div className="featured-content">
                <h3 className="featured-name">{box.name}</h3>
                <div className="featured-rating">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className="star-icon" />
                    ))}
                  </div>
                  <span className="rating-text">{box.rating} ({box.reviews})</span>
                </div>
                <div className="featured-footer">
                  <div className="price-tag">
                    <span className="currency">LKR</span>
                    <span className="price">{box.price}</span>
                  </div>
                  <button 
                    className="add-to-cart"
                    onClick={() => navigate('/customize')}
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process steps explaining how customers create and receive gift boxes */}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">Creating Magic is Simple</h2>
          <p className="section-subtitle">From selection to delivery, we've got you covered</p>
        </div>
        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">
              <FaGift />
            </div>
            <h3 className="step-title">Choose Your Style</h3>
            <p className="step-desc">Browse curated collections or build your own custom gift box</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">
              <FaHeart />
            </div>
            <h3 className="step-title">Personalize It</h3>
            <p className="step-desc">Add a personal touch with custom messages and wrapping</p>
          </div>
          <div className="step-connector"></div>
          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">
              <FaTruck />
            </div>
            <h3 className="step-title">We Deliver Joy</h3>
            <p className="step-desc">Receive your beautifully packaged gift, delivered with care</p>
          </div>
        </div>
      </section>

      {/* Customer testimonials and success stories */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">Stories of Joy</h2>
          <p className="section-subtitle">Hear from our delighted customers</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, idx) => (
            <div 
              className="testimonial-card"
              key={idx}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <FaQuoteLeft className="quote-icon" />
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="star-filled" />
                ))}
              </div>
              <p className="testimonial-text">{testimonial.text}</p>
              <div className="testimonial-author">
                <div className="author-avatar">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="author-info">
                  <div className="author-name">{testimonial.name}</div>
                  <div className="author-role">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-action section encouraging user engagement */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Create Something Special?</h2>
          <p className="cta-subtitle">
            Join thousands of satisfied customers who've made gifting memorable
          </p>
          <button 
            className="cta-button"
            onClick={() => navigate('/customize')}
          >
            Start Your Gift Journey
            <FaArrowRight className="btn-icon" />
          </button>
        </div>
        <div className="cta-glow"></div>
      </section>

      {/* Footer with links, information, and company details */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-brand">Giftora</h3>
            <p className="footer-desc">
              Crafting memorable gift experiences<br />
              one box at a time.
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Shop</h4>
            <ul className="footer-links">
              <li>All Collections</li>
              <li>Custom Boxes</li>
              <li>Corporate Gifts</li>
              <li>Gift Cards</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Company</h4>
            <ul className="footer-links">
              <li>About Us</li>
              <li>Our Story</li>
              <li>Vendors</li>
              <li>Contact</li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-title">Support</h4>
            <ul className="footer-links">
              <li>Help Center</li>
              <li>Shipping Info</li>
              <li>Returns</li>
              <li>FAQ</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Giftora. All rights reserved.</p>
          <div className="footer-payment">
            <span>💳</span>
            <span>🏦</span>
            <span>📱</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default CustomerHome;