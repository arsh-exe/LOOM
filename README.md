# LOOM — AI-Powered E-Commerce Platform

LOOM is a full-stack e-commerce app with a modern Next.js storefront and a Node/Express + MongoDB API. It includes product browsing, cart and orders, authentication, admin features, and AI-assisted shopping experiences.

## Overview

- Frontend: Next.js 14 + React 18 + Framer Motion
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + bcrypt
- AI features:
  - Content-based product recommendations
  - Review sentiment analysis
  - Catalog-grounded shopping assistant

## Current Project Structure

```text
.
├── client/                 # Next.js storefront UI
│   ├── app/                # App Router pages
│   ├── components/         # Reusable UI components
│   ├── public/            # Static assets and legacy storefront files
│   └── package.json
├── server/                 # Express API and data layer
│   ├── config/            # DB config
│   ├── controllers/       # Route handlers and business logic
│   ├── middleware/        # Auth + admin + error middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API route definitions
│   ├── utils/             # Recommendation + sentiment helpers
│   ├── seed.js            # Seed demo data
│   ├── server.js          # API entry point
│   └── package.json
├── docs/
│   └── NOTES.md           # Interview and architecture notes
├── package.json            # Root scripts to run both apps
├── README.md
├── .gitignore
└── .env.example           # Optional environment example if present in a local setup
```

## Tech Stack

- Next.js 14 for the storefront experience
- React 18 for UI rendering
- Framer Motion for motion and polish
- Express.js for REST APIs
- MongoDB + Mongoose for data persistence
- JWT for authentication
- bcryptjs for password hashing
- Sentiment analysis for review classification
- AI catalog matching and external LLM integration via Groq or Anthropic fallback

## Features

- Product listing, category browsing, and product detail pages
- Search, filtering, sorting, and featured product sections
- Wishlist, cart, and checkout flow integration
- JWT-based customer and admin authentication
- Admin dashboard and protected admin routes
- AI product recommendations based on catalog similarity
- Review sentiment scoring and labeling
- Shopping assistant that responds using the live catalog

## Required Environment Variables

Create a `.env` file inside `server/` with the variables your app expects:

```env
MONGO_URI=mongodb://localhost:27017/loom
JWT_SECRET=your_jwt_secret
PORT=5001

# optional but recommended for AI shopping assistant
GROQ_API_KEY=your_groq_key
# or
ANTHROPIC_API_KEY=your_anthropic_key
```

> The frontend reads `NEXT_PUBLIC_API_URL` from the root dev script. The default API target is `http://localhost:5001/api`.

## Getting Started

### 1. Install dependencies

```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Seed demo data

```bash
npm --prefix server run seed
```

This creates default admin and customer accounts for local testing.

### 3. Run the app

Run both backend and frontend together from the root:

```bash
npm run dev
```

This starts:

- Backend: `http://localhost:5001`
- Frontend: `http://localhost:3001`

If you want to start them separately:

```bash
npm run dev:server
npm run dev:client
```

### 4. Production build

```bash
npm run build
```

## Demo Accounts

The seeded accounts are:

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| Customer | user@example.com | user1234 |

## API Notes

The backend exposes REST endpoints under `/api`, including:

- `/api/auth`
- `/api/products`
- `/api/categories`
- `/api/cart`
- `/api/orders`
- `/api/reviews`
- `/api/wishlist`
- `/api/admin`
- `/api/ai`

## Notes

This project has evolved from a simpler vanilla JS storefront into a more polished full-stack application with a modern Next.js frontend while preserving the backend architecture and data model. For interview or architecture context, see [docs/NOTES.md](docs/NOTES.md).
