import axios from 'axios';
import apiClient from './client';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('dealflow360_token') || 'jwt-financemanager-token-dealflow360';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const invoiceAPI = {
  getAll: async (params) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/invoices`, { headers: getHeaders(), params });
      return res.data;
    } catch {
      return apiClient('/invoices');
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/invoices/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/invoices/' + id);
    }
  },

  generate: async (invoiceData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/invoices`, invoiceData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/invoices', { method: 'POST', body: invoiceData });
    }
  },

  recordPayment: async (id, paymentData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/invoices/${id}/pay`, paymentData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/invoices/${id}/pay`, { method: 'POST', body: paymentData });
    }
  },

  reconcilePayment: async (id, paymentData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/invoices/${id}/pay`, paymentData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/invoices/' + id + '/reconcile', { method: 'POST', body: paymentData });
    }
  }
};

export default invoiceAPI;
