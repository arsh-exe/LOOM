/* ==========================================================================
   UTILS — small shared helpers used across every page.
   Loaded as a plain <script> (no bundler), so everything here attaches
   to the global `Utils` object instead of using ES module import/export.
   ========================================================================== */

const Utils = {
  // Format a number as currency, e.g. 49.9 -> "$49.90"
  formatPrice(value) {
    return `$${Number(value).toFixed(2)}`;
  },

  // Turn "2024-06-01T10:00:00Z" into "Jun 1, 2024"
  formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  },

  // Render a 5-star rating as a string, e.g. rating=3.5 -> "★★★☆☆"
  renderStars(rating) {
    const full = Math.round(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  },

  // Read/write the current query string as a plain object, e.g.
  // ?category=abc&sort=price_asc -> { category: 'abc', sort: 'price_asc' }
  getQueryParams() {
    return Object.fromEntries(new URLSearchParams(window.location.search));
  },
  setQueryParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        url.searchParams.delete(key);
      } else {
        url.searchParams.set(key, value);
      }
    });
    window.history.replaceState({}, '', url);
  },

  // Toast notifications — small popups in the corner for success/error feedback.
  // Requires a <div id="toast-container"></div> to exist in the page (see partials).
  showToast(message, type = 'default') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  },

  // Escape user-generated text before inserting into innerHTML, to avoid
  // basic XSS via review comments, product names typed by an admin, etc.
  escapeHtml(str = '') {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Debounce: wait until the user stops typing/scrolling for `delay`ms
  // before actually running `fn`. Used for the live search box.
  debounce(fn, delay = 350) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  },

  // Placeholder image if a product somehow has no images array
  fallbackImage: 'https://loremflickr.com/600/600/product?lock=99',
};
