const Product = require('../models/Product');

// ---- AI Feature: Shopping Assistant Chatbot ----
//
// This calls the real Anthropic Claude API (api.anthropic.com), using
// YOUR OWN API key stored in server/.env as ANTHROPIC_API_KEY.
// Get a free key at https://console.anthropic.com
//
// How it works (function-calling / RAG-lite pattern):
//   1. User sends a message, e.g. "I need running shoes under $100"
//   2. We fetch a relevant slice of our OWN product catalog from MongoDB
//   3. We inject that catalog data into Claude's system prompt as context
//   4. Claude answers using ONLY that real data — not making products up
//
// This is a simplified version of "Retrieval-Augmented Generation" (RAG):
// grounding an LLM's answer in your own real data instead of letting it
// rely purely on what it was trained on.
exports.chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      res.status(400);
      throw new Error('Message is required');
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(503);
      throw new Error(
        'AI assistant is not configured. Add ANTHROPIC_API_KEY to server/.env to enable it.'
      );
    }

    // Pull a snapshot of the catalog to ground the assistant's answers.
    // Keeping this small (name, price, brand, category, stock) keeps the
    // request cheap and fast instead of sending full product documents.
    const products = await Product.find()
      .populate('category', 'name')
      .select('name price discount brand stock rating category')
      .limit(60);

    const catalogSummary = products
      .map(
        (p) =>
          `- ${p.name} | brand: ${p.brand} | category: ${p.category?.name || 'N/A'} | price: $${p.price} (${p.discount}% off) | stock: ${p.stock} | rating: ${p.rating}`
      )
      .join('\n');

    const systemPrompt = `You are a helpful shopping assistant for an e-commerce store.
Only recommend products from the CATALOG below — never invent products that aren't listed.
Keep replies short (2-4 sentences), friendly, and specific (mention real product names and prices).
If nothing in the catalog fits the request, say so honestly and suggest the closest options.

CATALOG:
${catalogSummary}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 300,
        system: systemPrompt,
        messages: [...history, { role: 'user', content: message }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      res.status(502);
      throw new Error('AI assistant is temporarily unavailable');
    }

    const data = await response.json();
    const reply = data.content?.find((block) => block.type === 'text')?.text || '';

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};
