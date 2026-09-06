/**
 * Centralized RBAC Permission Registry & Mapping for DealFlow360
 */

export const PERMISSIONS = {
  // Quotation permissions
  QUOTATION_READ: 'quotation.read',
  QUOTATION_CREATE: 'quotation.create',
  QUOTATION_UPDATE: 'quotation.update',
  QUOTATION_SUBMIT: 'quotation.submit',
  QUOTATION_NEGOTIATE: 'quotation.negotiate',
  QUOTATION_CONFIRM: 'quotation.confirm',

  // Approval permissions
  APPROVAL_READ: 'approval.read',
  APPROVAL_APPROVE_L1: 'approval.approve_l1',
  APPROVAL_APPROVE_L2: 'approval.approve_l2',
  APPROVAL_REJECT: 'approval.reject',
  APPROVAL_REVISE: 'approval.revise',

  // Fulfillment permissions
  FULFILLMENT_READ: 'fulfillment.read',
  FULFILLMENT_MANAGE: 'fulfillment.manage',
  FULFILLMENT_OVERRIDE: 'fulfillment.override',

  // Billing & Invoices permissions
  BILLING_READ: 'billing.read',
  BILLING_MANAGE: 'billing.manage',
  INVOICE_READ: 'invoice.read',
  INVOICE_RECONCILE: 'invoice.reconcile',

  // Deal Health & Analytics permissions
  DEAL_HEALTH_READ: 'deal_health.read',
  REPORT_READ: 'report.read',
  REPORT_EXPORT: 'report.export',

  // Product & Catalog permissions
  PRODUCT_READ: 'product.read',
  PRODUCT_MANAGE: 'product.manage',
  DISCOUNT_MANAGE: 'discount.manage',
  APPROVAL_CHAIN_MANAGE: 'approval_chain.manage',
  WAREHOUSE_MANAGE: 'warehouse.manage',
  SUBSCRIPTION_MANAGE: 'subscription.manage',

  // Customer & Portal permissions
  CUSTOMER_READ: 'customer.read',
  CUSTOMER_PORTAL_READ: 'customer_portal.read',
  CUSTOMER_PORTAL_NEGOTIATE: 'customer_portal.negotiate',
  CUSTOMER_PORTAL_CONFIRM: 'customer_portal.confirm',
  PRODUCT_CATALOG_VIEW: 'product.catalog.view',
  PRODUCT_VIEW: 'product.view',
  PRODUCT_REQUEST_CREATE: 'product.request.create',
  PRODUCT_REQUEST_VIEW: 'product.request.view',
  PRODUCT_REQUEST_CANCEL: 'product.request.cancel',
  PRODUCT_REQUEST_ACCEPT: 'product.request.accept',
  PRODUCT_REQUEST_REJECT: 'product.request.reject',

  // Platform Admin
  PLATFORM_CONFIG: 'platform.config'
};

export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.QUOTATION_READ,
    PERMISSIONS.APPROVAL_READ,
    PERMISSIONS.FULFILLMENT_READ,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.DEAL_HEALTH_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_MANAGE,
    PERMISSIONS.DISCOUNT_MANAGE,
    PERMISSIONS.APPROVAL_CHAIN_MANAGE,
    PERMISSIONS.SUBSCRIPTION_MANAGE,
    PERMISSIONS.CUSTOMER_PORTAL_READ,
    PERMISSIONS.PRODUCT_CATALOG_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PLATFORM_CONFIG
  ],
  sales_rep: [
    PERMISSIONS.CUSTOMER_READ,
    PERMISSIONS.PRODUCT_REQUEST_VIEW,
    PERMISSIONS.PRODUCT_REQUEST_ACCEPT,
    PERMISSIONS.PRODUCT_REQUEST_REJECT,
    PERMISSIONS.QUOTATION_READ,
    PERMISSIONS.QUOTATION_CREATE,
    PERMISSIONS.QUOTATION_UPDATE,
    PERMISSIONS.QUOTATION_SUBMIT,
    PERMISSIONS.QUOTATION_NEGOTIATE,
    PERMISSIONS.APPROVAL_READ,
    PERMISSIONS.FULFILLMENT_READ,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CATALOG_VIEW,
    PERMISSIONS.PRODUCT_VIEW
  ],
  sales_manager: [
    PERMISSIONS.QUOTATION_READ,
    PERMISSIONS.QUOTATION_NEGOTIATE,
    PERMISSIONS.APPROVAL_READ,
    PERMISSIONS.APPROVAL_APPROVE_L1,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.APPROVAL_REVISE,
    PERMISSIONS.FULFILLMENT_READ,
    PERMISSIONS.WAREHOUSE_MANAGE,
    PERMISSIONS.DEAL_HEALTH_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CATALOG_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_REQUEST_VIEW,
    PERMISSIONS.PRODUCT_REQUEST_ACCEPT,
    PERMISSIONS.PRODUCT_REQUEST_REJECT,
    PERMISSIONS.DISCOUNT_MANAGE,
    PERMISSIONS.APPROVAL_CHAIN_MANAGE
  ],
  finance_ops: [
    PERMISSIONS.QUOTATION_READ,
    PERMISSIONS.APPROVAL_READ,
    PERMISSIONS.APPROVAL_APPROVE_L2,
    PERMISSIONS.APPROVAL_REJECT,
    PERMISSIONS.APPROVAL_REVISE,
    PERMISSIONS.FULFILLMENT_READ,
    PERMISSIONS.FULFILLMENT_MANAGE,
    PERMISSIONS.FULFILLMENT_OVERRIDE,
    PERMISSIONS.BILLING_READ,
    PERMISSIONS.BILLING_MANAGE,
    PERMISSIONS.INVOICE_READ,
    PERMISSIONS.INVOICE_RECONCILE,
    PERMISSIONS.DEAL_HEALTH_READ,
    PERMISSIONS.REPORT_READ,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.WAREHOUSE_MANAGE,
    PERMISSIONS.PRODUCT_READ
  ],
  customer: [
    PERMISSIONS.CUSTOMER_PORTAL_READ,
    PERMISSIONS.CUSTOMER_PORTAL_NEGOTIATE,
    PERMISSIONS.CUSTOMER_PORTAL_CONFIRM,
    PERMISSIONS.PRODUCT_CATALOG_VIEW,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.PRODUCT_REQUEST_CREATE,
    PERMISSIONS.PRODUCT_REQUEST_VIEW,
    PERMISSIONS.PRODUCT_REQUEST_CANCEL
  ]
};

export const hasPermission = (roleId, permission) => {
  if (!roleId) return false;
  const permissions = ROLE_PERMISSIONS[roleId] || [];
  return permissions.includes(permission);
};

export const hasAnyPermission = (roleId, permissionsList) => {
  if (!roleId || !permissionsList || permissionsList.length === 0) return false;
  const userPermissions = ROLE_PERMISSIONS[roleId] || [];
  return permissionsList.some(p => userPermissions.includes(p));
};

export const hasAllPermissions = (roleId, permissionsList) => {
  if (!roleId || !permissionsList || permissionsList.length === 0) return false;
  const userPermissions = ROLE_PERMISSIONS[roleId] || [];
  return permissionsList.every(p => userPermissions.includes(p));
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions
};
