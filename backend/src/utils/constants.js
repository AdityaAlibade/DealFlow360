// TODO: Constants
// User Roles, Quotation Status, Approval Level
// Customer Tiers, Product Categories, Billing Cycle
// Alert Types, Severity Levels, Payment Methods
// Application constants and enums

const constants = {
  ROLES: {
    SALES_REP: 'SALES_REP',
    SALES_MANAGER: 'SALES_MANAGER',
    FINANCE_APPROVER: 'FINANCE_APPROVER',
    FULFILLMENT_MANAGER: 'FULFILLMENT_MANAGER',
    ADMIN: 'ADMIN'
  },

  CUSTOMER_TIERS: {
    GOLD: 'GOLD',
    SILVER: 'SILVER',
    BRONZE: 'BRONZE'
  },

  QUOTATION_STATUSES: {
    DRAFT: 'DRAFT',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    APPROVED: 'APPROVED',
    NEGOTIATION: 'NEGOTIATION',
    CONFIRMED: 'CONFIRMED',
    REJECTED: 'REJECTED',
    CANCELLED: 'CANCELLED'
  },

  APPROVAL_STATUSES: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    RETURNED: 'RETURNED'
  },

  RISK_LEVELS: {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  },

  BILLING_CYCLES: {
    MONTHLY: 'MONTHLY',
    QUARTERLY: 'QUARTERLY',
    ANNUAL: 'ANNUAL'
  },

  PAYMENT_METHODS: {
    BANK_WIRE: 'BANK_WIRE',
    CARD: 'CARD',
    UPI: 'UPI',
    CHEQUE: 'CHEQUE'
  },

  BRAND_PRIMARY_COLOR: '#a459a8'
};

module.exports = constants;
