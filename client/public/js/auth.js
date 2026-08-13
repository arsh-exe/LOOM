/* ==========================================================================
   AUTH — login/register/logout, session storage, and the shared logic that
   renders the navbar's login/account state on every page.
   ========================================================================== */

const Auth = {
  // We store the JWT + a lightweight copy of the user object in
  // localStorage. localStorage persists across tabs and browser restarts
  // (unlike sessionStorage), matching typical "stay logged in" behavior.
  saveSession(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem(
      'user',
      JSON.stringify({ _id: data._id, name: data.name, email: data.email, role: data.role })
    );
  },

  getUser() {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  },

  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  isAdmin() {
    return this.getUser()?.role === 'admin';
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
  },

  async login(email, password) {
    const data = await Api.post('/auth/login', { email, password });
    this.saveSession(data);
    return data;
  },

  async register(name, email, password) {
    const data = await Api.post('/auth/register', { name, email, password });
    this.saveSession(data);
    return data;
  },

  // Call this at the top of any page that REQUIRES login (profile, orders,
  // checkout, admin). Redirects to login and remembers where to return to.
  requireLogin(redirectTo = 'login.html') {
    if (!this.isLoggedIn()) {
      const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
      window.location.href = `${redirectTo}?redirect=${returnUrl}`;
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.requireLogin()) return false;
    if (!this.isAdmin()) {
      Utils.showToast('Admin access only', 'error');
      window.location.href = '../index.html';
      return false;
    }
    return true;
  },
};

// ---- Renders the account section of the navbar on every page ----
// Called from each page's own script after the navbar HTML is in the DOM.
function renderNavAccount() {
  const wrap = document.getElementById('nav-account-wrap');
  if (!wrap) return;

  const user = Auth.getUser();

  if (!user) {
    wrap.innerHTML = `<a href="${pagePrefix()}login.html" class="navbar-icon-btn" title="Login">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
    </a>`;
    return;
  }

  wrap.innerHTML = `
    <div class="navbar-account-wrap">
      <button class="navbar-icon-btn" id="nav-account-btn" title="Account">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>
      </button>
      <div class="navbar-account-dropdown" id="nav-account-dropdown">
        <div style="padding:9px 12px; font-size:0.82rem; color:var(--color-muted);">Hi, ${Utils.escapeHtml(user.name)}</div>
        <a href="${pagePrefix()}pages/profile.html">Profile</a>
        <a href="${pagePrefix()}pages/orders.html">My Orders</a>
        <a href="${pagePrefix()}pages/wishlist.html">Wishlist</a>
        ${user.role === 'admin' ? `<a href="${pagePrefix()}pages/admin.html">Admin Dashboard</a>` : ''}
        <button id="nav-logout-btn">Log out</button>
      </div>
    </div>`;

  document.getElementById('nav-account-btn').addEventListener('click', () => {
    document.getElementById('nav-account-dropdown').classList.toggle('open');
  });
  document.getElementById('nav-logout-btn').addEventListener('click', () => Auth.logout());

  // Close dropdown when clicking elsewhere
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('nav-account-dropdown');
    const btn = document.getElementById('nav-account-btn');
    if (dropdown && !dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove('open');
    }
  });
}

// Pages living in /pages/ need "../" to reach root-level files;
// the homepage (index.html) needs nothing. Each page sets
// window.__pagePrefix before loading auth.js's DOMContentLoaded work.
function pagePrefix() {
  return window.__pagePrefix || '';
}
