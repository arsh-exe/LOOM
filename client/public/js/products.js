/* ==========================================================================
   PRODUCTS — rendering product cards (used on homepage + shop page),
   the shop page's search/filter/sort/pagination logic, and product
   detail page logic (gallery, reviews, AI recommendations).
   ========================================================================== */

// Renders one product into the shared card markup used everywhere
// (homepage featured section, shop grid, related products).
function productCardHtml(product, { showMatch = false } = {}) {
  const prefix = pagePrefix();
  const image = product.images?.[0] || Utils.fallbackImage;
  const hasDiscount = product.discount > 0;
  const outOfStock = product.stock <= 0;

  return `
    <div class="product-card" data-id="${product._id}">
      <a href="${prefix}pages/product.html?id=${product._id}">
        <div class="thumb-wrap">
          <img src="${image}" alt="${Utils.escapeHtml(product.name)}" loading="lazy" />
          <div class="badges">
            ${hasDiscount ? `<span class="badge badge-sale">-${product.discount}%</span>` : ''}
            ${outOfStock ? `<span class="badge badge-out">Out of stock</span>` : ''}
          </div>
          ${showMatch ? `<span class="match-pill">AI Match</span>` : ''}
        </div>
      </a>
      <button class="wishlist-btn" data-wishlist-id="${product._id}" title="Add to wishlist" aria-label="Add to wishlist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>
      </button>
      <div class="body">
        <span class="brand">${Utils.escapeHtml(product.brand)}</span>
        <a href="${prefix}pages/product.html?id=${product._id}"><h4>${Utils.escapeHtml(product.name)}</h4></a>
        <div class="rating">
          <span class="stars">${Utils.renderStars(product.rating)}</span>
          <span>(${product.numReviews})</span>
        </div>
        <div class="price-row gap-2">
          ${hasDiscount ? `<span class="price-strike">${Utils.formatPrice(product.price)}</span>` : ''}
          <span class="price">${Utils.formatPrice(product.finalPrice ?? product.price)}</span>
        </div>
        <button class="btn btn-primary btn-sm add-btn" data-add-id="${product._id}" ${outOfStock ? 'disabled' : ''}>
          ${outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </div>`;
}

// Wires up the "add to cart" and "wishlist" buttons inside any container
// that has product cards rendered by productCardHtml(). Event delegation
// (one listener on the container) is used instead of one listener per
// button, so it still works after re-rendering the grid.
function bindProductCardEvents(container) {
  container.addEventListener('click', async (e) => {
    const addBtn = e.target.closest('[data-add-id]');
    const wishBtn = e.target.closest('[data-wishlist-id]');

    if (addBtn) {
      e.preventDefault();
      if (!Auth.isLoggedIn()) {
        window.location.href = `${pagePrefix()}pages/login.html`;
        return;
      }
      try {
        await Api.post('/cart', { productId: addBtn.dataset.addId, quantity: 1 }, true);
        Utils.showToast('Added to cart', 'success');
        updateHeaderCounts();
      } catch (err) {
        Utils.showToast(err.message, 'error');
      }
    }

    if (wishBtn) {
      e.preventDefault();
      if (!Auth.isLoggedIn()) {
        window.location.href = `${pagePrefix()}pages/login.html`;
        return;
      }
      try {
        await Api.post(`/wishlist/${wishBtn.dataset.wishlistId}`, {}, true);
        wishBtn.classList.add('active');
        Utils.showToast('Added to wishlist', 'success');
        updateHeaderCounts();
      } catch (err) {
        Utils.showToast(err.message, 'error');
      }
    }
  });
}

function skeletonGridHtml(count = 8) {
  return Array(count)
    .fill('<div class="skeleton" style="aspect-ratio:3/4;"></div>')
    .join('');
}

function emptyStateHtml(title, subtitle) {
  return `<div class="state-block">
    <h3>${title}</h3>
    <p>${subtitle}</p>
  </div>`;
}

function errorStateHtml(message) {
  return `<div class="state-block">
    <h3>Something went wrong</h3>
    <p>${Utils.escapeHtml(message)}</p>
  </div>`;
}
