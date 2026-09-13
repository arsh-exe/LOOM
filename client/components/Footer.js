import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="brand" style={{ fontSize: '1.2rem' }}>
            <span className="brand-mark" style={{ width: 34, height: 34 }}>L</span>
            Loom
          </div>
          <p style={{ color: '#5b5b5b', margin: '12px 0 0' }}>
            Exceptional essentials for everyday life.
          </p>
        </div>

        <div className="footer-links">
          <Link href="/shop">Shop</Link>
          <Link href="/login">Account</Link>
          <Link href="/cart">Cart</Link>
          <Link href="/register">Register</Link>
        </div>
      </div>
    </footer>
  );
}
