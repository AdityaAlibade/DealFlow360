import axios from 'axios';
import { hasPermission, PERMISSIONS } from '../utils/permissions';
import { logAuditEvent, AUDIT_ACTIONS } from '../utils/auditLogger';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Endpoint-to-Permission mapping table for Service-level Authorization
 */
const ENDPOINT_PERMISSIONS = {
  // Approvals
  'POST /approvals': PERMISSIONS.APPROVAL_APPROVE_L1,
  'POST /approvals/:id/approve': PERMISSIONS.APPROVAL_APPROVE_L1,
  'POST /approvals/:id/reject': PERMISSIONS.APPROVAL_REJECT,
  'POST /approvals/:id/revise': PERMISSIONS.APPROVAL_REVISE,

  // Fulfillment
  'POST /fulfillment/:id/split': PERMISSIONS.FULFILLMENT_MANAGE,
  'POST /fulfillment/:id/backorder': PERMISSIONS.FULFILLMENT_MANAGE,

  // Products & Configuration
  'POST /products': PERMISSIONS.PRODUCT_MANAGE,
  'PUT /products': PERMISSIONS.PRODUCT_MANAGE,
  'DELETE /products': PERMISSIONS.PRODUCT_MANAGE,
  'POST /products/discounts': PERMISSIONS.DISCOUNT_MANAGE,

  // Reports
  'GET /reports': PERMISSIONS.REPORT_READ,
  'GET /reports/export': PERMISSIONS.REPORT_EXPORT,

  // Deal Health
  'GET /deal-health': PERMISSIONS.DEAL_HEALTH_READ,

  // Invoices & Billing
  'POST /invoices/:id/reconcile': PERMISSIONS.INVOICE_RECONCILE,
  'POST /subscriptions/:id/modify': PERMISSIONS.BILLING_MANAGE
};

export const apiClient = async (endpoint, options = {}) => {
  const method = (options.method || 'GET').toUpperCase();
  const activeRole = localStorage.getItem('dealflow360_role') || localStorage.getItem('dealflow360_user_role') || 'sales_rep';
  const token = localStorage.getItem('dealflow360_token');

  // 1. Customer Isolation: Prevent customer role from calling internal APIs
  const isCustomerPortalRoute = endpoint.startsWith('/customer-portal');
  if (activeRole === 'customer' && !isCustomerPortalRoute && !endpoint.startsWith('/auth')) {
    logAuditEvent({
      user: 'Customer (Portal)',
      role: 'CUSTOMER',
      action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT,
      resource: 'INTERNAL_API',
      resourceId: endpoint,
      result: 'FORBIDDEN_403',
      reason: 'Customer is restricted from accessing internal DealFlow360 business APIs'
    });
    const error = new Error('403 Forbidden: Customer Portal Access Only');
    error.status = 403;
    throw error;
  }

  // 2. Resolve required permission for endpoint
  const routeKey = `${method} ${endpoint.replace(/\/[0-9a-zA-Z-]+/g, '/:id')}`;
  const requiredPermission = ENDPOINT_PERMISSIONS[routeKey];

  if (requiredPermission) {
    const isAllowed = hasPermission(activeRole, requiredPermission);
    if (!isAllowed) {
      logAuditEvent({
        user: activeRole,
        role: activeRole,
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT,
        resource: 'API_ENDPOINT',
        resourceId: `${method} ${endpoint}`,
        result: 'FORBIDDEN_403',
        reason: `Role '${activeRole}' lacks required permission '${requiredPermission}'`
      });
      const error = new Error(`403 Forbidden: Insufficient permissions (${requiredPermission})`);
      error.status = 403;
      throw error;
    }
  }

  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers || {})
  };

  let requestData = options.body;
  if (typeof requestData === 'string') {
    try {
      requestData = JSON.parse(requestData);
    } catch {
      // keep as string
    }
  }

  try {
    const response = await axios({
      url,
      method,
      headers,
      data: requestData,
      params: options.params
    });
    return response.data;
  } catch (err) {
    if (err.response && err.response.data) {
      return err.response.data;
    }
    throw err;
  }
};

export default apiClient;
