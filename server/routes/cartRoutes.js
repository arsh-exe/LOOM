const express = require('express');
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

// Every cart route requires the user to be logged in.
router.use(protect);

router.route('/').get(getCart).post(addToCart);
router.route('/:productId').put(updateCartItem).delete(removeFromCart);

module.exports = router;
