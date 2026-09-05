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

export const dealHealthAPI = {
  getDashboard: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/deal-health/dashboard`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/deal-health/dashboard');
    }
  },

  getAlerts: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/deal-health/alerts`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/deal-health/alerts');
    }
  },

  getAnomalies: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/deal-health/alerts`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/deal-health/anomalies');
    }
  },

  resolveAlert: async (id) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/deal-health/alerts/${id}/resolve`, {}, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/deal-health/alerts/${id}/resolve`, { method: 'PUT' });
    }
  }
};

export default dealHealthAPI;
