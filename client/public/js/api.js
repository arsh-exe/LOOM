/* ==========================================================================
   API — a thin wrapper around fetch() that every page uses to talk to
   the backend. Centralizing this in one place means:
     - the base URL only needs to change in one spot
     - the JWT token is attached automatically to every request
     - error handling (reading the {message} the backend sends back) is
       consistent everywhere instead of repeated in every page's JS
   ========================================================================== */

const API_BASE_URL = 'http://localhost:5000/api';

const Api = {
  // Reads the JWT saved at login time (see auth.js)
  getToken() {
    return localStorage.getItem('token');
  },

  // Core request function. All the methods below (get/post/put/del) call this.
  async request(path, { method = 'GET', body, auth = false } = {}) {
    const headers = { 'Content-Type': 'application/json' };

    if (auth) {
      const token = this.getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // The backend's errorHandler middleware always returns { message: '...' }
    // on failure, so we can extract a readable error message consistently.
    let data;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const message = data?.message || `Request failed (${response.status})`;
      throw new Error(message);
    }

    return data;
  },

  get(path, auth = false) {
    return this.request(path, { method: 'GET', auth });
  },
  post(path, body, auth = false) {
    return this.request(path, { method: 'POST', body, auth });
  },
  put(path, body, auth = false) {
    return this.request(path, { method: 'PUT', body, auth });
  },
  del(path, auth = false) {
    return this.request(path, { method: 'DELETE', auth });
  },
};
