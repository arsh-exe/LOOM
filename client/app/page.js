'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShoppingBag, ShieldCheck, Zap } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import AiChatWidget from '../components/AiChatWidget';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

async function fetchJson(url) {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Unable to load data');
  return res.json();
}

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoryData, productData] = await Promise.all([
          fetchJson(`${API_URL}/categories`),
          fetchJson(`${API_URL}/products?sort=newest&limit=8`),
        ]);
        setCategories(categoryData || []);
        setFeatured(productData.products || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <>
      <section className="hero-wrap">
        <div className="hero-grid container">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="hero-copy"
          >
            <span className="eyebrow">
              <Sparkles size={14} /> AI-powered shopping
            </span>
            <h1>Shop smarter. Dress brighter.</h1>
            <p>
              Discover trend-led essentials with personalized recommendations,
              smooth checkout, and a storefront designed to feel premium from the first click.
            </p>
            <div className="hero-actions">
              <Link href="/shop" className="primary-btn">
                Shop now <ArrowRight size={18} />
              </Link>
              <Link href="/register" className="secondary-btn">
                Join now
              </Link>
            </div>
            <div className="hero-stats">
              <div>
                <strong>12k+</strong>
                <span>happy shoppers</span>
              </div>
              <div>
                <strong>4.9/5</strong>
                <span>average rating</span>
              </div>
              <div>
                <strong>24/7</strong>
                <span>AI support</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="hero-visual"
          >
            <div className="float-card main-card">
              <span>Trending now</span>
              <h3>Comfort meets confidence</h3>
              <div className="mini-product">
                <img src="/assets/products-images/p_img2_1.png" alt="Featured product" />
                <div>
                  <strong>Urban Classic Tee</strong>
                  <small>From ₹8,900</small>
                </div>
              </div>
            </div>
            <div className="float-card badge-card">
              <ShoppingBag size={18} />
              <div>
                <strong>New arrivals</strong>
                <small>Fresh picks every week</small>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading">
          <span className="eyebrow alt">Top categories</span>
          <h2>Curated for everyday style</h2>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <motion.div
              key={category._id || category.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="category-card"
            >
              <Link href={`/shop?category=${category.slug || category._id}`}>
                <div className="icon-badge">
                  <Sparkles size={18} />
                </div>
                <h3>{category.name}</h3>
                <p>Shop the latest collection</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-heading row-between">
          <div>
            <span className="eyebrow alt">Featured drops</span>
            <h2>New arrivals you’ll love</h2>
          </div>
          <Link href="/shop" className="underlined-link">
            Browse all products
          </Link>
        </div>
        {loading ? (
          <div className="loading-row">Loading latest styles...</div>
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="features-band">
        <div className="container feature-grid">
          <div className="feature-item">
            <div className="icon-badge dark">
              <Zap size={18} />
            </div>
            <div>
              <h3>Fast delivery</h3>
              <p>Track every order with clear updates and quick dispatch.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="icon-badge dark">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3>Secure checkout</h3>
              <p>Trusted payment flow and protected customer experience.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="icon-badge dark">
              <Sparkles size={18} />
            </div>
            <div>
              <h3>Smart recommendations</h3>
              <p>AI suggestions that match your style and purchase intent.</p>
            </div>
          </div>
        </div>
      </section>

      <AiChatWidget />
    </>
  );
}
