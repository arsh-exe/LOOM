'use client';

import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="container">
      <div className="secondary-auth-card">
        <div style={{ marginBottom: 22 }}>
          <span className="eyebrow alt">Welcome back</span>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2.4rem', margin: '14px 0 8px', letterSpacing: '-0.05em' }}>Sign in</h2>
        </div>
        <form className="auth-form">
          <input type="email" placeholder="Email address" />
          <input type="password" placeholder="Password" />
          <button className="primary-btn" type="submit">Login</button>
        </form>
        <p style={{ marginTop: 18, color: '#5b5b5b' }}>
          Don’t have an account? <Link href="/register" className="form-link">Create one</Link>
        </p>
      </div>
    </div>
  );
}
