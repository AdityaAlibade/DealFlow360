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

export const dashboardAPI = {
  getMetrics: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/metrics`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/dashboard/metrics');
    }
  },
  getPipelineSummary: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/pipeline`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/dashboard/pipeline');
    }
  },
  getRecentActivity: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/activity`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/dashboard/activity');
    }
  },
  getDealHealthSummary: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/health`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/dashboard/health');
    }
  }
};

export default dashboardAPI;
