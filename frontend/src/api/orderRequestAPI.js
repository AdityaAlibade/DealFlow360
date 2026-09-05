import axios from 'axios';
import apiClient from './client';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('dealflow360_token') || 'jwt-salesrep-token-dealflow360';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const orderRequestAPI = {
  getAll: async (params) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/order-requests`, { headers: getHeaders(), params });
      return res.data;
    } catch {
      return apiClient('/order-requests', { params });
    }
  },

  getStats: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/order-requests/stats`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/order-requests/stats');
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/order-requests/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/order-requests/${id}`);
    }
  },

  update: async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/order-requests/${id}`, data, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/order-requests/${id}`, { method: 'PUT', body: data });
    }
  },

  convertToQuotation: async (id, data = {}) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/order-requests/${id}/convert`, data, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  }
};

export default orderRequestAPI;
