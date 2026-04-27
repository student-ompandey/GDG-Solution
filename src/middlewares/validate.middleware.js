const ApiError = require('../utils/ApiError');

/**
 * Validation middleware factory.
 * Accepts a Joi schema and validates `req.body` against it.
 *
 * Usage:
 *   router.post('/example', validate(exampleSchema), controller.handler);
 *
 * @param {import('joi').ObjectSchema} schema
 * @returns {import('express').RequestHandler}
 */
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,   // Report all errors, not just the first
    stripUnknown: true,  // Remove fields not in the schema
  });

  if (error) {
    const messages = error.details.map((d) => d.message).join('; ');
    return next(new ApiError(400, `Validation error: ${messages}`));
  }

  // Replace body with the validated (and stripped) value
  req.body = value;
  next();
};

module.exports = validate;
