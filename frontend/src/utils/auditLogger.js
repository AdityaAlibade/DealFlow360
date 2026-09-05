/**
 * DealFlow360 Audit Logger
 * Tracks authorization-sensitive operations (quote changes, discount changes, approvals, customer counter-offers, product requests)
 */

export const AUDIT_ACTIONS = {
  QUOTATION_CREATED: 'QUOTATION_CREATED',
  QUOTATION_UPDATED: 'QUOTATION_UPDATED',
  DISCOUNT_APPLIED: 'DISCOUNT_APPLIED',
  APPROVAL_SUBMITTED: 'APPROVAL_SUBMITTED',
  APPROVAL_APPROVED_L1: 'APPROVAL_APPROVED_L1',
  APPROVAL_APPROVED_L2: 'APPROVAL_APPROVED_L2',
  APPROVAL_REJECTED: 'APPROVAL_REJECTED',
  APPROVAL_REVISED: 'APPROVAL_REVISED',
  FULFILLMENT_SPLIT: 'FULFILLMENT_SPLIT',
  CUSTOMER_COUNTER_OFFER: 'CUSTOMER_COUNTER_OFFER',
  CUSTOMER_CONFIRMATION: 'CUSTOMER_CONFIRMATION',
  THRESHOLD_EXCEEDED_REENTRY: 'THRESHOLD_EXCEEDED_REENTRY',
  PRODUCT_REQUEST_CREATED: 'PRODUCT_REQUEST_CREATED',
  PRODUCT_REQUEST_ACCEPTED: 'PRODUCT_REQUEST_ACCEPTED',
  PRODUCT_REQUEST_REJECTED: 'PRODUCT_REQUEST_REJECTED',
  PRODUCT_REQUEST_CANCELLED: 'PRODUCT_REQUEST_CANCELLED',
  UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT'
};

const STORAGE_KEY = 'dealflow360_audit_log';

export const logAuditEvent = ({ user, role, action, resource, resourceId, result = 'SUCCESS', reason = '', metadata = {} }) => {
  const auditEntry = {
    id: 'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
    timestamp: new Date().toISOString(),
    user: user || 'Anonymous',
    role: role || 'UNKNOWN',
    action,
    resource: resource || 'GENERAL',
    resourceId: resourceId || 'N/A',
    result,
    reason,
    metadata
  };

  try {
    const existingLogs = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    existingLogs.unshift(auditEntry);
    // Keep last 100 entries
    if (existingLogs.length > 100) existingLogs.pop();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingLogs));
  } catch (err) {
    console.warn('[AuditLogger Error]', err);
  }

  console.log(`[Audit Log] [${auditEntry.timestamp}] [${auditEntry.role}] ${auditEntry.action} on ${auditEntry.resource} (${auditEntry.resourceId}): ${auditEntry.result}`);
  return auditEntry;
};

export const getAuditLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export default {
  AUDIT_ACTIONS,
  logAuditEvent,
  getAuditLogs
};
