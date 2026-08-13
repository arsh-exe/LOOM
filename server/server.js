require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route files (empty routers for now — filled in as we build each feature)
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const aiRoutes = require('./routes/aiRoutes');

const app = express();

// ---- Global middleware ----
app.use(cors());                 // allow the frontend (different port) to call this API
app.use(express.json());         // parse incoming JSON request bodies into req.body
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));        // log each request to the console while developing
}

// ---- Health check ----
app.get('/', (req, res) => {
  res.json({ message: 'Ecommerce API is running' });
});

// ---- API routes ----
// Every route file is mounted under /api/<resource>.
// e.g. authRoutes handles /api/auth/register, /api/auth/login, etc.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/ai', aiRoutes);

// ---- Error handling (must be registered LAST, after all routes) ----
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start listening for requests.
// This avoids accepting requests before the DB connection is ready.
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
});
