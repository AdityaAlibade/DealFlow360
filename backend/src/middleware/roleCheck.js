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

    const currentRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]).map(r => String(r).toUpperCase());

    // Admin always has bypass authorization
    if (currentRole === 'ADMIN') {
      return next();
    }

    if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have adequate role privileges.'
      });
    }

    next();
  };
};

module.exports = { requireRole };
