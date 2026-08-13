const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Both require a valid JWT (protect middleware runs first)
router.route('/me').get(protect, getMe).put(protect, updateMe);

module.exports = router;
