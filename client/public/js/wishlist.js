/* ==========================================================================
   WISHLIST PAGE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();
  initAiChatWidget();

  if (!Auth.requireLogin('pages/login.html')) return;

  await loadWishlist();
});

async function loadWishlist() {
  const mount = document.getElementById('wishlist-grid');
  mount.innerHTML = `<div class="spinner"></div>`;

  try {
    const items = await Api.get('/wishlist', true);

    if (items.length === 0) {
      mount.innerHTML = emptyStateHtml('Your wishlist is empty', 'Tap the heart icon on any product to save it here.');
      return;
    }

    mount.innerHTML = items
      .map(
        (product) => `
      <div class="product-card" data-id="${product._id}">
        <a href="product.html?id=${product._id}">
          <div class="thumb-wrap"><img src="${Utils.normalizeImageUrl(product.images?.[0])}" alt="${Utils.escapeHtml(product.name)}" onerror="this.onerror=null; this.src='${Utils.fallbackImage}';" /></div>
        </a>
        <div class="body">
          <span class="brand">${Utils.escapeHtml(product.brand)}</span>
          <a href="product.html?id=${product._id}"><h4>${Utils.escapeHtml(product.name)}</h4></a>
          <div class="price-row"><span class="price">${Utils.formatPrice(product.finalPrice)}</span></div>
          <div class="flex gap-2" style="margin-top:var(--space-3);">
            <button class="btn btn-primary btn-sm" style="flex:1;" data-move="${product._id}">Move to cart</button>
            <button class="btn btn-outline btn-sm" data-remove="${product._id}">Remove</button>
          </div>
        </div>
      </div>`
      )
      .join('');

    mount.addEventListener('click', async (e) => {
      const moveBtn = e.target.closest('[data-move]');
      const removeBtn = e.target.closest('[data-remove]');
      try {
        if (moveBtn) {
          await Api.post(`/wishlist/${moveBtn.dataset.move}/move-to-cart`, {}, true);
          Utils.showToast('Moved to cart', 'success');
        } else if (removeBtn) {
          await Api.del(`/wishlist/${removeBtn.dataset.remove}`, true);
          Utils.showToast('Removed from wishlist', 'success');
        } else {
          return;
        }
        await loadWishlist();
        updateHeaderCounts();
      } catch (err) {
        Utils.showToast(err.message, 'error');
      }
    });
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
}
