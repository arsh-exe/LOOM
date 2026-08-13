/* ==========================================================================
   CART PAGE — renders the cart, and handles quantity changes / removal.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();
  initAiChatWidget();

  if (!Auth.requireLogin('login.html')) return;

  await loadCart();
});

async function loadCart() {
  const itemsMount = document.getElementById('cart-items');
  const summaryMount = document.getElementById('cart-summary');

  itemsMount.innerHTML = `<div class="spinner"></div>`;

  try {
    const cart = await Api.get('/cart', true);

    if (cart.items.length === 0) {
      itemsMount.innerHTML = emptyStateHtml('Your cart is empty', 'Browse the shop and add something you like.');
      summaryMount.innerHTML = '';
      return;
    }

    itemsMount.innerHTML = cart.items
      .map(
        (item) => `
      <div class="cart-item" data-product-id="${item.product._id}">
        <img src="${item.product.images?.[0] || Utils.fallbackImage}" alt="${Utils.escapeHtml(item.product.name)}" />
        <div>
          <div class="name">${Utils.escapeHtml(item.product.name)}</div>
          <div class="text-muted" style="font-size:0.82rem;">${Utils.escapeHtml(item.product.brand)}</div>
          ${item.outOfStock ? `<div class="oos-flag">Only ${item.product.stock} left in stock</div>` : ''}
          <button class="remove-btn" data-remove="${item.product._id}">Remove</button>
        </div>
        <div class="qty-selector">
          <button data-qty-down="${item.product._id}">−</button>
          <span>${item.quantity}</span>
          <button data-qty-up="${item.product._id}">+</button>
        </div>
        <div class="line-total price">${Utils.formatPrice(item.lineTotal)}</div>
      </div>`
      )
      .join('');

    summaryMount.innerHTML = `
      <div class="card summary-card">
        <h3>Order Summary</h3>
        <div class="summary-row"><span>Subtotal</span><span class="price">${Utils.formatPrice(cart.subtotal)}</span></div>
        <div class="summary-row"><span>Shipping</span><span class="text-muted">Calculated at checkout</span></div>
        <div class="summary-row total"><span>Estimated total</span><span class="price">${Utils.formatPrice(cart.subtotal)}</span></div>
        <a href="checkout.html" class="btn btn-primary btn-block">Proceed to Checkout</a>
      </div>`;

    bindCartEvents();
  } catch (err) {
    itemsMount.innerHTML = errorStateHtml(err.message);
  }
}

function bindCartEvents() {
  document.getElementById('cart-items').addEventListener('click', async (e) => {
    const upBtn = e.target.closest('[data-qty-up]');
    const downBtn = e.target.closest('[data-qty-down]');
    const removeBtn = e.target.closest('[data-remove]');

    try {
      if (removeBtn) {
        await Api.del(`/cart/${removeBtn.dataset.remove}`, true);
        Utils.showToast('Removed from cart', 'success');
      } else if (upBtn || downBtn) {
        const productId = (upBtn || downBtn).dataset.qtyUp || (upBtn || downBtn).dataset.qtyDown;
        const row = e.target.closest('.cart-item');
        const currentQty = Number(row.querySelector('.qty-selector span').textContent);
        const newQty = upBtn ? currentQty + 1 : currentQty - 1;

        if (newQty < 1) {
          await Api.del(`/cart/${productId}`, true);
        } else {
          await Api.put(`/cart/${productId}`, { quantity: newQty }, true);
        }
      } else {
        return;
      }

      await loadCart();
      updateHeaderCounts();
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });
}
