/**
 * Dedicated Customer Negotiation Service for DealFlow360
 * Delegates all customer portal quote retrieval, counter-discount proposals,
 * and final confirmation directly to customerPortalAPI (PostgreSQL backed).
 */

import customerPortalAPI from '../api/customerPortalAPI';

export const CustomerNegotiationService = {
  getCustomerQuotation: async (token) => {
    return customerPortalAPI.getQuoteByToken(token);
  },

  addLineComment: async (token, lineId, comment) => {
    return customerPortalAPI.sendMessage(token, { quotationItemId: lineId, message: comment });
  },

  submitCounterDiscount: async (token, requestedDiscount, customerNotes, requestedDeliveryDate) => {
    return customerPortalAPI.negotiateQuote(token, {
      counterDiscount: requestedDiscount,
      comment: customerNotes,
      requestedDeliveryDate
    });
  },

  confirmAndAcceptQuote: async (token, approvalNotes) => {
    return customerPortalAPI.acceptTerms(token, { notes: approvalNotes });
  }
};

export default CustomerNegotiationService;
