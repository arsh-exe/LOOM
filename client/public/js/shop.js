/* ==========================================================================
   SHOP PAGE — product grid driven entirely by URL query params, so
   filters/search/sort are shareable/bookmarkable links and survive a
   page refresh. See utils.js getQueryParams/setQueryParams.
   ========================================================================== */

let currentFilters = {};

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();
  initAiChatWidget();
  bindProductCardEvents(document.body);

  currentFilters = Utils.getQueryParams();
  populateFormFromFilters();
  await loadCategories();
  await loadProducts();

  document.getElementById('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    applyFiltersFromForm();
  });
  document.getElementById('sort-select').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    currentFilters.page = 1;
    syncAndReload();
  });
  document.getElementById('clear-filters').addEventListener('click', () => {
    currentFilters = {};
    document.getElementById('filter-form').reset();
    syncAndReload();
  });
});

async function loadCategories() {
  try {
    const categories = await Api.get('/categories');
    const select = document.getElementById('filter-category');
    select.innerHTML =
      `<option value="">All categories</option>` +
      categories.map((c) => `<option value="${c.slug || c._id}">${Utils.escapeHtml(c.name)}</option>`).join('');
    if (currentFilters.category) {
      const selectedValue = categories.some((c) => c.slug === currentFilters.category || c._id === currentFilters.category)
        ? currentFilters.category
        : '';
      select.value = selectedValue;
    }
  } catch (err) {
    /* non-critical */
  }
}

function populateFormFromFilters() {
  if (currentFilters.keyword) document.getElementById('filter-keyword').value = currentFilters.keyword;
  if (currentFilters.minPrice) document.getElementById('filter-min-price').value = currentFilters.minPrice;
  if (currentFilters.maxPrice) document.getElementById('filter-max-price').value = currentFilters.maxPrice;
  if (currentFilters.minRating) document.getElementById('filter-min-rating').value = currentFilters.minRating;
  if (currentFilters.inStock) document.getElementById('filter-in-stock').checked = true;
  if (currentFilters.sort) document.getElementById('sort-select').value = currentFilters.sort;
}

function applyFiltersFromForm() {
  currentFilters = {
    ...currentFilters,
    keyword: document.getElementById('filter-keyword').value || undefined,
    category: document.getElementById('filter-category').value || undefined,
    minPrice: document.getElementById('filter-min-price').value || undefined,
    maxPrice: document.getElementById('filter-max-price').value || undefined,
    minRating: document.getElementById('filter-min-rating').value || undefined,
    inStock: document.getElementById('filter-in-stock').checked ? 'true' : undefined,
    page: 1,
  };
  syncAndReload();
}

function syncAndReload() {
  Utils.setQueryParams(currentFilters);
  loadProducts();
}

async function loadProducts() {
  const grid = document.getElementById('product-grid');
  const resultsInfo = document.getElementById('results-info');
  grid.innerHTML = skeletonGridHtml();

  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(currentFilters).filter(([, v]) => v !== undefined && v !== ''))
  ).toString();

  try {
    const data = await Api.get(`/products?${query}`);

    if (data.products.length === 0) {
      grid.innerHTML = emptyStateHtml('No products match your filters', 'Try clearing some filters or searching a different term.');
      resultsInfo.textContent = '0 results';
      renderPagination(0, 1);
      return;
    }

    grid.innerHTML = data.products.map((p) => productCardHtml(p)).join('');
    resultsInfo.textContent = `${data.totalProducts} result${data.totalProducts === 1 ? '' : 's'}`;
    renderPagination(data.totalPages, data.page);
  } catch (err) {
    grid.innerHTML = errorStateHtml(err.message);
  }
}

function renderPagination(totalPages, currentPage) {
  const mount = document.getElementById('pagination');
  if (totalPages <= 1) {
    mount.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="btn ${i === currentPage ? 'btn-primary' : 'btn-outline'} btn-sm" data-page="${i}">${i}</button>`;
  }
  mount.innerHTML = html;

  mount.querySelectorAll('[data-page]').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilters.page = Number(btn.dataset.page);
      syncAndReload();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}
