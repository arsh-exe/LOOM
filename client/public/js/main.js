/* ==========================================================================
   MAIN — homepage-only logic: loads categories + featured products from
   the real API (replacing the old hardcoded array).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = ''; // homepage is at the root
  renderNavbar();
  renderFooter();
  initAiChatWidget();

  const categoryGrid = document.getElementById('category-grid');
  const featuredGrid = document.getElementById('featured-grid');
  const bestSellerGrid = document.getElementById('bestseller-grid');

  bindProductCardEvents(document.body);

  // ---- Categories ----
  try {
    const categories = await Api.get('/categories');
    categoryGrid.innerHTML = categories
      .map(
        (c) => `
        <a href="pages/shop.html?category=${encodeURIComponent(c.slug || c._id)}" class="category-card">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M3 9h18M9 21V9"/></svg>
          <span>${Utils.escapeHtml(c.name)}</span>
        </a>`
      )
      .join('');
  } catch (err) {
    categoryGrid.innerHTML = errorStateHtml('Could not load categories');
  }

  // ---- Featured products (newest) ----
  try {
    const { products } = await Api.get('/products?sort=newest&limit=8');
    featuredGrid.innerHTML = products.length
      ? products.map((p) => productCardHtml(p)).join('')
      : emptyStateHtml('No products yet', 'Run the seed script on the backend to populate the catalog.');
  } catch (err) {
    featuredGrid.innerHTML = errorStateHtml(err.message);
  }

  // ---- Best sellers (highest rated, standing in for "best selling" pre-launch) ----
  try {
    const { products } = await Api.get('/products?sort=rating&limit=4');
    bestSellerGrid.innerHTML = products.length
      ? products.map((p) => productCardHtml(p)).join('')
      : emptyStateHtml('No products yet', '');
  } catch (err) {
    bestSellerGrid.innerHTML = errorStateHtml(err.message);
  }
});
