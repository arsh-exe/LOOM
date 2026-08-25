/* ==========================================================================
   CHECKOUT PAGE — shipping address form + order summary, submits to
   POST /api/orders (which converts the cart into an Order server-side).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();
  initAiChatWidget();

  if (!Auth.requireLogin('pages/login.html')) return;

  await loadCheckoutSummary();
  prefillAddress();

  document.getElementById('checkout-form').addEventListener('submit', handlePlaceOrder);
});

let checkoutCart = null;

async function loadCheckoutSummary() {
  const mount = document.getElementById('checkout-summary');
  try {
    checkoutCart = await Api.get('/cart', true);

    if (checkoutCart.items.length === 0) {
      Utils.showToast('Your cart is empty', 'error');
      window.location.href = 'cart.html';
      return;
    }

    const shipping = checkoutCart.subtotal >= 75 ? 0 : 5.99;
    const total = checkoutCart.subtotal + shipping;

    mount.innerHTML = `
      ${checkoutCart.items
        .map(
          (i) => `
        <div class="checkout-summary-item">
          <span>${Utils.escapeHtml(i.product.name)} × ${i.quantity}</span>
          <span class="price">${Utils.formatPrice(i.lineTotal)}</span>
        </div>`
        )
        .join('')}
      <div class="summary-row" style="margin-top:var(--space-4); border-top:1px solid var(--color-border); padding-top:var(--space-3);">
        <span>Subtotal</span><span class="price">${Utils.formatPrice(checkoutCart.subtotal)}</span>
      </div>
      <div class="summary-row"><span>Shipping</span><span class="price">${shipping === 0 ? 'Free' : Utils.formatPrice(shipping)}</span></div>
      <div class="summary-row total"><span>Total</span><span class="price">${Utils.formatPrice(total)}</span></div>
    `;
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
}

function prefillAddress() {
  const user = Auth.getUser();
  // We don't store address in the lightweight localStorage user object,
  // so this is mostly a placeholder for where you'd prefill from a
  // GET /api/auth/me call if you want to save the user a step next time.
}

async function handlePlaceOrder(e) {
  e.preventDefault();
  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.textContent = 'Placing order...';

  const shippingAddress = {
    street: document.getElementById('addr-street').value,
    city: document.getElementById('addr-city').value,
    state: document.getElementById('addr-state').value,
    postalCode: document.getElementById('addr-postal').value,
    country: document.getElementById('addr-country').value,
  };
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;

  try {
    const order = await Api.post('/orders', { shippingAddress, paymentMethod }, true);
    Utils.showToast('Order placed!', 'success');
    window.location.href = `orders.html?justPlaced=${order._id}`;
  } catch (err) {
    Utils.showToast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Place Order';
  }
}
