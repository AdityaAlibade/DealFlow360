/**
 * Customer Product Catalog & Product Request Service for DealFlow360
 * Delegates all product catalog views and request lifecycle calls to productAPI & customerPortalAPI.
 */

import productAPI from '../api/productAPI';
import customerPortalAPI from '../api/customerPortalAPI';

export const ProductRequestService = {
  getAvailableProducts: async (token, options = {}) => {
    return customerPortalAPI.getProducts(token, options);
  },

  submitProductRequest: async (token, requestData) => {
    return customerPortalAPI.createProductRequest(token, requestData);
  },

  getAllCustomerRequests: async () => {
    return productAPI.getAllCustomerRequests();
  },

  acceptCustomerRequest: async (requestId, payload) => {
    return productAPI.acceptCustomerRequest(requestId, payload);
  },

  rejectCustomerRequest: async (requestId, payload) => {
    return productAPI.rejectCustomerRequest(requestId, payload);
  },

  cancelCustomerRequest: async (token, requestId) => {
    return customerPortalAPI.cancelProductRequest(token, requestId);
  }
};

export default ProductRequestService;
