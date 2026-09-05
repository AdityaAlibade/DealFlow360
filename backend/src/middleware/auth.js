// TODO: Auth Middleware
// Verify JWT token
// Extract user from token
// Attach user to request object
// Check token expiration

const jwt = require('jsonwebtoken');
const config = require('../config');

const DEMO_TOKENS = {
  'jwt-admin-token-dealflow360': { id: 'usr-admin-01', email: 'adityaalibade1046@gmail.com', role: 'ADMIN', fullName: 'Admin User' },
  'jwt-salesmanager-token-dealflow360': { id: 'usr-mgr-02', email: 'salesmanager@dealflow360.com', role: 'SALES_MANAGER', fullName: 'Sales Manager' },
  'jwt-manager-token-dealflow360': { id: 'usr-mgr-02', email: 'salesmanager@dealflow360.com', role: 'SALES_MANAGER', fullName: 'Sales Manager' },
  'jwt-salesrep-token-dealflow360': { id: 'usr-rep-03', email: 'salesrep@dealflow360.com', role: 'SALES_REP', fullName: 'Sales Rep' },
  'jwt-financemanager-token-dealflow360': { id: 'usr-fin-04', email: 'financemanager@dealflow360.com', role: 'FINANCE_OPS', fullName: 'Finance Manager' },
  'jwt-finance-token-dealflow360': { id: 'usr-fin-04', email: 'financemanager@dealflow360.com', role: 'FINANCE_OPS', fullName: 'Finance Manager' },
  'jwt-customer-token-dealflow360': { id: 'usr-cust-05', email: 'customer@dealflow360.com', role: 'CUSTOMER', fullName: 'Customer User' },
  'demo-token-123': { id: 'usr-cust-05', email: 'customer@dealflow360.com', role: 'CUSTOMER', fullName: 'Customer User' },
  'jwt-test-admin-token': { id: 'usr-test-admin', email: 'admin.test@dealflow360.com', role: 'ADMIN', fullName: 'Test Admin' },
  'jwt-test-salesmgr-token': { id: 'usr-test-mgr', email: 'salesmanager.test@dealflow360.com', role: 'SALES_MANAGER', fullName: 'Test Sales Manager' },
  'jwt-test-salesrep-token': { id: 'usr-test-rep', email: 'salesrep.test@dealflow360.com', role: 'SALES_REP', fullName: 'Test Sales Rep' },
  'jwt-test-finmgr-token': { id: 'usr-test-fin', email: 'financemanager.test@dealflow360.com', role: 'FINANCE_OPS', fullName: 'Test Finance Manager' },
  'jwt-test-cust-token': { id: 'usr-test-cust', email: 'customer.test@example.com', role: 'CUSTOMER', fullName: 'Test Customer' }
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  // 1. Check mapped demo tokens
  if (DEMO_TOKENS[token]) {
    req.user = DEMO_TOKENS[token];
    return next();
  }

  // 2. Verify JWT token
  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session token.'
    });
  }
};

module.exports = { verifyToken };

