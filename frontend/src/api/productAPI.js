import apiClient from './client';
import ProductRequestService from '../services/productRequestService';

export const productAPI = {
  getAll: async (params) => {
    return apiClient('/products', { params });
  },
  getById: async (id) => {
    return apiClient('/products/' + id);
  },
  create: async (productData) => {
    return apiClient('/products', { method: 'POST', body: productData });
  },
  update: async (id, productData) => {
    return apiClient('/products/' + id, { method: 'PUT', body: productData });
  },

  // Customer Product Requests (Internal Sales Rep & Admin endpoints)
  getAllCustomerRequests: async () => {
    return ProductRequestService.getAllRequestsForSales();
  },
  acceptCustomerRequest: async (requestId, options) => {
    return ProductRequestService.acceptProductRequest(requestId, options);
  },
  rejectCustomerRequest: async (requestId, options) => {
    return ProductRequestService.rejectCustomerRequest(requestId, options);
  }
};

export default productAPI;
