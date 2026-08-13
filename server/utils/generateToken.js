const jwt = require('jsonwebtoken');

// Creates a signed JWT containing the user's ID.
// The token itself is not encrypted, just signed — anyone can read its
// contents (base64), but they can't FORGE a valid one without JWT_SECRET.
// We keep the payload minimal (just the id) for that reason: never put
// passwords or sensitive data inside a JWT payload.
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

module.exports = generateToken;
