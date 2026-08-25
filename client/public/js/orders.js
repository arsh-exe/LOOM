/* ==========================================================================
   ORDERS PAGE — the logged-in user's own order history.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();
  initAiChatWidget();

  if (!Auth.requireLogin('pages/login.html')) return;

  const mount = document.getElementById('orders-mount');
  mount.innerHTML = `<div class="spinner"></div>`;

  try {
    const orders = await Api.get('/orders', true);

    if (orders.length === 0) {
      mount.innerHTML = emptyStateHtml('No orders yet', 'Once you place an order, it will show up here.');
      return;
    }

    mount.innerHTML = orders
      .map(
        (o) => `
      <div class="card order-card">
        <div class="order-head">
          <div>
            <div class="order-id">Order #${o._id.slice(-8).toUpperCase()}</div>
            <div class="text-muted" style="font-size:0.82rem;">${Utils.formatDate(o.createdAt)}</div>
          </div>
          <span class="status-pill status-${o.status}">${o.status}</span>
        </div>
        ${o.items
          .map(
            (item) => `
          <div class="order-item-row">
            <img src="${item.image || Utils.fallbackImage}" alt="${Utils.escapeHtml(item.name)}" />
            <div style="flex:1;">${Utils.escapeHtml(item.name)} × ${item.quantity}</div>
            <span class="price">${Utils.formatPrice(item.price * item.quantity)}</span>
          </div>`
          )
          .join('')}
        <div class="summary-row total" style="margin-top:var(--space-3);">
          <span>Total</span><span class="price">${Utils.formatPrice(o.totalPrice)}</span>
        </div>
      </div>`
      )
      .join('');
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
});
