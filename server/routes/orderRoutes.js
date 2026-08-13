const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').post(createOrder).get(getMyOrders);
router.get('/:id', getOrderById);

module.exports = router;
