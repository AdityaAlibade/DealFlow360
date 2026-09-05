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

export const approvalAPI = {
  getAll: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/approvals`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/approvals');
    }
  },

  getPending: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/approvals/pending`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/approvals/pending');
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/approvals/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/approvals/' + id);
    }
  },

  approve: async (id, comments) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/approvals/${id}`, { decision: 'APPROVED', comments }, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      return apiClient('/approvals/' + id + '/approve', { method: 'POST', body: { comments } });
    }
  },

  reject: async (id, reason) => {
    try {
      const res = await axios.put(`${API_BASE_URL}/approvals/${id}`, { decision: 'REJECTED', comments: reason }, { headers: getHeaders() });
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      return apiClient('/approvals/' + id + '/reject', { method: 'POST', body: { reason } });
    }
  }
};

export default approvalAPI;
