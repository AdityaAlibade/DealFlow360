/**
 * Customer Product Catalog & Product Request Service for DealFlow360
 * Handles customer-facing product discovery, customer product request submissions,
 * request lifecycle (PENDING -> ACCEPTED / REJECTED / CANCELLED), and quotation integration.
 */

import { logAuditEvent, AUDIT_ACTIONS } from '../utils/auditLogger';
import { CustomerNegotiationService } from './customerNegotiationService';

// Master Customer-Facing Products (Sanitized: NO internal cost, margin, or risk exposed)
export const CUSTOMER_FACING_PRODUCTS = [
  {
    id: 'PRD-101',
    name: 'Laptop Pro 14 (Enterprise Edition)',
    category: 'Hardware',
    description: 'High-performance workstation laptop featuring M3 Pro chip, 32GB RAM, 1TB SSD, and liquid retina display.',
    unitPrice: 1200,
    unit: 'Per Unit',
    billingType: 'One-Time',
    status: 'ACTIVE',
    customerVisible: true,
    leadTime: '3-5 Business Days',
    specs: ['Apple M3 Pro / 32GB RAM', '1TB NVMe Storage', 'MagSafe & Thunderbolt 4']
  },
  {
    id: 'PRD-102',
    name: 'Onsite Setup & Deployment Service',
    category: 'Services',
    description: 'Turnkey on-premises system installation, enterprise network integration, user account provisioning, and IT handover.',
    unitPrice: 450,
    unit: 'Per Location',
    billingType: 'One-Time',
    status: 'ACTIVE',
    customerVisible: true,
    leadTime: 'Scheduled within 48 hrs',
    specs: ['Certified IT Engineers', 'Full Network Setup', 'End-user Onboarding']
  },
  {
    id: 'PRD-103',
    name: 'Docking Station USB-C Dual 4K',
    category: 'Hardware',
    description: 'Universal USB-C dock with dual DisplayPort/HDMI 4K@60Hz support, 100W Power Delivery, and Gigabit Ethernet.',
    unitPrice: 180,
    unit: 'Per Unit',
    billingType: 'One-Time',
    status: 'ACTIVE',
    customerVisible: true,
    leadTime: 'In Stock (1-2 Days)',
    specs: ['Dual 4K Monitor Outputs', '100W Laptop Passthrough', '5x USB 3.2 Ports']
  },
  {
    id: 'PRD-104',
    name: 'Enterprise Cloud Storage Pro (5TB)',
    category: 'Software & Cloud',
    description: 'Secure, encrypted B2B cloud workspace storage with automated backups, unlimited file versioning, and SSO integration.',
    unitPrice: 85,
    unit: 'Per Month (Billed Annually)',
    billingType: 'Recurring',
    status: 'ACTIVE',
    customerVisible: true,
    leadTime: 'Instant Activation',
    specs: ['5TB Shared Cloud Pool', 'SOC-2 Type II Certified', 'Single Sign-On (SAML/Okta)']
  },
  {
    id: 'PRD-105',
    name: 'Annual Care Plan Gold SLA (24/7)',
    category: 'Warranty & SLA',
    description: 'Premium enterprise hardware warranty with 4-hour on-site response time, priority phone support, and accidental damage protection.',
    unitPrice: 250,
    unit: 'Per Device / Year',
    billingType: 'Recurring',
    status: 'ACTIVE',
    customerVisible: true,
    leadTime: 'Immediate Coverage',
    specs: ['4-Hour Onsite SLA', 'Accidental Damage Covered', 'Dedicated Account Mgr']
  },
  {
    id: 'PRD-106',
    name: 'AI Sales Analytics Add-on Module',
    category: 'Software & Cloud',
    description: 'Predictive revenue analytics, customer churn forecasting, and automated CPQ discount intelligence dashboard.',
    unitPrice: 150,
    unit: 'Per Seat / Month',
    billingType: 'Recurring',
    status: 'ACTIVE',
    customerVisible: true,
    leadTime: 'Instant Activation',
    specs: ['Revenue Forecasting Engine', 'Automated Leakage Alerts', 'Real-Time CPQ Insights']
  }
];

const REQUESTS_STORAGE_KEY = 'dealflow360_product_requests';

// Initial Seed Requests
const INITIAL_PRODUCT_REQUESTS = [
  {
    id: 'REQ-901',
    customerId: 'CUST-ACME-01',
    customerName: 'Acme Corporation',
    contactPerson: 'Alex Buyer',
    quotationId: 'Q-2026-8801',
    productId: 'PRD-104',
    productName: 'Enterprise Cloud Storage Pro (5TB)',
    category: 'Software & Cloud',
    unitPrice: 85,
    quantity: 2,
    message: 'We require cloud storage capacity for our upcoming Q4 multi-regional deployment. Please add this to our quotation with the 10% standard discount.',
    status: 'PENDING',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    salesResponse: null,
    reviewedBy: null,
    reviewedAt: null
  }
];

const getStoredRequests = () => {
  try {
    const data = localStorage.getItem(REQUESTS_STORAGE_KEY);
    if (data) return JSON.parse(data);
  } catch (err) {
    console.warn('[ProductRequestService Storage Error]', err);
  }
  localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(INITIAL_PRODUCT_REQUESTS));
  return INITIAL_PRODUCT_REQUESTS;
};

const saveStoredRequests = (requests) => {
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (err) {
    console.warn('[ProductRequestService Storage Error]', err);
  }
};

export const ProductRequestService = {
  /**
   * 1. Get Customer-Facing Product Catalog (Sanitized for customer view)
   */
  getCustomerCatalog: async (token, { search = '', category = 'All' } = {}) => {
    // Validate customer token
    const quoteRes = await CustomerNegotiationService.getCustomerQuotation(token);
    if (!quoteRes || !quoteRes.data) {
      throw { status: 403, message: 'Unauthorized customer access token.' };
    }

    let products = CUSTOMER_FACING_PRODUCTS.filter((p) => p.customerVisible && p.status === 'ACTIVE');

    if (category && category !== 'All') {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.toLowerCase().trim();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: products,
      total: products.length
    };
  },

  /**
   * 2. Submit a Customer Product Request (DOES NOT directly modify quotation)
   */
  createProductRequest: async (token, { productId, quantity, message }) => {
    const { data: quote } = await CustomerNegotiationService.getCustomerQuotation(token);
    if (!quote) throw { status: 403, message: 'Invalid customer token.' };

    const product = CUSTOMER_FACING_PRODUCTS.find(
      (p) => p.id === productId && p.customerVisible && p.status === 'ACTIVE'
    );
    if (!product) {
      throw { status: 404, message: 'Requested product is not available in the customer catalog.' };
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 1 || qty > 100) {
      throw { status: 400, message: 'Please specify a valid quantity between 1 and 100.' };
    }

    const newRequest = {
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      customerId: quote.customerId,
      customerName: quote.customerName,
      contactPerson: quote.contactPerson,
      quotationId: quote.quotationId,
      productId: product.id,
      productName: product.name,
      category: product.category,
      unitPrice: product.unitPrice,
      quantity: qty,
      message: (message || '').trim() || 'Customer requested inclusion of this product in active quotation.',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      salesResponse: null,
      reviewedBy: null,
      reviewedAt: null
    };

    const allRequests = getStoredRequests();
    allRequests.unshift(newRequest);
    saveStoredRequests(allRequests);

    logAuditEvent({
      user: quote.contactPerson,
      role: 'CUSTOMER',
      action: AUDIT_ACTIONS.PRODUCT_REQUEST_CREATED,
      resource: 'PRODUCT_REQUEST',
      resourceId: newRequest.id,
      result: 'SUCCESS',
      reason: `Customer submitted product request for ${qty}x ${product.name}`,
      metadata: { quotationId: quote.quotationId, productId: product.id, quantity: qty }
    });

    return {
      success: true,
      data: newRequest,
      message: `Product request for ${qty}x ${product.name} submitted successfully. Your Sales Representative has been notified.`
    };
  },

  /**
   * 3. Get all requests created by authenticated customer
   */
  getCustomerRequests: async (token) => {
    const { data: quote } = await CustomerNegotiationService.getCustomerQuotation(token);
    if (!quote) throw { status: 403, message: 'Unauthorized customer access token.' };

    const allRequests = getStoredRequests();
    const customerRequests = allRequests.filter((r) => r.customerId === quote.customerId);

    return {
      success: true,
      data: customerRequests
    };
  },

  /**
   * 4. Customer cancel a pending request
   */
  cancelProductRequest: async (token, requestId) => {
    const { data: quote } = await CustomerNegotiationService.getCustomerQuotation(token);
    if (!quote) throw { status: 403, message: 'Unauthorized customer access token.' };

    const allRequests = getStoredRequests();
    const reqIndex = allRequests.findIndex((r) => r.id === requestId && r.customerId === quote.customerId);

    if (reqIndex === -1) {
      throw { status: 404, message: 'Product request not found or does not belong to your account.' };
    }

    const targetReq = allRequests[reqIndex];
    if (targetReq.status !== 'PENDING') {
      throw { status: 400, message: `Cannot cancel a request that is already ${targetReq.status}.` };
    }

    targetReq.status = 'CANCELLED';
    targetReq.salesResponse = 'Cancelled by customer.';
    targetReq.reviewedAt = new Date().toISOString();
    saveStoredRequests(allRequests);

    logAuditEvent({
      user: quote.contactPerson,
      role: 'CUSTOMER',
      action: AUDIT_ACTIONS.PRODUCT_REQUEST_CANCELLED,
      resource: 'PRODUCT_REQUEST',
      resourceId: requestId,
      result: 'SUCCESS',
      reason: 'Customer cancelled pending product request'
    });

    return {
      success: true,
      data: targetReq,
      message: 'Product request cancelled successfully.'
    };
  },

  /**
   * 5. Sales Rep / Internal API: Get all product requests across customers
   */
  getAllRequestsForSales: async () => {
    const allRequests = getStoredRequests();
    return {
      success: true,
      data: allRequests
    };
  },

  /**
   * 6. Sales Rep Action: ACCEPT Customer Product Request
   * Integrates through existing quotation workflow and verifies approval thresholds.
   */
  acceptProductRequest: async (requestId, { salesRepName = 'Alex Rivera', salesResponse = '', discountPct = 10 } = {}) => {
    const allRequests = getStoredRequests();
    const reqIndex = allRequests.findIndex((r) => r.id === requestId);

    if (reqIndex === -1) {
      throw { status: 404, message: 'Product request not found.' };
    }

    const req = allRequests[reqIndex];
    if (req.status !== 'PENDING') {
      throw { status: 400, message: `Request is already in ${req.status} status.` };
    }

    // Retrieve associated quotation and add the line item
    const quoteRes = await CustomerNegotiationService.getCustomerQuotation('demo-token-123');
    const quote = quoteRes.data;

    const discountNumber = Number(discountPct) || 10;
    const itemTotal = req.quantity * req.unitPrice * (1 - discountNumber / 100);

    const newLineItem = {
      id: 'item-req-' + Date.now(),
      name: `${req.productName}`,
      qty: req.quantity,
      price: req.unitPrice,
      discount: discountNumber,
      total: Math.round(itemTotal * 100) / 100
    };

    // Update Quotation line items via Quotation Service
    CustomerNegotiationService.addDirectLineItemToQuote('demo-token-123', newLineItem);

    // Evaluate approval threshold
    const exceedsThreshold = discountNumber > 10;
    let quoteStatus = 'Updated (Product Added: ' + req.productName + ')';
    if (exceedsThreshold) {
      quoteStatus = `Under Re-Approval (Threshold Exceeded: ${discountNumber}%)`;
    }
    CustomerNegotiationService.updateQuoteStatus('demo-token-123', quoteStatus);

    // Update Request status
    req.status = 'ACCEPTED';
    req.reviewedBy = salesRepName;
    req.reviewedAt = new Date().toISOString();
    req.salesResponse = salesResponse || `Approved and added ${req.quantity}x ${req.productName} to active quotation proposal at ${discountNumber}% standard discount.`;
    saveStoredRequests(allRequests);

    logAuditEvent({
      user: salesRepName,
      role: 'SALES_REP',
      action: AUDIT_ACTIONS.PRODUCT_REQUEST_ACCEPTED,
      resource: 'PRODUCT_REQUEST',
      resourceId: requestId,
      result: 'ACCEPTED_AND_ADDED_TO_QUOTE',
      reason: `Sales Rep accepted request. Added ${req.quantity}x ${req.productName} to quotation ${req.quotationId}.`,
      metadata: { quotationId: req.quotationId, itemTotal, discountNumber }
    });

    return {
      success: true,
      data: req,
      newLineItem,
      quoteStatus,
      reApprovalTriggered: exceedsThreshold,
      message: `Product request ${req.id} accepted. ${req.quantity}x ${req.productName} has been officially added to Quotation ${req.quotationId}.`
    };
  },

  /**
   * 7. Sales Rep Action: REJECT Customer Product Request
   */
  rejectProductRequest: async (requestId, { salesRepName = 'Alex Rivera', reason = '' } = {}) => {
    const allRequests = getStoredRequests();
    const reqIndex = allRequests.findIndex((r) => r.id === requestId);

    if (reqIndex === -1) {
      throw { status: 404, message: 'Product request not found.' };
    }

    const req = allRequests[reqIndex];
    if (req.status !== 'PENDING') {
      throw { status: 400, message: `Request is already in ${req.status} status.` };
    }

    req.status = 'REJECTED';
    req.reviewedBy = salesRepName;
    req.reviewedAt = new Date().toISOString();
    req.salesResponse = reason || 'Product currently unavailable for inclusion in this quotation package.';
    saveStoredRequests(allRequests);

    logAuditEvent({
      user: salesRepName,
      role: 'SALES_REP',
      action: AUDIT_ACTIONS.PRODUCT_REQUEST_REJECTED,
      resource: 'PRODUCT_REQUEST',
      resourceId: requestId,
      result: 'REJECTED',
      reason: `Sales Rep rejected product request. Reason: ${req.salesResponse}`,
      metadata: { quotationId: req.quotationId }
    });

    return {
      success: true,
      data: req,
      message: `Product request ${req.id} rejected.`
    };
  }
};

export default ProductRequestService;
