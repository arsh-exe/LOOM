# LOOM E-Commerce — Interview Prep Notes

Read this the night before / morning of your interview. It's organized so you can
skim section headers to jog your memory, then go deeper on whatever they ask about.

---

## 1. The 30-second pitch

"I built a full-stack e-commerce platform — vanilla JS frontend, Node/Express/MongoDB
backend — with three real AI features layered on top: a content-based product
recommendation engine, lexicon-based sentiment analysis on reviews, and a shopping
assistant chatbot grounded in the live product catalog using the Anthropic API.
Auth is JWT + bcrypt with role-based access control, and the architecture follows a
standard routes → controllers → models pattern."

---

## 2. Tech stack & why each piece was chosen

| Layer | Choice | Why |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS (ES6+) | Demonstrates core fundamentals without a framework doing the work for me |
| Backend | Node.js + Express | Industry-standard, huge ecosystem, easy to reason about |
| Database | MongoDB + Mongoose | Flexible schema fits products with varying attributes; Mongoose adds validation/structure on top |
| Auth | JWT + bcrypt | Stateless auth (no server-side session storage needed); bcrypt is the standard for password hashing |
| AI: Recommendations | Custom content-based filtering algorithm | No API cost, fully explainable, real ML/IR concept |
| AI: Sentiment | `sentiment` npm package (AFINN lexicon) | Real NLP technique, deterministic, explainable word-by-word |
| AI: Chatbot | Anthropic Claude API | Real LLM, grounded in my own data (RAG-lite pattern) instead of hallucinating |

---

## 3. Project architecture

```
routes  →  controllers  →  models  →  MongoDB
```

- **routes/**: define URL + HTTP method → which controller function handles it. No logic here.
- **controllers/**: the actual business logic — validate input, talk to models, shape the response.
- **models/**: Mongoose schemas — the shape of data and validation rules.
- **middleware/**: cross-cutting concerns that run *before* a controller (auth checks, admin checks, error formatting).

**Why this separation matters (if asked):** it's the single-responsibility principle
applied to a web app. If routing logic and business logic and data logic are all
tangled in one file, the app becomes hard to test and hard to change safely. Each
layer can be understood, tested, and modified independently.

---

## 4. Authentication — how it actually works, step by step

1. **Register**: user submits name/email/password → `authController.registerUser`
   → `User.create()` → Mongoose's `pre('save')` hook on the User model automatically
   hashes the password with bcrypt *before* it touches the database. Plaintext
   password is never stored.
2. **Login**: user submits email/password → we look up the user (explicitly
   requesting the password field, since the schema has `select: false` on it by
   default) → `bcrypt.compare()` checks the submitted password against the stored
   hash → if it matches, we generate a JWT (`jsonwebtoken.sign()`) containing just
   the user's `_id`, signed with a secret from `.env`.
3. **Every subsequent request**: the frontend sends `Authorization: Bearer <token>`
   in the header → `authMiddleware.protect` verifies the token's signature, decodes
   the user ID, looks up the user, and attaches it to `req.user` so controllers
   downstream can use it.
4. **Admin routes**: `adminMiddleware.admin` runs *after* `protect` and simply
   checks `req.user.role === 'admin'`.

**Why JWT instead of sessions?** JWTs are stateless — the server doesn't need to
store session data anywhere, which makes it easier to scale horizontally (any
server instance can verify any token, since verification only needs the shared
secret, not a shared session store).

**Why bcrypt specifically?** It's a slow, salted hashing algorithm *by design* —
slow hashing makes brute-force attacks on stolen password hashes impractical.
Fast hashes like MD5/SHA-256 are wrong for passwords precisely because they're fast.

**Security details I can point to:**
- Passwords never returned in API responses (`select: false` on the schema field)
- Login error message is deliberately identical whether the email or the password
  was wrong ("Invalid email or password") — this prevents attackers from using the
  login endpoint to discover which emails have accounts (user enumeration)
- JWT secret is a long random string, stored in `.env`, never committed to git

---

## 5. AI Feature #1 — Content-Based Product Recommendations

**File:** `server/utils/recommendations.js`, used in `productController.getRecommendations`

**How it works:** For a given product, score every other product on 4 similarity
signals and rank by total score:
- Same category → +5
- Same brand → +3
- Price within 20% → +2
- Rating within 1 star → +1

Sort descending, return the top 4.

**What to call this technique if asked:** "content-based filtering" — a classic
recommender-systems approach. It's called "content-based" because it compares the
*attributes/content* of items to each other, as opposed to "collaborative
filtering" (Netflix/Amazon's other classic approach), which instead looks at
patterns across *many users'* behavior ("people who bought X also bought Y").

**Why I built it this way instead of calling an AI API:** it's deterministic, free,
fast, and — critically — I can explain exactly why any two products got matched.
That's a real engineering tradeoff worth being able to articulate: not every "AI
feature" needs a neural network; sometimes a well-designed scoring heuristic is the
right tool, and knowing when NOT to reach for a heavier tool is itself a skill.

**If asked "how would you improve this?":** at scale, scoring every product in the
catalog against the current one is O(n) per request — fine for hundreds of
products, not for millions. I'd first filter by category in the database query
(cheap, indexed) before scoring the smaller candidate set. For real personalization
you'd eventually want collaborative filtering based on purchase history, or
vector embeddings + cosine similarity for a "semantic" version of this same idea.

---

## 6. AI Feature #2 — Review Sentiment Analysis

**Files:** `server/utils/sentiment.js`, wired into `reviewController.createReview`/`updateReview`

**How it works:** Uses the `sentiment` npm package, which implements **lexicon-based
sentiment analysis** using the AFINN word list — about 3,000 English words each
pre-scored from -5 (very negative) to +5 (very positive) by researchers. The
algorithm:
1. Tokenizes the review text into words
2. Looks up each word's AFINN score (words not in the list score 0)
3. Sums the scores and normalizes by comment length ("comparative" score)
4. I map that normalized score to a label: `> 0.15` = positive, `< -0.15` = negative, else neutral

This runs automatically server-side the moment a review is submitted — the sentiment
label isn't something the user enters, it's derived.

**Why this counts as a real NLP technique (if pushed on it):** lexicon-based
sentiment analysis was the standard approach before deep learning became practical
for NLP, and it's still widely used today because it's fast, requires no training
data or GPU, and — same theme as above — is fully explainable. You can point to
exactly which words drove a review's score.

**Limitation I'd mention proactively:** lexicon-based scoring doesn't understand
negation well in all cases, sarcasm, or domain-specific slang ("sick" meaning
"great" in some contexts would score negative). A production system might combine
this with a fine-tuned classifier for higher accuracy, but this approach is a
reasonable, cheap first pass — and interviewers respect knowing a technique's limits.

---

## 7. AI Feature #3 — Shopping Assistant Chatbot

**Files:** `server/controllers/aiController.js`, `client/public/js/chatbot.js`

**How it works (this is a simplified Retrieval-Augmented Generation / RAG pattern):**
1. User types a message in the floating chat widget (present on every page)
2. Backend fetches a summary of the *real* product catalog from MongoDB (name,
   brand, category, price, stock, rating — kept lightweight)
3. That catalog summary is injected into the system prompt sent to Claude, with an
   explicit instruction: only recommend products that are actually listed, never
   invent products
4. Claude's reply is returned to the widget and displayed

**Why "grounding" matters (the key concept here):** without step 2/3, an LLM asked
"what running shoes do you have under $100?" would happily make up a plausible-
sounding but fake product. By feeding it my actual database contents as context
every time, its answers are anchored to reality. This is the same underlying idea
as production RAG systems, just simplified — a real RAG system would use vector
search to retrieve only the *relevant* subset of a much larger catalog; mine sends
a capped slice of the whole catalog since the demo catalog is small.

**Setup requirement to know:** this feature needs `ANTHROPIC_API_KEY` set in
`server/.env`. Without it, the endpoint returns a clear 503 error rather than
crashing — the rest of the site works fine either way.

---

## 8. Cart, Orders, and the "snapshot" pattern

**Cart** (`models/Cart.js`) stores only a *reference* to each product plus a
quantity — never a copied price. Every time the cart is displayed, we `populate()`
the real product and calculate totals from its *current* price. This is intentional:
a cart should always reflect live pricing.

**Order** (`models/Order.js`) does the opposite on purpose: each order item
*snapshots* the product's name, image, and price **at the moment of purchase**.

**Why the difference matters (a great interview question to be ready for):** if an
admin changes a product's price next week, a customer's cart total should update to
match — but their *past order* should still show what they actually paid. Getting
this distinction right is a real e-commerce data-modeling decision, not an accident.

**Order creation flow** (`orderController.createOrder`):
1. Load the user's cart, validate every item still has enough stock
2. Build order item snapshots + calculate `itemsPrice`
3. Apply flat-rate shipping, free over $75
4. Create the Order document
5. Decrement `Product.stock` for each purchased item
6. Empty the cart

---

## 9. Admin dashboard

`adminController.getDashboardStats` uses MongoDB's **aggregation pipeline**
(`Order.aggregate([...])`) to compute best-sellers: `$unwind` explodes each order's
item array into separate documents, `$group` sums quantities per product, `$sort` +
`$limit` gets the top 5. This is worth understanding line-by-line since aggregation
pipelines are a common interview topic for MongoDB.

All `/api/admin/*` routes are protected by `protect` (must be logged in) *and*
`admin` (must have the admin role) — both checked at the router level with
`router.use(protect, admin)`, so it applies to every route in that file at once.

---

## 10. Design decisions I should be ready to defend

- **Why vanilla JS instead of React?** To demonstrate real DOM manipulation and
  state management fundamentals without a framework abstracting them away. I know
  the concepts a framework like React would otherwise hide from me (virtual DOM,
  component re-rendering, etc.) at a foundational level first.
- **Why does search/filter/sort live in the URL query string?** So filtered views
  are shareable/bookmarkable links, and survive a page refresh — a real UX
  consideration, not just a technical convenience.
- **Why event delegation for product card buttons** (`bindProductCardEvents`)
  instead of one listener per button? Product grids re-render often (new search
  results, pagination). One listener on the parent container, checking
  `e.target.closest(...)`, avoids having to re-attach listeners every render and
  avoids memory leaks from orphaned listeners.
- **Why is pricing shown in a monospace font?** A deliberate design choice — it
  gives numbers a "data/receipt" feel that ties into the AI/data-driven identity of
  the site, and monospace digits are easier to visually compare at a glance (equal
  width per character) which matters when scanning a list of prices.

---

## 11. Known limitations (good to mention proactively — shows self-awareness)

- No real payment gateway integrated (Stripe, etc.) — checkout has a payment
  *method selector* but processes no real transaction. Explicitly out of scope per
  the original project brief.
- No image upload — product images are set via URL (an admin pastes a link) rather
  than a file upload pipeline (e.g. to S3/Cloudinary). A real production version
  would add that.
- The AI recommendation algorithm doesn't scale to huge catalogs without adding a
  pre-filter (see Section 5).
- No automated test suite (unit/integration tests) — was out of scope for the time
  available, but I know what I'd test first: auth flows, order total calculations,
  and the recommendation scoring function.
- Sentiment analysis language support is English-only (AFINN is an English lexicon).

---

## 12. How to run this project locally (so you don't fumble the demo)

```bash
# 1. Backend
cd server
npm install
npm run seed     # populates MongoDB with categories, products, demo users
npm run dev      # starts on http://localhost:5000

# 2. Frontend
cd client/public
npx serve .       # or just open index.html directly in a browser
```

**Demo accounts** (created by the seed script):
- Admin: `admin@example.com` / `admin123`
- Regular user (has a delivered order + reviews already): `user@example.com` / `user1234`

**To enable the AI chatbot:** add your own key to `server/.env` as `ANTHROPIC_API_KEY`
(get one free at https://console.anthropic.com). Everything else works without it.

---

## 13. Likely interview questions + one-line answers to expand on

- *"Walk me through what happens when someone places an order."* → See Section 8.
- *"How do you prevent someone from editing another user's cart?"* → Every cart
  route requires `protect` middleware, and we always query `Cart.findOne({ user:
  req.user._id })` — never trust a cart ID from the client, always scope by the
  authenticated user.
- *"What would you do differently with more time?"* → Add automated tests, real
  payment integration, image upload, and swap the recommendation engine's linear
  scan for a pre-filtered query as the catalog grows.
- *"Why MongoDB over a SQL database?"* → Products have naturally variable/nested
  attributes (arrays of images, embedded shipping address, embedded order items) —
  a document model fits that more naturally than normalizing across many SQL
  tables, though I could argue this could could also be modeled relationally.
- *"What's the biggest security risk in this app and how did you address it?"* →
  Auth is the biggest attack surface: addressed via bcrypt hashing, JWT expiry,
  vague login error messages, and role checks on every privileged route.
