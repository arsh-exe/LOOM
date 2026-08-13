/* ==========================================================================
   AI CHAT WIDGET — a floating shopping-assistant chat bubble on every page.
   Talks to POST /api/ai/chat, which itself calls the Anthropic API on the
   backend (grounded in the real product catalog — see aiController.js).
   ========================================================================== */

let chatHistory = []; // { role: 'user'|'assistant', content: '...' }[]

function initAiChatWidget() {
  const mount = document.getElementById('ai-chat-mount');
  if (!mount) return;

  mount.innerHTML = `
    <button id="ai-chat-toggle" aria-label="Open shopping assistant">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    </button>
    <div id="ai-chat-panel">
      <div class="ai-chat-head">
        <div>
          <div class="title">Shopping Assistant</div>
          <div class="sub">AI · grounded in our live catalog</div>
        </div>
      </div>
      <div class="ai-chat-messages" id="ai-chat-messages">
        <div class="ai-msg assistant">Hi! Tell me what you're looking for — a budget, a category, a use case — and I'll point you to real products from our catalog.</div>
      </div>
      <div class="ai-chat-input-row">
        <input type="text" id="ai-chat-input" placeholder="e.g. running shoes under $100" />
        <button id="ai-chat-send" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m22 2-7 20-4-9-9-4Z"/></svg>
        </button>
      </div>
    </div>
  `;

  const toggleBtn = document.getElementById('ai-chat-toggle');
  const panel = document.getElementById('ai-chat-panel');
  const input = document.getElementById('ai-chat-input');
  const sendBtn = document.getElementById('ai-chat-send');

  toggleBtn.addEventListener('click', () => panel.classList.toggle('open'));

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    appendChatMessage('user', message);
    input.value = '';

    const messagesEl = document.getElementById('ai-chat-messages');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'ai-msg assistant';
    loadingEl.textContent = '...';
    messagesEl.appendChild(loadingEl);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    try {
      const { reply } = await Api.post('/ai/chat', { message, history: chatHistory });
      loadingEl.remove();
      appendChatMessage('assistant', reply);
    } catch (err) {
      loadingEl.remove();
      appendChatMessage('assistant', `Sorry, I'm unavailable right now. (${err.message})`);
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
}

function appendChatMessage(role, text) {
  chatHistory.push({ role, content: text });
  const messagesEl = document.getElementById('ai-chat-messages');
  const el = document.createElement('div');
  el.className = `ai-msg ${role}`;
  el.textContent = text;
  messagesEl.appendChild(el);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}
