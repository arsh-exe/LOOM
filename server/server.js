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
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
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

const DEFAULT_PORT = Number(process.env.PORT || 5001);

function startServer(port, previousPort = null) {
  const server = app.listen(port, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${port}`);
    if (previousPort) {
      console.warn(`Port ${previousPort} was busy, so the app started on port ${port} instead.`);
    }
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      const fallbackPort = port + 1;
      console.warn(`Port ${port} is already in use. Retrying on port ${fallbackPort}...`);
      startServer(fallbackPort, port);
      return;
    }

    console.error('Server failed to start:', error);
    process.exit(1);
  });
}

// Connect to MongoDB first, then start listening for requests.
// This avoids accepting requests before the DB connection is ready.
connectDB().then(() => {
  startServer(DEFAULT_PORT);
});
