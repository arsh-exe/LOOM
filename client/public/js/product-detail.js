/* ==========================================================================
   PRODUCT DETAIL PAGE — gallery, tabs, AI sentiment summary, reviews,
   and AI-powered related products (content-based recommendations).
   ========================================================================== */

let currentProduct = null;
let selectedQty = 1;
let selectedRating = 0;

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();
  initAiChatWidget();

  const productId = Utils.getQueryParams().id;
  if (!productId) {
    document.getElementById('product-detail-mount').innerHTML = errorStateHtml('No product specified');
    return;
  }

  await loadProduct(productId);
});

async function loadProduct(id) {
  const mount = document.getElementById('product-detail-mount');
  mount.innerHTML = `<div class="spinner"></div>`;

  try {
    currentProduct = await Api.get(`/products/${id}`);
    renderProductDetail(currentProduct);
    loadReviews(id);
    loadRecommendations(id);
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
}

function renderProductDetail(p) {
  document.title = `${p.name} — LOOM`;
  document.getElementById('breadcrumb-name').textContent = p.name;

  const images = p.images?.length ? p.images : [Utils.fallbackImage];
  const outOfStock = p.stock <= 0;
  const lowStock = p.stock > 0 && p.stock <= 5;

  const normalizedImages = images.map((img) => Utils.normalizeImageUrl(img));

  document.getElementById('product-detail-mount').innerHTML = `
    <div class="product-gallery">
      <div class="main-image"><img id="main-product-image" src="${normalizedImages[0]}" alt="${Utils.escapeHtml(p.name)}" onerror="this.onerror=null; this.src='${Utils.fallbackImage}';" /></div>
      ${normalizedImages.length > 1 ? `<div class="thumb-strip">${normalizedImages.map((img, i) => `<img src="${img}" class="${i === 0 ? 'active' : ''}" data-thumb="${img}" onerror="this.onerror=null; this.src='${Utils.fallbackImage}';" />`).join('')}</div>` : ''}
    </div>
    <div class="product-info">
      <span class="brand">${Utils.escapeHtml(p.brand)}</span>
      <h1>${Utils.escapeHtml(p.name)}</h1>
      <div class="rating-row">
        <span class="stars">${Utils.renderStars(p.rating)}</span>
        <span>${p.rating.toFixed(1)} · ${p.numReviews} review${p.numReviews === 1 ? '' : 's'}</span>
      </div>
      <div class="price-block">
        ${p.discount > 0 ? `<span class="price-strike" style="font-size:1.2rem;">${Utils.formatPrice(p.price)}</span>` : ''}
        <span class="price">${Utils.formatPrice(p.finalPrice)}</span>
        ${p.discount > 0 ? `<span class="badge badge-sale">-${p.discount}%</span>` : ''}
      </div>
      <p class="description">${Utils.escapeHtml(p.description)}</p>

      <div class="${outOfStock ? '' : lowStock ? '' : ''} stock-note ${outOfStock ? 'out' : lowStock ? 'low' : 'in'}">
        ${outOfStock ? 'Out of stock' : lowStock ? `Only ${p.stock} left in stock` : 'In stock'}
      </div>

      <div class="qty-selector">
        <button id="qty-down">−</button>
        <span id="qty-display">1</span>
        <button id="qty-up">+</button>
      </div>

      <div class="product-actions">
        <button class="btn btn-primary" id="add-to-cart-btn" ${outOfStock ? 'disabled' : ''}>Add to Cart</button>
        <button class="btn btn-outline" id="wishlist-btn-detail">♡ Wishlist</button>
      </div>
    </div>
  `;

  document.querySelectorAll('[data-thumb]').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      document.getElementById('main-product-image').src = thumb.dataset.thumb;
      document.querySelectorAll('[data-thumb]').forEach((t) => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  document.getElementById('qty-up').addEventListener('click', () => {
    selectedQty = Math.min(selectedQty + 1, p.stock || 99);
    document.getElementById('qty-display').textContent = selectedQty;
  });
  document.getElementById('qty-down').addEventListener('click', () => {
    selectedQty = Math.max(selectedQty - 1, 1);
    document.getElementById('qty-display').textContent = selectedQty;
  });

  document.getElementById('add-to-cart-btn').addEventListener('click', async () => {
    if (!Auth.isLoggedIn()) { window.location.href = `${pagePrefix()}pages/login.html`; return; }
    try {
      await Api.post('/cart', { productId: p._id, quantity: selectedQty }, true);
      Utils.showToast('Added to cart', 'success');
      updateHeaderCounts();
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });

  document.getElementById('wishlist-btn-detail').addEventListener('click', async () => {
    if (!Auth.isLoggedIn()) { window.location.href = `${pagePrefix()}pages/login.html`; return; }
    try {
      await Api.post(`/wishlist/${p._id}`, {}, true);
      Utils.showToast('Added to wishlist', 'success');
      updateHeaderCounts();
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });
}

// ---- Reviews + AI sentiment summary ----
async function loadReviews(productId) {
  const mount = document.getElementById('reviews-mount');
  const summaryMount = document.getElementById('sentiment-summary-mount');

  try {
    const { reviews, sentimentSummary } = await Api.get(`/products/${productId}/reviews`);

    const total = reviews.length;
    if (total > 0) {
      const pct = (n) => Math.round((n / total) * 100);
      summaryMount.innerHTML = `
        <div class="sentiment-summary">
          <div class="sentiment-item positive"><div class="value">${pct(sentimentSummary.positive)}%</div><div class="label">Positive</div></div>
          <div class="sentiment-item neutral"><div class="value">${pct(sentimentSummary.neutral)}%</div><div class="label">Neutral</div></div>
          <div class="sentiment-item negative"><div class="value">${pct(sentimentSummary.negative)}%</div><div class="label">Negative</div></div>
        </div>
        <p class="text-muted" style="font-size:0.8rem;">
          <span class="badge badge-ai"><span class="dot"></span>AI-analyzed</span>
          Sentiment auto-tagged from review text via lexicon-based NLP.
        </p>`;
    }

    mount.innerHTML = total
      ? reviews
          .map(
            (r) => `
        <div class="review-item">
          <div class="review-head">
            <div>
              <span class="author">${Utils.escapeHtml(r.user?.name || 'Anonymous')}</span>
              <span class="sentiment-tag ${r.sentimentLabel}">${r.sentimentLabel}</span>
            </div>
            <span class="date">${Utils.formatDate(r.createdAt)}</span>
          </div>
          <div class="stars">${Utils.renderStars(r.rating)}</div>
          <p>${Utils.escapeHtml(r.comment)}</p>
        </div>`
          )
          .join('')
      : `<p class="text-muted">No reviews yet — be the first to review this product.</p>`;

    renderReviewForm(productId);
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
}

function renderReviewForm(productId) {
  const mount = document.getElementById('review-form-mount');

  if (!Auth.isLoggedIn()) {
    mount.innerHTML = `<p class="text-muted"><a href="${pagePrefix()}pages/login.html" class="text-link">Log in</a> to leave a review (verified purchase required).</p>`;
    return;
  }

  mount.innerHTML = `
    <div class="review-form">
      <h3>Write a review</h3>
      <div class="star-input" id="star-input">
        ${[1, 2, 3, 4, 5].map((n) => `<button type="button" data-star="${n}">★</button>`).join('')}
      </div>
      <div class="field">
        <textarea id="review-comment" placeholder="Share your experience with this product..."></textarea>
      </div>
      <button class="btn btn-primary" id="submit-review-btn">Submit Review</button>
      <p class="text-muted" style="font-size:0.8rem; margin-top:var(--space-2);">Only customers who purchased this product can review it.</p>
    </div>`;

  selectedRating = 0;
  document.querySelectorAll('#star-input [data-star]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedRating = Number(btn.dataset.star);
      document.querySelectorAll('#star-input [data-star]').forEach((b) => {
        b.classList.toggle('selected', Number(b.dataset.star) <= selectedRating);
      });
    });
  });

  document.getElementById('submit-review-btn').addEventListener('click', async () => {
    const comment = document.getElementById('review-comment').value.trim();
    if (!selectedRating || !comment) {
      Utils.showToast('Please add a rating and a comment', 'error');
      return;
    }
    try {
      await Api.post(`/products/${productId}/reviews`, { rating: selectedRating, comment }, true);
      Utils.showToast('Review submitted', 'success');
      await loadReviews(productId);
      const p = await Api.get(`/products/${productId}`);
      currentProduct = p;
      renderProductDetail(p);
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });
}

// ---- AI Recommendations ----
async function loadRecommendations(productId) {
  const mount = document.getElementById('recommendations-grid');
  try {
    const products = await Api.get(`/products/${productId}/recommendations`);
    if (!products.length) {
      document.getElementById('recommendations-section').style.display = 'none';
      return;
    }
    mount.innerHTML = products.map((p) => productCardHtml(p, { showMatch: true })).join('');
    bindProductCardEvents(mount);
  } catch (err) {
    document.getElementById('recommendations-section').style.display = 'none';
  }
}
