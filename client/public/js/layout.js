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

        <div class="navbar-search-wrap">
          <div class="navbar-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
            <input type="text" id="nav-search-input" placeholder="Search products, brands..." />
          </div>
          <button class="ai-search-btn" id="ai-search-trigger" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3 1.9 5.2L19 10l-5.1 1.8L12 17l-1.9-5.2L5 10l5.1-1.8L12 3Z"/><path d="M18 15.5v.5M18 19.5v.5M15 18h.5M20.5 18H21"/></svg>
            AI Search
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
  renderAiSearchModal();

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

  const aiModal = document.getElementById('ai-search-modal');
  if (aiModal) {
    const aiInput = document.getElementById('ai-search-input');
    const aiSubmit = document.getElementById('ai-search-submit');
    const aiClose = document.getElementById('ai-search-close');
    const aiCloseSecondary = document.getElementById('ai-search-close-btn');

    const closeAiModal = () => {
      aiModal.classList.add('hidden');
      aiInput.value = '';
      document.getElementById('ai-search-results').innerHTML = '';
    };

    document.getElementById('ai-search-trigger').addEventListener('click', () => {
      aiModal.classList.remove('hidden');
      setTimeout(() => aiInput.focus(), 50);
    });

    aiClose.addEventListener('click', closeAiModal);
    aiCloseSecondary.addEventListener('click', closeAiModal);
    aiModal.addEventListener('click', (event) => {
      if (event.target === aiModal) closeAiModal();
    });

    aiInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        aiSubmit.click();
      }
    });

    aiSubmit.addEventListener('click', () => runAiSearch());
  }

  updateHeaderCounts();
}

function renderAiSearchModal() {
  const mount = document.getElementById('ai-search-mount');
  if (!mount) return;

  mount.innerHTML = `
    <div id="ai-search-modal" class="ai-search-modal hidden" aria-hidden="true">
      <div class="ai-search-panel" role="dialog" aria-modal="true" aria-labelledby="ai-search-title">
        <div class="ai-search-header">
          <div>
            <span class="eyebrow">AI Search</span>
            <h3 id="ai-search-title">Describe what you want</h3>
          </div>
          <button type="button" class="ai-search-close" id="ai-search-close" aria-label="Close AI Search">×</button>
        </div>

        <label class="ai-search-label" for="ai-search-input">Tell us the item, vibe, category, or budget you need</label>
        <textarea id="ai-search-input" class="ai-search-input" placeholder="Example: I want premium wireless headphones under ₹12,000 for travel"></textarea>

        <div class="ai-search-actions">
          <button type="button" class="btn btn-ghost" id="ai-search-close-btn">Cancel</button>
          <button type="button" class="btn btn-primary" id="ai-search-submit">Search</button>
        </div>

        <div id="ai-search-results" class="ai-search-results"></div>
      </div>
    </div>
  `;
}

function normalizeAiPrompt(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/₹/g, ' rupees ')
    .replace(/rs\.?/g, ' rupees ')
    .replace(/inr/g, ' rupees ')
    .replace(/[$€£,]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseAiBudgetValue(rawValue) {
  return Number(String(rawValue || '').replace(/,/g, ''));
}

function extractAiBudget(prompt) {
  const rawPrompt = String(prompt || '');
  const budgetPatterns = [
    /(?:under|below|less than|up to|budget|max|within|around|about)\s*(?:rupees|rs|inr)?\s*(\d[\d,]*(?:\.\d+)?)/gi,
    /(?:₹|rs\.?|inr|rupees?|ruppees?)\s*(\d[\d,]*(?:\.\d+)?)/gi,
    /(?:\$|usd|dollars?)\s*(\d[\d,]*(?:\.\d+)?)/gi,
  ];

  for (const pattern of budgetPatterns) {
    const match = rawPrompt.match(pattern);
    if (match) {
      return parseAiBudgetValue(match[0].match(/\d[\d,]*(?:\.\d+)?/)?.[0]);
    }
  }

  return null;
}

function scoreAiProductMatch(product, prompt) {
  const normalizedPrompt = normalizeAiPrompt(prompt);
  if (!normalizedPrompt) return 0;

  const stopWords = new Set(['i', 'want', 'need', 'looking', 'for', 'a', 'an', 'the', 'my', 'with', 'and', 'or', 'of', 'to', 'from', 'at', 'on', 'in', 'under', 'below', 'budget', 'around', 'about', 'up', 'to']);
  const tokens = normalizedPrompt.split(' ').filter((token) => token.length > 2 && !stopWords.has(token));
  const categoryName = typeof product.category === 'string' ? product.category : product.category?.name || '';
  const haystack = [
    product.name,
    product.brand,
    product.description,
    categoryName,
  ].join(' ').toLowerCase();

  let score = 0;

  tokens.forEach((token) => {
    if (!token) return;
    if (haystack.includes(token)) {
      score += 4;
      if (product.name.toLowerCase().includes(token)) score += 3;
      if (product.brand.toLowerCase().includes(token)) score += 2;
      if (categoryName.toLowerCase().includes(token)) score += 1;
    }
  });

  const budget = extractAiBudget(prompt);
  if (budget !== null) {
    const price = Number(product.finalPrice ?? product.price ?? 0);
    if (price <= budget) score += 5;
    if (budget > 0 && Math.abs(price - budget) <= budget * 0.25) score += 2;
  }

  const positiveSignals = { premium: 2, luxury: 3, travel: 2, gift: 2, wireless: 3, running: 3, backpack: 3, fitness: 2, home: 2, office: 2, everyday: 1 };
  Object.entries(positiveSignals).forEach(([signal, value]) => {
    if (normalizedPrompt.includes(signal) && haystack.includes(signal)) score += value;
  });

  if (normalizedPrompt.includes('cheap') && (product.finalPrice ?? product.price) <= 60) score += 4;
  if (normalizedPrompt.includes('premium') && (product.finalPrice ?? product.price) >= 80) score += 4;
  if (normalizedPrompt.includes('best') && product.rating >= 4.5) score += 3;

  return score;
}

async function runAiSearch() {
  const promptInput = document.getElementById('ai-search-input');
  const prompt = promptInput.value.trim();
  const resultsEl = document.getElementById('ai-search-results');

  if (!prompt) {
    Utils.showToast('Write a product prompt first', 'error');
    promptInput.focus();
    return;
  }

  resultsEl.innerHTML = `
    <div class="ai-search-loading">
      <div class="spinner" style="width:18px; height:18px; border-width:2px; margin:0;"></div>
      <span>Finding smart matches...</span>
    </div>
  `;

  try {
    const data = await Api.get('/products?limit=100');
    const ranked = data.products
      .map((product) => ({ product, score: scoreAiProductMatch(product, prompt) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product);

    if (ranked.length === 0) {
      const suggestions = [...data.products]
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 4);

      resultsEl.innerHTML = `
        <div class="ai-search-empty">
          <p class="ai-search-no-match">No matching result</p>
          <p class="ai-search-subtitle">Suggested products for you:</p>
        </div>
        <div class="ai-search-grid">
          ${suggestions.map((product) => productCardHtml(product, { showMatch: true })).join('')}
        </div>
      `;
      return;
    }

    resultsEl.innerHTML = `
      <div class="ai-search-empty">
        <p class="ai-search-no-match">AI matches for your prompt</p>
      </div>
      <div class="ai-search-grid">
        ${ranked.slice(0, 6).map((product) => productCardHtml(product, { showMatch: true })).join('')}
      </div>
    `;
  } catch (error) {
    resultsEl.innerHTML = `
      <div class="ai-search-empty">
        <p class="ai-search-no-match">Something went wrong</p>
        <p class="ai-search-subtitle">${Utils.escapeHtml(error.message)}</p>
      </div>
    `;
  }
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
