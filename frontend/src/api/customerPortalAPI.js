import CustomerNegotiationService from '../services/customerNegotiationService';
import ProductRequestService from '../services/productRequestService';

export const customerPortalAPI = {
  // Quotation & Negotiation
  getQuoteByToken: async (token) => {
    return CustomerNegotiationService.getCustomerQuotation(token);
  },
  submitCounterProposal: async (token, proposalData) => {
    return CustomerNegotiationService.submitCounterOffer(token, proposalData);
  },
  acceptQuote: async (token) => {
    return CustomerNegotiationService.confirmQuotation(token);
  },
  addLineComment: async (token, lineId, comment) => {
    return CustomerNegotiationService.addLineComment(token, lineId, comment);
  },
  getNegotiationStatus: async (token) => {
    return CustomerNegotiationService.getNegotiationStatus(token);
  },

  // Customer Product Catalog & Product Requests
  getProducts: async (token, params) => {
    return ProductRequestService.getCustomerCatalog(token, params);
  },
  createProductRequest: async (token, requestData) => {
    return ProductRequestService.createProductRequest(token, requestData);
  },
  getProductRequests: async (token) => {
    return ProductRequestService.getCustomerRequests(token);
  },
  cancelProductRequest: async (token, requestId) => {
    return ProductRequestService.cancelProductRequest(token, requestId);
  }
};

export default customerPortalAPI;
