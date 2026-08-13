const jwt = require('jsonwebtoken');
const User = require('../models/User');

// "protect" middleware: verifies the JWT sent by the client and attaches
// the logged-in user to req.user, so later route handlers can use it.
//
// Expected header from the frontend: Authorization: Bearer <token>
async function protect(req, res, next) {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Throws if the token is invalid, expired, or was signed with a
      // different secret.
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the user (without password) to the request object so
      // every protected route handler downstream can read req.user
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        res.status(401);
        throw new Error('User no longer exists');
      }

      return next();
    } catch (error) {
      res.status(401);
      return next(new Error('Not authorized, invalid token'));
    }
  }

  res.status(401);
  next(new Error('Not authorized, no token provided'));
}

module.exports = { protect };
