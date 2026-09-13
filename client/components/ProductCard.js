'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { addToCart, getCartCount } from '../utils/cart';

export default function ProductCard({ product }) {
  const hasDiscount = Number(product.discount || 0) > 0;
  const price = Number(product.finalPrice ?? product.price ?? 0);
  const originalPrice = Number(product.price ?? 0);

  const handleAddToCart = () => {
    addToCart(product, 1);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart-updated'));
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32 }}
      className="product-card"
    >
      <div className="product-image-wrap">
        {hasDiscount && <span className="tag">-{product.discount}%</span>}
        <Link href={`/product/${product._id}`}>
          <img src={product.images?.[0] || '/assets/products-images/p_img1.png'} alt={product.name} />
        </Link>
      </div>

      <div className="product-body">
        <div className="product-topline">
          <span className="product-brand">{product.brand}</span>
          <span className="product-rating">
            <Star size={14} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}
          </span>
        </div>

        <Link href={`/product/${product._id}`} className="product-title">
          {product.name}
        </Link>

        <div className="product-meta">
          <div className="price-wrap">
            <span className="price">${price.toFixed(2)}</span>
            {hasDiscount && <span className="old-price">${originalPrice.toFixed(2)}</span>}
          </div>
          <span className="product-brand">{product.stock > 0 ? 'In stock' : 'Sold out'}</span>
        </div>

        <div className="card-actions">
          <button className="secondary-small" type="button" onClick={handleAddToCart}>Add to cart</button>
          <Link href={`/product/${product._id}`} className="primary-btn" style={{ padding: '10px 14px', borderRadius: 12 }}>
            View
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
