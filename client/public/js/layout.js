/* ==========================================================================
   LAYOUT — injects the shared navbar + footer HTML into every page (so we
   don't copy/paste the same markup into 10 files), and wires up the
   mobile menu toggle, search box, and cart/wishlist count badges.
   ========================================================================== */

function renderNavbar() {
  const prefix = pagePrefix();
  const mount = document.getElementById('navbar-mount');
  if (!mount) return;

  mount.innerHTML = `
    <nav class="navbar">
      <div class="container navbar-inner">
        <a href="${prefix}index.html" class="navbar-logo">LOOM</a>

        <ul class="navbar-links">
          <li><a href="${prefix}index.html">Home</a></li>
          <li><a href="${prefix}pages/shop.html">Shop</a></li>
        </ul>

        <div class="navbar-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="nav-search-input" placeholder="Search products, brands..." />
        </div>

        <div class="navbar-actions">
          <a href="${prefix}pages/wishlist.html" class="navbar-icon-btn" title="Wishlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
            <span class="navbar-count" id="wishlist-count" style="display:none;">0</span>
          </a>
          <a href="${prefix}pages/cart.html" class="navbar-icon-btn" title="Cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>
            <span class="navbar-count" id="cart-count" style="display:none;">0</span>
          </a>
          <div id="nav-account-wrap"></div>
          <button class="navbar-mobile-toggle" id="mobile-toggle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
          </button>
        </div>
      </div>
      <div class="container">
        <div class="navbar-mobile-menu" id="mobile-menu">
          <a href="${prefix}index.html">Home</a>
          <a href="${prefix}pages/shop.html">Shop</a>
          <a href="${prefix}pages/cart.html">Cart</a>
          <a href="${prefix}pages/wishlist.html">Wishlist</a>
        </div>
      </div>
    </nav>
  `;

  renderNavAccount();

  document.getElementById('mobile-toggle').addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.toggle('open');
  });

  const searchInput = document.getElementById('nav-search-input');
  searchInput.addEventListener(
    'keydown',
    (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        window.location.href = `${prefix}pages/shop.html?keyword=${encodeURIComponent(searchInput.value.trim())}`;
      }
    }
  );

  updateHeaderCounts();
}

function renderFooter() {
  const prefix = pagePrefix();
  const mount = document.getElementById('footer-mount');
  if (!mount) return;

  mount.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="${prefix}index.html" class="navbar-logo">LOOM</a>
            <p>An AI-curated general store — product recommendations, review sentiment, and a shopping assistant, all built on real data.</p>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a href="${prefix}pages/shop.html">All Products</a></li>
              <li><a href="${prefix}pages/shop.html?sort=newest">New Arrivals</a></li>
              <li><a href="${prefix}pages/shop.html?sort=rating">Top Rated</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Account</h4>
            <ul>
              <li><a href="${prefix}pages/profile.html">My Profile</a></li>
              <li><a href="${prefix}pages/orders.html">Order History</a></li>
              <li><a href="${prefix}pages/wishlist.html">Wishlist</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>About</h4>
            <ul>
              <li><a href="#">This is a CV / learning project</a></li>
              <li><a href="#">No real payments are processed</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} LOOM. Built as a full-stack learning project.</span>
          <span>MERN-style stack · Vanilla JS · Node/Express · MongoDB</span>
        </div>
      </div>
    </footer>
  `;
}

// Updates the little red-dot counters on the cart/wishlist icons.
// Called after login, after adding/removing items, and on every page load.
async function updateHeaderCounts() {
  const cartBadge = document.getElementById('cart-count');
  const wishlistBadge = document.getElementById('wishlist-count');
  if (!Auth.isLoggedIn()) return;

  try {
    const cart = await Api.get('/cart', true);
    if (cartBadge) {
      const count = cart.items.reduce((sum, i) => sum + i.quantity, 0);
      cartBadge.textContent = count;
      cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }
  } catch (e) { /* not logged in / cart empty — ignore */ }

  try {
    const wishlist = await Api.get('/wishlist', true);
    if (wishlistBadge) {
      wishlistBadge.textContent = wishlist.length;
      wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
    }
  } catch (e) { /* ignore */ }
}
