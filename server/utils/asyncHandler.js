/**
 * Higher-order function that wraps an async Express route handler
 * and forwards any rejected promise to the global error middleware.
 *
 * Usage:
 *   router.get('/example', asyncHandler(async (req, res) => { ... }));
 *
 * @param {Function} fn - Async route handler
 * @returns {Function}  - Wrapped handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
