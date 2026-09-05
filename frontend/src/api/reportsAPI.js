import axios from 'axios';
import apiClient from './client';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('dealflow360_token') || 'jwt-salesmanager-token-dealflow360';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const reportsAPI = {
  getExecutiveSummary: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/reports`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/reports');
    }
  },

  getSalesReport: async (filters) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/reports/revenue`, { headers: getHeaders(), params: filters });
      return res.data;
    } catch {
      return apiClient('/reports/sales', { params: filters });
    }
  },

  getMarginReport: async (filters) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/reports/discounts`, { headers: getHeaders(), params: filters });
      return res.data;
    } catch {
      return apiClient('/reports/margins', { params: filters });
    }
  },

  getApprovalsReport: async (filters) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/reports/approvals`, { headers: getHeaders(), params: filters });
      return res.data;
    } catch {
      return apiClient('/reports/approvals', { params: filters });
    }
  },

  getPerformanceReport: async (filters) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/reports/performance`, { headers: getHeaders(), params: filters });
      return res.data;
    } catch {
      return apiClient('/reports/performance', { params: filters });
    }
  }
};

export default reportsAPI;
