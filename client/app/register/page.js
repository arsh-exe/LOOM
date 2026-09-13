'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="container">
      <div className="secondary-auth-card">
        <div style={{ marginBottom: 22 }}>
          <span className="eyebrow alt">Create account</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '14px 0 8px', letterSpacing: '-0.05em' }}>Join Loom</h2>
        </div>
        <form className="auth-form">
          <input type="text" placeholder="Full name" />
          <input type="email" placeholder="Email address" />
          <input type="password" placeholder="Password" />
          <button className="primary-btn" type="submit">Create account</button>
        </form>
        <p style={{ marginTop: 18, color: '#5b5b5b' }}>
          Already have an account? <Link href="/login" className="form-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
