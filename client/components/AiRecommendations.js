'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AiRecommendations({ productId }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!productId) return;

    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/products/${productId}/recommendations`, { cache: 'no-store' });
        const data = await res.json();
        setItems(data || []);
      } catch (error) {
        console.error(error);
      }
    }

    load();
  }, [productId]);

  if (!items.length) return null;

  const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  return (
    <section className="container section-block" style={{ paddingTop: 20 }}>
      <div className="section-heading">
        <div>
          <span className="eyebrow alt">AI picks</span>
          <h2>Recommended for you</h2>
        </div>
      </div>
      <div className="product-grid">
        {items.map((product) => (
          <article key={product._id} className="product-card">
            <div className="product-image-wrap">
              <Link href={`/product/${product._id}`}>
                <img src={product.images?.[0] || '/assets/products-images/p_img1.png'} alt={product.name} />
              </Link>
            </div>
            <div className="product-body">
              <div className="product-topline">
                <span className="product-brand">{product.brand}</span>
              </div>
              <Link href={`/product/${product._id}`} className="product-title">{product.name}</Link>
              <div className="product-meta">
                <span className="price">{formatINR(Number(product.finalPrice ?? product.price))}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
