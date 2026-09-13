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

function pickMatchingProducts(message, products) {
  const lower = message.toLowerCase();
  const budget = parseBudget(message);

  let filtered = [...products];

  if (/(women|woman|female)/i.test(message)) {
    filtered = filtered.filter((p) => /women|woman|girl|girls/i.test(p.name) || /women|woman|girl|girls/i.test(p.category?.name || ''));
  } else if (/(men|man|male)/i.test(message)) {
    filtered = filtered.filter((p) => /men|man|boy|boys/i.test(p.name) || /men|man|boy|boys/i.test(p.category?.name || ''));
  } else if (/(kids|kid|girls|boys)/i.test(message)) {
    filtered = filtered.filter((p) => /girl|girls|boy|boys|kid|kids/i.test(p.name) || /girl|girls|boy|boys|kid|kids/i.test(p.category?.name || ''));
  }

  if (/(top|shirt|tee|t-shirt|blouse|crop)/i.test(message)) {
    filtered = filtered.filter((p) => /(top|shirt|tee|t-shirt|blouse|crop)/i.test(p.name));
  }

  if (/(pants|trouser|jeans|jacket|kurta|dress)/i.test(message)) {
    filtered = filtered.filter((p) => /(pants|trouser|jeans|jacket|kurta|dress)/i.test(p.name));
  }

  if (budget !== null) {
    filtered = filtered.filter((p) => Number(p.finalPrice ?? p.price) <= budget);
  }

  if (!filtered.length) {
    filtered = [...products];
  }

  return filtered
    .slice(0, 4)
    .map((p) => ({
      _id: String(p._id),
      name: p.name,
      brand: p.brand,
      price: Number(p.finalPrice ?? p.price),
      originalPrice: Number(p.price),
      discount: Number(p.discount || 0),
      images: p.images || [],
      category: p.category?.name || '',
      stock: p.stock,
    }));
}

function getCatalogFallbackReply(message, products) {
  const lower = message.toLowerCase();
  const budget = parseBudget(message);
  const picks = pickMatchingProducts(message, products);

  if (!picks.length) {
    return `I don’t see a direct match for “${message}” in the live catalog right now.`;
  }

  const names = picks.map((p) => `${p.name} (${formatInr(p.price)})`).join('; ');

  if (budget !== null) {
    return `I found a few options under ${formatInr(budget)}: ${names}.`;
  }

  if (lower.includes('women')) {
    return `I found these women’s picks for you: ${names}.`;
  }

  if (lower.includes('men')) {
    return `I found these men’s picks for you: ${names}.`;
  }

  return `I found a few options for “${message}”: ${names}.`;
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
      .select('name price discount brand stock rating category images')
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

    const matchedProducts = pickMatchingProducts(message, products);

    res.json({
      reply,
      products: matchedProducts,
    });
  } catch (error) {
    next(error);
  }
};
