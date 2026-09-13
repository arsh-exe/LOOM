'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

export default function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I can help you find products that match your style, budget, or category.' },
  ]);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: 'user', text: trimmed }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history: nextMessages.map((msg) => ({ role: msg.role, content: msg.text })) }),
      });

      const data = await res.json();
      const reply = data.reply || 'I could not get an answer right now.';
      const products = Array.isArray(data.products) ? data.products : [];

      setMessages((prev) => [...prev, { role: 'assistant', text: reply }]);
      setMatches(products);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', text: 'I could not reach the AI assistant right now. Please try again in a moment.' }]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 50 }}>
      {open && (
        <div style={{ width: 360, background: 'rgba(255,255,255,0.98)', border: '1px solid rgba(26,26,26,0.08)', borderRadius: 20, boxShadow: '0 24px 60px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'linear-gradient(135deg, #5e705a, #7e8f75)', color: '#fff' }}>
            <strong>AI Shopping Assistant</strong>
            <button type="button" onClick={() => setOpen(false)} style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>

          <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto', background: '#f9f6f2' }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ alignSelf: msg.role === 'assistant' ? 'flex-start' : 'flex-end', maxWidth: '90%', padding: '10px 12px', borderRadius: 14, background: msg.role === 'assistant' ? '#eaf1e9' : '#5e705a', color: msg.role === 'assistant' ? '#1f1f1f' : '#fff', lineHeight: 1.5 }}>
                {msg.text}
              </div>
            ))}

            {matches.length > 0 && (
              <div style={{ display: 'grid', gap: 8, marginTop: 4 }}>
                {matches.map((product) => (
                  <a key={product._id} href={`/product/${product._id}`} style={{ display: 'flex', gap: 8, alignItems: 'center', background: '#fff', border: '1px solid rgba(26,26,26,0.08)', borderRadius: 12, padding: 8, color: '#1f1f1f', textDecoration: 'none' }}>
                    <img src={product.images?.[0] || '/assets/products-images/p_img1.png'} alt={product.name} style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }} />
                    <span style={{ flex: 1, fontSize: 12 }}>
                      <strong style={{ display: 'block', marginBottom: 2 }}>{product.name}</strong>
                      <span style={{ color: '#5b5b5b' }}>${Number(product.price).toFixed(2)}</span>
                    </span>
                  </a>
                ))}
              </div>
            )}

            {loading && <div style={{ color: '#5b5b5b', fontSize: 12 }}>Thinking...</div>}
          </div>

          <div style={{ display: 'flex', gap: 8, padding: 12, borderTop: '1px solid rgba(26,26,26,0.08)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for shirts, women’s wear..."
              style={{ flex: 1, border: '1px solid rgba(26,26,26,0.1)', borderRadius: 12, padding: '10px 12px' }}
            />
            <button type="button" onClick={handleSend} disabled={loading} className="primary-btn" style={{ padding: '10px 14px', borderRadius: 12 }}>
              Ask
            </button>
          </div>
        </div>
      )}

      {!open && (
        <button type="button" onClick={() => setOpen(true)} className="primary-btn" style={{ borderRadius: 999, padding: '14px 18px', boxShadow: '0 20px 30px rgba(94,112,90,0.25)' }}>
          AI Assistant
        </button>
      )}
    </div>
  );
}
