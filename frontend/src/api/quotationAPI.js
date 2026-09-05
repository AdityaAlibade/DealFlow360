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

export const quotationAPI = {
  getAll: async (params) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/quotations`, { headers: getHeaders(), params });
      return res.data;
    } catch {
      return apiClient('/quotations', { params });
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/quotations/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/quotations/' + id);
    }
  },

  create: async (quotationData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/quotations`, quotationData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/quotations', { method: 'POST', body: quotationData });
    }
  },

  convertFromRequest: async (requestId) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/quotations/convert-request/${requestId}`, {}, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/quotations/convert-request/${requestId}`, { method: 'POST' });
    }
  },

  update: async (id, quotationData) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/quotations/${id}`, quotationData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/quotations/' + id, { method: 'PUT', body: quotationData });
    }
  },

  delete: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/quotations/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/quotations/' + id, { method: 'DELETE' });
    }
  },

  acceptNegotiation: async (id, negotiationData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/quotations/${id}/accept-negotiation`, negotiationData, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw err;
    }
  },

  submitForApproval: async (id) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/quotations/${id}/submit`, {}, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/quotations/${id}/submit`, { method: 'POST' });
    }
  },

  confirm: async (id) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/quotations/${id}/confirm`, {}, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/quotations/${id}/confirm`, { method: 'POST' });
    }
  }
};

export default quotationAPI;
