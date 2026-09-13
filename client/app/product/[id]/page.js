'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';
import AiChatWidget from '../../../components/AiChatWidget';
import AiRecommendations from '../../../components/AiRecommendations';
import { addToCart } from '../../../utils/cart';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function ProductDetailPage({ params }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      const res = await fetch(`${API_URL}/products/${params.id}`, { cache: 'no-store' });
      const data = await res.json();
      setProduct(data);
    }

    if (params?.id) loadProduct();
  }, [params]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, 1);
    window.dispatchEvent(new Event('cart-updated'));
    router.push('/cart');
  };

  const formatINR = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));

  if (!product) return <div className="container detail-page">Loading product...</div>;

  return (
    <div className="container detail-page">
      <div className="product-showcase">
        <div>
          <div className="gallery-main">
            <img src={product.images?.[selectedImage] || '/assets/products-images/p_img1.png'} alt={product.name} />
          </div>
          <div className="gallery-thumb-list">
            {(product.images || []).map((image, index) => (
              <img
                key={image}
                className="gallery-thumb"
                src={image}
                alt={`${product.name} view ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                style={{ borderColor: index === selectedImage ? '#5e705a' : 'rgba(26,26,26,0.08)' }}
              />
            ))}
          </div>
        </div>

        <div className="product-detail-card">
          <span className="product-brand">{product.brand}</span>
          <h1>{product.name}</h1>

          <div className="product-rating" style={{ fontSize: '0.95rem', marginBottom: 8 }}>
            <Star size={16} fill="currentColor" /> {Number(product.rating || 0).toFixed(1)}
            <span style={{ color: '#5b5b5b', marginLeft: 8 }}>({product.numReviews || 0} reviews)</span>
          </div>

          <div className="detail-price">
            <span className="price">{formatINR(Number(product.finalPrice ?? product.price))}</span>
            {Number(product.discount || 0) > 0 && (
              <span className="old-price">{formatINR(Number(product.price))}</span>
            )}
          </div>

          <span className="stock-chip">{product.stock > 0 ? 'In stock' : 'Sold out'}</span>

          <p style={{ color: '#5b5b5b', lineHeight: 1.8, margin: '22px 0 0' }}>{product.description}</p>

          <div className="detail-actions">
            <button className="primary-btn" type="button" onClick={handleAddToCart}>Add to cart</button>
            <button className="secondary-btn" type="button" onClick={handleBuyNow}>Buy now</button>
          </div>
        </div>
      </div>

      <AiRecommendations productId={product._id} />
      <AiChatWidget />
    </div>
  );
}
