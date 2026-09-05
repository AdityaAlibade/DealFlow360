// TODO: Error Handler Middleware
// Central error handling
// Catch all errors and format response
// Log errors
// Send appropriate status codes

const errorHandler = (err, req, res, next) => {
  console.error('[Error Handler]:', err.stack || err.message);

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
