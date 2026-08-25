/* ==========================================================================
   API — a thin wrapper around fetch() that every page uses to talk to
   the backend. Centralizing this in one place means:
     - the base URL only needs to change in one spot
     - the JWT token is attached automatically to every request
     - error handling (reading the {message} the backend sends back) is
       consistent everywhere instead of repeated in every page's JS
   ========================================================================== */

function getApiBaseUrls() {
  const hostCandidates = [];
  const currentHost = window.location.hostname;

  if (currentHost && currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    hostCandidates.push(`http://${currentHost}:5000/api`);
  }

  hostCandidates.push(
    'http://localhost:5000/api',
    'http://127.0.0.1:5000/api',
    'http://localhost:5001/api',
    'http://127.0.0.1:5001/api'
  );

  return [...new Set(hostCandidates)];
}

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

    let lastError = null;

    for (const baseUrl of getApiBaseUrls()) {
      try {
        const response = await fetch(`${baseUrl}${path}`, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
        });

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
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError || new Error('Unable to reach the LOOM API. Make sure the backend is running on port 5000.');
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
