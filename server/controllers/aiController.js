const Product = require('../models/Product');

function parseBudget(message) {
  const match = message.match(/(?:under|below|upto|up to|less than|max|maximum)\s*₹?\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i)
    || message.match(/₹\s*(\d+(?:,\d{3})*(?:\.\d+)?)/i)
    || message.match(/(\d+(?:,\d{3})*(?:\.\d+)?)\s*(?:rupees|inr)/i);

  if (!match) return null;
  return Number(match[1].replace(/,/g, ''));
}

function formatInr(value) {
  return `₹${Number(value).toFixed(2)}`;
}

function getCatalogFallbackReply(message, products) {
  const lower = message.toLowerCase();
  const budget = parseBudget(message);

  let filtered = [...products];

  if (lower.includes('women') || lower.includes('woman')) {
    filtered = filtered.filter((p) => /women|woman|girl|girls/i.test(p.name) || /women|woman|girl|girls/i.test(p.category?.name || ''));
  } else if (lower.includes('men') || lower.includes('man')) {
    filtered = filtered.filter((p) => /men|man|boy|boys/i.test(p.name) || /men|man|boy|boys/i.test(p.category?.name || ''));
  } else if (lower.includes('kids') || lower.includes('kid') || lower.includes('girls') || lower.includes('boys')) {
    filtered = filtered.filter((p) => /girl|girls|boy|boys|kid|kids/i.test(p.name) || /girl|girls|boy|boys|kid|kids/i.test(p.category?.name || ''));
  }

  if (budget !== null) {
    filtered = filtered.filter((p) => Number(p.price) <= budget || Number(p.finalPrice ?? p.price) <= budget);
  }

  if (!filtered.length) {
    const closest = products.slice(0, 3).map((p) => `${p.name} (${formatInr(p.finalPrice ?? p.price)})`).join(', ');
    return `I don’t see a direct match for “${message}” in the live catalog right now. Closest options are ${closest}.`;
  }

  const picks = filtered.slice(0, 3).map((p) => `${p.name} (${formatInr(p.finalPrice ?? p.price)})`);

  if (budget !== null) {
    return `I found a few options under ${formatInr(budget)}: ${picks.join('; ')}.`;
  }

  return `I found a few options for “${message}”: ${picks.join('; ')}.`;
}

// ---- AI Feature: Shopping Assistant Chatbot ----
//
// The app supports Groq by default (keys begin with gsk_), while also
// keeping Anthropic as a fallback for compatibility.
//
// The request is grounded in the real catalog, and if the external LLM
// provider is unavailable, we fall back to a local catalog-based response.
exports.chatWithAssistant = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      res.status(400);
      throw new Error('Message is required');
    }

    const groqKey = process.env.GROQ_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    const products = await Product.find()
      .populate('category', 'name')
      .select('name price discount brand stock rating category')
      .limit(60);

    const catalogSummary = products
      .map(
        (p) =>
          `- ${p.name} | brand: ${p.brand} | category: ${p.category?.name || 'N/A'} | price: ₹${Number(p.price).toFixed(2)} (${p.discount}% off) | stock: ${p.stock} | rating: ${p.rating}`
      )
      .join('\n');

    const systemPrompt = `You are a helpful shopping assistant for an e-commerce store.
Only recommend products from the CATALOG below — never invent products that aren't listed.
Keep replies short (2-4 sentences), friendly, and specific (mention real product names and prices).
If nothing in the catalog fits the request, say so honestly and suggest the closest options.

CATALOG:
${catalogSummary}`;

    let reply = '';

    const tryProvider = async () => {
      if (groqKey) {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 300,
            messages: [
              { role: 'system', content: systemPrompt },
              ...history,
              { role: 'user', content: message },
            ],
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error('Groq API error:', errText);
          throw new Error('AI provider unavailable');
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
      }

      if (anthropicKey) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
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
          throw new Error('AI provider unavailable');
        }

        const data = await response.json();
        return data.content?.find((block) => block.type === 'text')?.text || '';
      }

      return '';
    };

    try {
      if (groqKey || anthropicKey) {
        reply = await tryProvider();
      }
    } catch (error) {
      console.warn('AI provider failed, using catalog fallback:', error.message);
      reply = getCatalogFallbackReply(message, products);
    }

    if (!reply) {
      reply = getCatalogFallbackReply(message, products);
    }

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};
