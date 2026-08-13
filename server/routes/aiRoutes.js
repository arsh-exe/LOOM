const express = require('express');
const router = express.Router();
const { chatWithAssistant } = require('../controllers/aiController');

// Public — no login required to chat with the shopping assistant.
// (You could require `protect` here if you wanted to limit it to logged-in users.)
router.post('/chat', chatWithAssistant);

module.exports = router;
