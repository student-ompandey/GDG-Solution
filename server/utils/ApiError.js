/**
 * Custom API Error class.
 * Extends the native Error with an HTTP status code and
 * an `isOperational` flag to distinguish expected errors
 * from unexpected crashes.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Human-readable error message
   * @param {boolean} [isOperational=true] - Expected (true) vs unexpected (false) error
   * @param {string} [stack]    - Optional stack trace override
   */
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
