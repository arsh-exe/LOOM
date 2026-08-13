// "admin" middleware: runs AFTER "protect" (so req.user already exists).
// Blocks the request unless the logged-in user has role === 'admin'.
function admin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  next(new Error('Not authorized as an admin'));
}

module.exports = { admin };
