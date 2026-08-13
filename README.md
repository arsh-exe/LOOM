# LOOM — AI-Powered E-Commerce Platform

A full-stack e-commerce site built as a learning / CV project, combining a
vanilla JS frontend with a Node/Express/MongoDB backend, plus three real AI
features: content-based product recommendations, review sentiment analysis,
and a catalog-grounded shopping assistant chatbot.

📄 **Read `docs/NOTES.md` before an interview** — it's a full write-up of every
architectural decision, how each feature works, and likely questions with answers.

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+) — no framework
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **AI:** Custom recommendation engine, `sentiment` NLP library, Anthropic Claude API

## Features

- Product catalog with search, filtering (price/category/brand/rating/stock), and sorting
- Full authentication (register/login, JWT, role-based access control)
- Cart, wishlist, and a full checkout → order flow with stock validation
- Verified-purchase product reviews, auto-tagged positive/neutral/negative by AI
- AI-powered "related products" on every product page
- AI shopping assistant chat widget, grounded in the real product catalog
- Admin dashboard: revenue/order/user stats, product CRUD, order status management

## Getting Started

### 1. Backend

\`\`\`bash
cd server
npm install
cp .env.example .env    # then fill in your own values
npm run seed             # populates MongoDB with demo categories/products/users
npm run dev               # runs on http://localhost:5000
\`\`\`

Requires a local MongoDB instance running (\`mongod\`).

### 2. Frontend

\`\`\`bash
cd client/public
npx serve .
\`\`\`

Or simply open \`client/public/index.html\` directly in a browser.

### Demo accounts (created by \`npm run seed\`)

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Customer | user@example.com | user1234 |

### Enabling the AI chatbot (optional)

Add your own free API key from https://console.anthropic.com to \`server/.env\`:

\`\`\`
ANTHROPIC_API_KEY=your_key_here
\`\`\`

The rest of the site works normally without it.

## Project Structure

\`\`\`
ecommerce/
├── client/public/       # Vanilla JS frontend (pages/, css/, js/)
├── server/               # Express backend (routes → controllers → models)
├── docs/NOTES.md          # Interview prep notes — read this!
└── README.md
\`\`\`

## Notes

This is a learning project — no real payment processing is integrated, and
product images are set via URL rather than a file-upload pipeline. See
\`docs/NOTES.md\` §11 for the full list of known limitations and what a
production version would add.
