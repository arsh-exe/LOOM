const express = require('express');
const router = express.Router();
const { updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Note: creating/listing reviews lives under /api/products/:id/reviews
// (see productRoutes.js) since they're naturally nested under a product.
// This file only handles direct-by-ID edit/delete of a single review.
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);

module.exports = router;
