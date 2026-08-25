/* ==========================================================================
   UTILS — small shared helpers used across every page.
   Loaded as a plain <script> (no bundler), so everything here attaches
   to the global `Utils` object instead of using ES module import/export.
   ========================================================================== */

const Utils = {
  // Format a number as INR, e.g. 12999 -> "₹12,999.00"
  formatPrice(value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
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

  // Convert raw asset paths into browser-safe URLs, especially for names
  // containing spaces, accents, or special characters like '#'.
  normalizeImageUrl(url, fallbackImage = '/assets/products-images/p_img1.png') {
    if (!url) return fallbackImage;

    try {
      const encodeAssetSegment = (segment) => {
        const converted = Array.from(segment)
          .map((character) => {
            const code = character.codePointAt(0);
            return code > 0x7f ? `#U${code.toString(16).padStart(4, '0')}` : character;
          })
          .join('');

        return encodeURIComponent(converted);
      };

      if (/^https?:\/\//i.test(url)) {
        const parsed = new URL(url);
        parsed.pathname = parsed.pathname
          .split('/')
          .map((segment) => encodeAssetSegment(decodeURIComponent(segment)))
          .join('/');
        return parsed.toString();
      }

      return url
        .split('/')
        .map((segment) => encodeAssetSegment(decodeURIComponent(segment)))
        .join('/');
    } catch {
      return url || fallbackImage;
    }
  },

  // Placeholder image if a product somehow has no images array
  fallbackImage: '/assets/products-images/p_img1.png',
};
