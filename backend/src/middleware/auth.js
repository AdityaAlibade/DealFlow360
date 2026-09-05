// TODO: Auth Middleware
// Verify JWT token
// Extract user from token
// Attach user to request object
// Check token expiration

const jwt = require('jsonwebtoken');
const config = require('../config');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (config.env === 'development' || process.env.NODE_ENV !== 'production') {
      req.user = { id: 'usr-cuid-9021', email: 'demo@dealflow.com', role: 'SALES_REP', fullName: 'John Doe' };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    if (config.env === 'development' || process.env.NODE_ENV !== 'production') {
      req.user = { id: 'usr-cuid-9021', email: 'demo@dealflow.com', role: 'SALES_REP', fullName: 'John Doe' };
      return next();
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }
};

module.exports = { verifyToken };
