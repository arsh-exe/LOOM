/* ==========================================================================
   PROFILE PAGE — view/update name + shipping address.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();
  initAiChatWidget();

  if (!Auth.requireLogin('login.html')) return;

  try {
    const me = await Api.get('/auth/me', true);
    document.getElementById('profile-name').value = me.name;
    document.getElementById('profile-email').value = me.email;
    if (me.shippingAddress) {
      document.getElementById('profile-street').value = me.shippingAddress.street || '';
      document.getElementById('profile-city').value = me.shippingAddress.city || '';
      document.getElementById('profile-state').value = me.shippingAddress.state || '';
      document.getElementById('profile-postal').value = me.shippingAddress.postalCode || '';
      document.getElementById('profile-country').value = me.shippingAddress.country || '';
    }
  } catch (err) {
    Utils.showToast(err.message, 'error');
  }

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const updated = await Api.put(
        '/auth/me',
        {
          name: document.getElementById('profile-name').value,
          shippingAddress: {
            street: document.getElementById('profile-street').value,
            city: document.getElementById('profile-city').value,
            state: document.getElementById('profile-state').value,
            postalCode: document.getElementById('profile-postal').value,
            country: document.getElementById('profile-country').value,
          },
        },
        true
      );
      const stored = Auth.getUser();
      stored.name = updated.name;
      localStorage.setItem('user', JSON.stringify(stored));
      Utils.showToast('Profile updated', 'success');
      renderNavAccount();
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });
});
