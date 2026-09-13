'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getCart, removeFromCart, updateQuantity, getCartSubtotal } from '../../utils/cart';

export default function CartPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const syncCart = () => setItems(getCart());
    syncCart();

    window.addEventListener('cart-updated', syncCart);
    return () => window.removeEventListener('cart-updated', syncCart);
  }, []);

  const subtotal = getCartSubtotal();

  const handleQtyChange = (itemId, quantity) => {
    const next = updateQuantity(itemId, quantity);
    setItems(next);
    window.dispatchEvent(new Event('cart-updated'));
  };

  const handleRemove = (itemId) => {
    const next = removeFromCart(itemId);
    setItems(next);
    window.dispatchEvent(new Event('cart-updated'));
  };

  return (
    <div className="container cart-page">
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.7rem', letterSpacing: '-0.06em', marginBottom: 26 }}>Your cart</h2>
      {items.length === 0 ? (
        <div className="empty-state">
          <p style={{ marginBottom: 12, color: '#5b5b5b' }}>Your cart is empty.</p>
          <Link href="/shop" className="primary-btn">Continue shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr', gap: 24 }}>
          <div className="cart-items">
            {items.map((item) => (
              <div key={item._id} className="cart-item">
                <img src={item.images?.[0] || '/assets/products-images/p_img1.png'} alt={item.name} />
                <div className="cart-item-details">
                  <h3 style={{ margin: '0 0 8px' }}>{item.name}</h3>
                  <p style={{ margin: 0, color: '#5b5b5b' }}>Qty:</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                    <button type="button" className="secondary-btn" onClick={() => handleQtyChange(item._id, Number(item.quantity || 1) - 1)}>-</button>
                    <strong>{item.quantity}</strong>
                    <button type="button" className="secondary-btn" onClick={() => handleQtyChange(item._id, Number(item.quantity || 1) + 1)}>+</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(item.finalPrice ?? item.price) * Number(item.quantity || 1))}</strong>
                  <div style={{ marginTop: 10 }}>
                    <button type="button" className="link-btn" onClick={() => handleRemove(item._id)}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="cart-summary">
            <h3 style={{ marginTop: 0 }}>Order summary</h3>
            <div className="cart-row"><span>Subtotal</span><strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(subtotal)}</strong></div>
            <div className="cart-row"><span>Shipping</span><strong>Free</strong></div>
            <div className="cart-row"><span>Total</span><strong>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(subtotal)}</strong></div>
            <Link href="/shop" className="primary-btn" style={{ width: '100%', marginTop: 20 }}>Checkout</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
