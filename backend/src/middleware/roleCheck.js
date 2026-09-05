// TODO: Role Check Middleware
// Check user roles
// Restrict access based on roles
// Allow multiple roles
// Allow admin override

const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Admin always has bypass authorization
    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (Array.isArray(allowedRoles) && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have adequate role privileges.'
      });
    }

    next();
  };
};

module.exports = { requireRole };
