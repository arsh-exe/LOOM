'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ShoppingBag, UserRound, Sparkles, Search, Sparkles as SparklesIcon } from 'lucide-react';
import { getCartCount } from '../utils/cart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function Navbar() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [aiOpen, setAiOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMatches, setAiMatches] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => setCartCount(getCartCount());
    updateCount();
    window.addEventListener('cart-updated', updateCount);
    return () => window.removeEventListener('cart-updated', updateCount);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const term = search.trim();
    if (!term) return;
    router.push(`/shop?keyword=${encodeURIComponent(term)}`);
  };

  const handleAiSearch = async () => {
    const term = aiPrompt.trim();
    if (!term) return;

    setAiLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: term, history: [] }),
      });
      const data = await res.json();
      setAiMatches(Array.isArray(data.products) ? data.products.slice(0, 3) : []);
    } catch (error) {
      setAiMatches([]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="/" className="brand">
          <span className="brand-mark"><Sparkles size={20} /></span>
          Loom
        </Link>

        <form className="nav-search" onSubmit={handleSearch}>
          <Search size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
          />
          <button type="submit" className="primary-btn small-btn">Search</button>
        </form>

        <nav className="nav-links" aria-label="Main navigation">
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/login">Account</Link>
        </nav>

        <div className="header-actions">
          <button type="button" className="secondary-btn" onClick={() => setAiOpen((prev) => !prev)}>
            <SparklesIcon size={16} /> AI Search
          </button>
          <Link href="/cart" className="icon-btn" aria-label="Cart">
            <ShoppingBag size={18} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          <Link href="/login" className="icon-btn" aria-label="Profile">
            <UserRound size={18} />
          </Link>
          <Link href="/shop" className="primary-btn">
            Shop now
          </Link>
        </div>
      </div>

      {aiOpen && (
        <div className="ai-search-wrap">
          <div className="ai-search-panel">
            <div className="ai-search-header">
              <strong>AI Search</strong>
              <button type="button" onClick={() => setAiOpen(false)} className="link-btn">Close</button>
            </div>
            <div className="ai-search-box">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Example: women tops under ₹2000"
                rows={3}
              />
              <button type="button" className="primary-btn" onClick={handleAiSearch} disabled={aiLoading}>
                {aiLoading ? 'Searching...' : 'Ask AI'}
              </button>
            </div>

            {aiMatches.length > 0 && (
              <div className="ai-search-results">
                {aiMatches.map((product) => (
                  <Link key={product._id} href={`/product/${product._id}`} className="ai-search-item" onClick={() => setAiOpen(false)}>
                    <img src={product.images?.[0] || '/assets/products-images/p_img1.png'} alt={product.name} />
                    <div>
                      <strong>{product.name}</strong>
                      <span>${Number(product.price).toFixed(2)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
