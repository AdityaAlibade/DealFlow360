import axios from 'axios';
import CustomerNegotiationService from '../services/customerNegotiationService';
import ProductRequestService from '../services/productRequestService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const customerPortalAPI = {
  // Quotation & Negotiation
  getQuoteByToken: async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customer-portal/quote/${token}`);
      return res.data;
    } catch {
      return CustomerNegotiationService.getCustomerQuotation(token);
    }
  },

  submitCounterProposal: async (token, proposalData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/customer-portal/quote/${token}/negotiate`, proposalData);
      return res.data;
    } catch {
      return CustomerNegotiationService.submitCounterOffer(token, proposalData);
    }
  },

  acceptQuote: async (token) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/customer-portal/quote/${token}/confirm`);
      return res.data;
    } catch {
      return CustomerNegotiationService.confirmQuotation(token);
    }
  },

  addLineComment: async (token, lineId, comment) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/customer-portal/quote/${token}/message`, { quotationItemId: lineId, message: comment });
      return res.data;
    } catch {
      return CustomerNegotiationService.addLineComment(token, lineId, comment);
    }
  },

  getNegotiationStatus: async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customer-portal/quote/${token}/history`);
      return res.data;
    } catch {
      return CustomerNegotiationService.getNegotiationStatus(token);
    }
  },

  // Customer Product Catalog & Product Requests
  getProducts: async (token, params) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`, { params });
      return res.data;
    } catch {
      return ProductRequestService.getCustomerCatalog(token, params);
    }
  },

  createProductRequest: async (token, requestData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/customer-portal/requests`, requestData);
      return res.data;
    } catch {
      return ProductRequestService.createProductRequest(token, requestData);
    }
  },

  getProductRequests: async (token) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customer-portal/requests`);
      return res.data;
    } catch {
      return ProductRequestService.getCustomerRequests(token);
    }
  },

  cancelProductRequest: async (token, requestId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/customer-portal/requests/${requestId}/cancel`);
      return res.data;
    } catch {
      return ProductRequestService.cancelProductRequest(token, requestId);
    }
  }
};

export default customerPortalAPI;
