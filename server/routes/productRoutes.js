const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  getRecommendations,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { createReview, getProductReviews } = require('../controllers/reviewController');

// GET  /api/products      -> list with search/filter/sort/pagination (public)
// POST /api/products      -> create a product (admin only)
router.route('/').get(getProducts).post(protect, admin, createProduct);

// GET /api/products/:id/recommendations -> AI content-based "related products" (public)
router.get('/:id/recommendations', getRecommendations);

// GET    /api/products/:id -> single product (public)
// PUT    /api/products/:id -> update a product (admin only)
// DELETE /api/products/:id -> delete a product (admin only)
router
  .route('/:id')
  .get(getProductById)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

// Reviews, nested under a product
// GET  /api/products/:id/reviews -> list (public) + AI sentiment summary
// POST /api/products/:id/reviews -> create (must be logged in + have purchased)
router.route('/:id/reviews').get(getProductReviews).post(protect, createReview);

module.exports = router;
