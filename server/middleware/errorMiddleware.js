// Handles requests to routes that don't exist (e.g. GET /api/nonsense).
// Express calls this if no other route matched.
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error); // pass it along to errorHandler below
}

// Central error handler. Any route/controller that calls next(err),
// or throws inside an async function wrapped in a try/catch that
// forwards to next(err), ends up here.
//
// Express recognizes this as an error handler specifically because
// it takes FOUR arguments (err, req, res, next) — that's not optional.
function errorHandler(err, req, res, next) {
  // If a controller set a specific status code (e.g. 400, 404) use it,
  // otherwise default to 500 (generic server error).
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message,
    // Only include the stack trace outside production —
    // we don't want to leak internal details to real users.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = { notFound, errorHandler };
