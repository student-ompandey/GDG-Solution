/**
 * Standardised API response wrapper.
 * Ensures every successful response has a consistent shape:
 * { success: true, statusCode, message, data }
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message    - Success message
   * @param {*}      [data=null] - Response payload
   */
  constructor(statusCode, message, data = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /**
   * Send this response through an Express `res` object.
   * @param {import('express').Response} res
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    });
  }
}

module.exports = ApiResponse;
