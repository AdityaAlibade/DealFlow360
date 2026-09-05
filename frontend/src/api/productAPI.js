import axios from 'axios';
import apiClient from './client';
import ProductRequestService from '../services/productRequestService';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('dealflow360_token') || 'jwt-salesrep-token-dealflow360';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const productAPI = {
  getAll: async (params) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products`, { headers: getHeaders(), params });
      return res.data;
    } catch {
      return apiClient('/products', { params });
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/products/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/products/' + id);
    }
  },

  create: async (productData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/products`, productData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/products', { method: 'POST', body: productData });
    }
  },

  update: async (id, productData) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/products/${id}`, productData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/products/' + id, { method: 'PUT', body: productData });
    }
  },

  delete: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/products/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/products/' + id, { method: 'DELETE' });
    }
  },

  // Customer Product Requests (Internal Sales Rep & Admin endpoints)
  getAllCustomerRequests: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/customer-portal/requests`, { headers: getHeaders() });
      return res.data?.data?.productRequests || res.data;
    } catch {
      return ProductRequestService.getAllRequestsForSales();
    }
  },

  acceptCustomerRequest: async (requestId, options) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/quotations/convert-request/${requestId}`, options || {}, { headers: getHeaders() });
      return res.data;
    } catch {
      return ProductRequestService.acceptProductRequest(requestId, options);
    }
  },

  rejectCustomerRequest: async (requestId, options) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/customer-portal/requests/${requestId}/cancel`, options || {}, { headers: getHeaders() });
      return res.data;
    } catch {
      return ProductRequestService.rejectCustomerRequest(requestId, options);
    }
  }
};

export default productAPI;
