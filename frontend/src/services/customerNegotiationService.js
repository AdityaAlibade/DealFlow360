/**
 * Dedicated Customer Negotiation Service for DealFlow360
 * Handles customer portal quote retrieval, ownership validation, data sanitization,
 * inline comment submissions, counter-discount proposals, approval threshold evaluations, and final confirmation.
 */

import { logAuditEvent, AUDIT_ACTIONS } from '../utils/auditLogger';

// Mock DB of customer token-to-quotation mapping
const VALID_CUSTOMER_TOKENS = {
  'demo-token-123': {
    quotationId: 'Q-2026-8801',
    customerId: 'CUST-TCS-01',
    customerName: 'Tata Consultancy Services (TCS)',
    contactPerson: 'Ananya Deshmukh',
    contactEmail: 'procurement@tcs.com',
    status: 'Sent (Negotiation Open)',
    quoteValidity: '2026-10-15',
    currentDiscount: 10,
    maxDirectAcceptDiscount: 10, // Max discount allowed without triggering re-approval
    currency: 'INR',
    lineItems: [
      { id: 'item-1', name: 'Enterprise Laptop Pro 14" (Workstation)', qty: 2, price: 150000, discount: 10, total: 270000 },
      { id: 'item-2', name: 'Onsite Setup & Migration Service', qty: 1, price: 45000, discount: 10, total: 40500 },
      { id: 'item-3', name: 'Enterprise Support SLA (2 Years)', qty: 1, price: 25000, discount: 10, total: 22500 }
    ],
    // Internal sensitive data (MUST BE STRIPPED from customer response)
    _internal: {
      baseCost: 215000,
      targetMarginPct: 34.5,
      blendedRiskScore: 'Low (0.12)',
      internalApprovalNotes: 'Approved by Priya Sharma on condition of 2-year contract',
      assignedRep: 'Rajesh Kumar (Enterprise Sales)',
      warehouseDepot: 'BOM-1 (Mumbai Logistics Hub)'
    },
    negotiationHistory: [
      { timestamp: '2026-09-01T10:00:00Z', actor: 'Sales Rep (Rajesh Kumar)', message: 'Initial quote dispatched at 10% standard discount.' }
    ]
  }
};

export const CustomerNegotiationService = {
  /**
   * Retrieves and sanitizes quotation by customer token.
   * Throws 403 / 404 if token is invalid or does not belong to customer.
   */
  getCustomerQuotation: async (token) => {
    if (!token || !VALID_CUSTOMER_TOKENS[token]) {
      logAuditEvent({
        user: 'Anonymous Customer',
        role: 'CUSTOMER',
        action: AUDIT_ACTIONS.UNAUTHORIZED_ACCESS_ATTEMPT,
        resource: 'CUSTOMER_PORTAL',
        resourceId: token,
        result: 'REJECTED_403',
        reason: 'Invalid or unauthorized customer quotation token'
      });
      throw { status: 403, message: 'Invalid or expired customer portal access token. Access Denied.' };
    }

    const quote = VALID_CUSTOMER_TOKENS[token];

    // Strip internal proprietary metrics
    const sanitizedQuote = {
      quotationId: quote.quotationId,
      customerId: quote.customerId,
      customerName: quote.customerName,
      contactPerson: quote.contactPerson,
      status: quote.status,
      quoteValidity: quote.quoteValidity,
      currentDiscount: quote.currentDiscount,
      currency: quote.currency,
      lineItems: quote.lineItems.map(item => ({
        id: item.id,
        name: item.name,
        qty: item.qty,
        price: item.price,
        discount: item.discount,
        total: item.total
      })),
      negotiationHistory: quote.negotiationHistory
    };

    return { success: true, data: sanitizedQuote };
  },

  /**
   * Adds line-level comments or clarification questions
   */
  addLineComment: async (token, lineId, comment) => {
    const { data: quote } = await CustomerNegotiationService.getCustomerQuotation(token);
    const item = quote.lineItems.find(i => i.id === lineId);
    if (!item) throw { status: 404, message: 'Quotation line item not found' };

    const record = {
      timestamp: new Date().toISOString(),
      actor: `Customer (${quote.customerName})`,
      message: `Line item [${item.name}]: ${comment}`
    };

    VALID_CUSTOMER_TOKENS[token].negotiationHistory.push(record);
    logAuditEvent({
      user: quote.contactPerson,
      role: 'CUSTOMER',
      action: AUDIT_ACTIONS.CUSTOMER_COUNTER_OFFER,
      resource: 'QUOTATION',
      resourceId: quote.quotationId,
      result: 'SUCCESS',
      reason: 'Line item comment submitted'
    });

    return { success: true, data: record };
  },

  /**
   * Submits a counter-discount proposal and evaluates approval thresholds.
   * If counter terms exceed threshold (> 10%), automatically routes into re-approval flow!
   */
  submitCounterOffer: async (token, { counterDiscount, comment, requestedDate }) => {
    const rawQuote = VALID_CUSTOMER_TOKENS[token];
    if (!rawQuote) throw { status: 403, message: 'Unauthorized quotation token' };

    const discountNum = Number(counterDiscount) || rawQuote.currentDiscount;
    const exceedsThreshold = discountNum > rawQuote.maxDirectAcceptDiscount;

    let newStatus = 'Counter Offer Submitted (Sales Review)';
    if (exceedsThreshold) {
      newStatus = 'Under Re-Approval (Threshold Exceeded: ' + discountNum + '%)';
    }

    rawQuote.status = newStatus;
    const historyEntry = {
      timestamp: new Date().toISOString(),
      actor: `Customer (${rawQuote.customerName})`,
      message: `Counter-proposal requested: ${discountNum}% discount (Previous: ${rawQuote.currentDiscount}%). Notes: ${comment || 'None'}`
    };

    rawQuote.negotiationHistory.push(historyEntry);

    if (exceedsThreshold) {
      logAuditEvent({
        user: rawQuote.contactPerson,
        role: 'CUSTOMER',
        action: AUDIT_ACTIONS.THRESHOLD_EXCEEDED_REENTRY,
        resource: 'QUOTATION',
        resourceId: rawQuote.quotationId,
        result: 'RE_APPROVAL_TRIGGERED',
        reason: `Counter discount ${discountNum}% exceeds max direct threshold (${rawQuote.maxDirectAcceptDiscount}%). Automatically routed to Sales Manager & Finance approval flow.`
      });
    } else {
      logAuditEvent({
        user: rawQuote.contactPerson,
        role: 'CUSTOMER',
        action: AUDIT_ACTIONS.CUSTOMER_COUNTER_OFFER,
        resource: 'QUOTATION',
        resourceId: rawQuote.quotationId,
        result: 'SUCCESS',
        reason: 'Counter-offer within baseline limits'
      });
    }

    return {
      success: true,
      status: newStatus,
      reApprovalTriggered: exceedsThreshold,
      message: exceedsThreshold
        ? 'Your counter-offer has been submitted and automatically routed to internal management for threshold review.'
        : 'Counter-proposal successfully submitted to sales team.'
    };
  },

  /**
   * One-click final digital quotation terms confirmation.
   */
  confirmQuotation: async (token) => {
    const rawQuote = VALID_CUSTOMER_TOKENS[token];
    if (!rawQuote) throw { status: 403, message: 'Unauthorized quotation token' };

    rawQuote.status = 'Confirmed & Accepted (Ready for Fulfillment)';
    rawQuote.negotiationHistory.push({
      timestamp: new Date().toISOString(),
      actor: `Customer (${rawQuote.customerName})`,
      message: 'Quotation terms officially accepted and confirmed online.'
    });

    logAuditEvent({
      user: rawQuote.contactPerson,
      role: 'CUSTOMER',
      action: AUDIT_ACTIONS.CUSTOMER_CONFIRMATION,
      resource: 'QUOTATION',
      resourceId: rawQuote.quotationId,
      result: 'CONFIRMED_ACCEPTED',
      reason: 'Customer completed 1-click digital sign-off. Order unlocked for multi-depot fulfillment.'
    });

    return {
      success: true,
      status: rawQuote.status,
      message: 'Quotation successfully confirmed! Order is now queued for fulfillment.'
    };
  },

  /**
   * Returns negotiation status and audit history for customer portal.
   */
  getNegotiationStatus: async (token) => {
    const { data: quote } = await CustomerNegotiationService.getCustomerQuotation(token);
    return {
      success: true,
      status: quote.status,
      history: quote.negotiationHistory
    };
  },

  /**
   * Helper: Add direct line item to quotation (Executed ONLY via Sales Rep review workflow)
   */
  addDirectLineItemToQuote: (token, newLineItem) => {
    const rawQuote = VALID_CUSTOMER_TOKENS[token];
    if (rawQuote) {
      rawQuote.lineItems.push(newLineItem);
      rawQuote.negotiationHistory.push({
        timestamp: new Date().toISOString(),
        actor: 'Sales Operations',
        message: `Added requested line item [${newLineItem.name}] (Qty: ${newLineItem.qty}, Price: ₹${newLineItem.price}, Discount: ${newLineItem.discount}%, Total: ₹${newLineItem.total}).`
      });
      return true;
    }
    return false;
  },

  /**
   * Helper: Update quotation status
   */
  updateQuoteStatus: (token, newStatus) => {
    const rawQuote = VALID_CUSTOMER_TOKENS[token];
    if (rawQuote) {
      rawQuote.status = newStatus;
      return true;
    }
    return false;
  }
};

export default CustomerNegotiationService;
