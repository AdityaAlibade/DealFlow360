// TODO: Validation Middleware
// Validate request body using Joi/express-validator
// Validate query parameters
// Validate URL parameters
// Send validation error responses

const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

module.exports = { validateRequest };
