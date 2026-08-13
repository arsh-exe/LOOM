/* ==========================================================================
   ADMIN DASHBOARD — stats, product CRUD, order status management, users.
   All requests here hit /api/admin/* or admin-only product endpoints,
   protected server-side by the protect + admin middleware.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  window.__pagePrefix = '../';
  renderNavbar();
  renderFooter();

  if (!Auth.requireAdmin()) return;

  const section = Utils.getQueryParams().section || 'dashboard';
  document.querySelectorAll('.admin-sidebar a').forEach((a) => {
    a.classList.toggle('active', a.dataset.section === section);
  });

  document.querySelectorAll('.admin-sidebar a').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      Utils.setQueryParams({ section: a.dataset.section });
      window.location.reload();
    });
  });

  if (section === 'dashboard') await loadDashboard();
  if (section === 'products') await loadAdminProducts();
  if (section === 'orders') await loadAdminOrders();
  if (section === 'users') await loadAdminUsers();

  document.querySelectorAll('.admin-panel').forEach((panel) => {
    panel.style.display = panel.dataset.panel === section ? 'block' : 'none';
  });
});

async function loadDashboard() {
  const mount = document.getElementById('dashboard-mount');
  try {
    const stats = await Api.get('/admin/dashboard', true);
    mount.innerHTML = `
      <div class="stat-grid">
        <div class="card stat-card"><div class="value">$${stats.totalRevenue}</div><div class="label">Total Revenue</div></div>
        <div class="card stat-card"><div class="value">${stats.totalOrders}</div><div class="label">Total Orders</div></div>
        <div class="card stat-card"><div class="value">${stats.totalUsers}</div><div class="label">Total Users</div></div>
        <div class="card stat-card"><div class="value">${stats.totalProducts}</div><div class="label">Total Products</div></div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:var(--space-5);">
        <div class="card" style="padding:var(--space-5);">
          <h3>Recent Orders</h3>
          <table class="admin-table">
            <thead><tr><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>${stats.recentOrders.map((o) => `<tr><td>${Utils.escapeHtml(o.user?.name || '—')}</td><td class="price">${Utils.formatPrice(o.totalPrice)}</td><td><span class="status-pill status-${o.status}">${o.status}</span></td></tr>`).join('')}</tbody>
          </table>
        </div>
        <div class="card" style="padding:var(--space-5);">
          <h3>Best Sellers</h3>
          <table class="admin-table">
            <thead><tr><th>Product</th><th>Units Sold</th></tr></thead>
            <tbody>${stats.bestSellers.map((b) => `<tr><td>${Utils.escapeHtml(b.name)}</td><td class="price">${b.totalSold}</td></tr>`).join('')}</tbody>
          </table>
        </div>
      </div>`;
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
}

async function loadAdminProducts() {
  const mount = document.getElementById('products-mount');
  try {
    const { products } = await Api.get('/products?limit=100');
    mount.innerHTML = `
      <div class="admin-toolbar">
        <h2 class="mt-0">Products</h2>
        <button class="btn btn-primary btn-sm" id="new-product-btn">+ Add Product</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Brand</th><th>Price</th><th>Stock</th><th>Rating</th><th></th></tr></thead>
        <tbody>
          ${products
            .map(
              (p) => `
            <tr>
              <td>${Utils.escapeHtml(p.name)}</td>
              <td>${Utils.escapeHtml(p.brand)}</td>
              <td class="price">${Utils.formatPrice(p.price)}</td>
              <td>${p.stock}</td>
              <td>${p.rating.toFixed(1)}</td>
              <td><button class="btn btn-outline btn-sm" data-edit="${p._id}">Edit</button> <button class="btn btn-danger btn-sm" data-delete="${p._id}">Delete</button></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`;

    document.getElementById('new-product-btn').addEventListener('click', () => openProductModal());
    mount.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-edit]');
      const deleteBtn = e.target.closest('[data-delete]');
      if (editBtn) {
        const product = products.find((p) => p._id === editBtn.dataset.edit);
        openProductModal(product);
      }
      if (deleteBtn) {
        if (!confirm('Delete this product?')) return;
        try {
          await Api.del(`/products/${deleteBtn.dataset.delete}`, true);
          Utils.showToast('Product deleted', 'success');
          loadAdminProducts();
        } catch (err) {
          Utils.showToast(err.message, 'error');
        }
      }
    });
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
}

async function openProductModal(product = null) {
  const categories = await Api.get('/categories');
  const isEdit = !!product;

  const formHtml = `
    <div id="product-modal-backdrop" style="position:fixed; inset:0; background:rgba(16,21,31,0.5); z-index:1000; display:flex; align-items:center; justify-content:center; padding:var(--space-4);">
      <div class="card" style="max-width:480px; width:100%; padding:var(--space-6); max-height:88vh; overflow-y:auto;">
        <h3>${isEdit ? 'Edit' : 'Add'} Product</h3>
        <form id="product-form">
          <div class="field"><label>Name</label><input id="pf-name" value="${product ? Utils.escapeHtml(product.name) : ''}" required /></div>
          <div class="field"><label>Description</label><textarea id="pf-desc" required>${product ? Utils.escapeHtml(product.description) : ''}</textarea></div>
          <div class="field-row">
            <div class="field"><label>Price</label><input id="pf-price" type="number" step="0.01" value="${product?.price ?? ''}" required /></div>
            <div class="field"><label>Discount %</label><input id="pf-discount" type="number" value="${product?.discount ?? 0}" /></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Brand</label><input id="pf-brand" value="${product ? Utils.escapeHtml(product.brand) : ''}" required /></div>
            <div class="field"><label>Stock</label><input id="pf-stock" type="number" value="${product?.stock ?? 0}" required /></div>
          </div>
          <div class="field">
            <label>Category</label>
            <select id="pf-category">${categories.map((c) => `<option value="${c._id}" ${product?.category?._id === c._id ? 'selected' : ''}>${Utils.escapeHtml(c.name)}</option>`).join('')}</select>
          </div>
          <div class="field"><label>Image URL</label><input id="pf-image" value="${product?.images?.[0] || ''}" placeholder="https://..." /></div>
          <div class="flex gap-2" style="margin-top:var(--space-4);">
            <button type="submit" class="btn btn-primary" style="flex:1;">${isEdit ? 'Save Changes' : 'Create Product'}</button>
            <button type="button" class="btn btn-outline" id="cancel-modal-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', formHtml);
  document.getElementById('cancel-modal-btn').addEventListener('click', () => document.getElementById('product-modal-backdrop').remove());

  document.getElementById('product-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      name: document.getElementById('pf-name').value,
      description: document.getElementById('pf-desc').value,
      price: Number(document.getElementById('pf-price').value),
      discount: Number(document.getElementById('pf-discount').value),
      brand: document.getElementById('pf-brand').value,
      stock: Number(document.getElementById('pf-stock').value),
      category: document.getElementById('pf-category').value,
      images: [document.getElementById('pf-image').value].filter(Boolean),
    };
    try {
      if (isEdit) {
        await Api.put(`/products/${product._id}`, payload, true);
      } else {
        await Api.post('/products', payload, true);
      }
      Utils.showToast(`Product ${isEdit ? 'updated' : 'created'}`, 'success');
      document.getElementById('product-modal-backdrop').remove();
      loadAdminProducts();
    } catch (err) {
      Utils.showToast(err.message, 'error');
    }
  });
}

async function loadAdminOrders() {
  const mount = document.getElementById('orders-admin-mount');
  const statuses = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
  try {
    const orders = await Api.get('/admin/orders', true);
    mount.innerHTML = `
      <h2 class="mt-0">All Orders</h2>
      <table class="admin-table">
        <thead><tr><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          ${orders
            .map(
              (o) => `
            <tr>
              <td>${Utils.escapeHtml(o.user?.name || '—')}</td>
              <td>${Utils.formatDate(o.createdAt)}</td>
              <td class="price">${Utils.formatPrice(o.totalPrice)}</td>
              <td><select data-order-id="${o._id}">${statuses.map((s) => `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select></td>
            </tr>`
            )
            .join('')}
        </tbody>
      </table>`;

    mount.querySelectorAll('select[data-order-id]').forEach((select) => {
      select.addEventListener('change', async () => {
        try {
          await Api.put(`/admin/orders/${select.dataset.orderId}/status`, { status: select.value }, true);
          Utils.showToast('Order status updated', 'success');
        } catch (err) {
          Utils.showToast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
}

async function loadAdminUsers() {
  const mount = document.getElementById('users-mount');
  try {
    const users = await Api.get('/admin/users', true);
    mount.innerHTML = `
      <h2 class="mt-0">Users</h2>
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
        <tbody>${users.map((u) => `<tr><td>${Utils.escapeHtml(u.name)}</td><td>${Utils.escapeHtml(u.email)}</td><td>${u.role}</td><td>${Utils.formatDate(u.createdAt)}</td></tr>`).join('')}</tbody>
      </table>`;
  } catch (err) {
    mount.innerHTML = errorStateHtml(err.message);
  }
}
