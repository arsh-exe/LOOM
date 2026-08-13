/* ==========================================================================
   LOGIN / REGISTER PAGE LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('login-error');
      errorEl.textContent = '';
      const btn = loginForm.querySelector('button[type="submit"]');
      btn.disabled = true;

      try {
        await Auth.login(
          document.getElementById('login-email').value,
          document.getElementById('login-password').value
        );
        const redirect = Utils.getQueryParams().redirect;
        window.location.href = redirect ? decodeURIComponent(redirect) : '../index.html';
      } catch (err) {
        errorEl.textContent = err.message;
        btn.disabled = false;
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const errorEl = document.getElementById('register-error');
      errorEl.textContent = '';
      const btn = registerForm.querySelector('button[type="submit"]');

      const password = document.getElementById('register-password').value;
      const confirm = document.getElementById('register-confirm').value;
      if (password !== confirm) {
        errorEl.textContent = 'Passwords do not match';
        return;
      }

      btn.disabled = true;
      try {
        await Auth.register(
          document.getElementById('register-name').value,
          document.getElementById('register-email').value,
          password
        );
        window.location.href = '../index.html';
      } catch (err) {
        errorEl.textContent = err.message;
        btn.disabled = false;
      }
    });
  }
});
