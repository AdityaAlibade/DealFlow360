import axios from 'axios';
import apiClient from './client';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const authAPI = {
  login: async (credentials) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      return apiClient('/auth/login', { method: 'POST', body: credentials });
    }
  },

  signup: async (userData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      return apiClient('/auth/signup', { method: 'POST', body: userData });
    }
  },

  registerCustomer: async (customerData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register-customer`, customerData);
      return res.data;
    } catch (err) {
      if (err.response?.data) return err.response.data;
      throw new Error(err.message || 'Failed to create customer account');
    }
  },

  getCurrentUser: async () => {
    try {
      const token = localStorage.getItem('dealflow360_token');
      const res = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch {
      return apiClient('/auth/me');
    }
  },

  forgotPassword: async (email) => {
    const res = await axios.post(`${API_BASE_URL}/auth/forgot-password`, { email });
    return res.data;
  },

  verifyResetToken: async (token) => {
    const res = await axios.get(`${API_BASE_URL}/auth/verify-reset-token/${token}`);
    return res.data;
  },

  resetPassword: async ({ token, password }) => {
    const res = await axios.post(`${API_BASE_URL}/auth/reset-password`, { token, password });
    return res.data;
  }
};

export default authAPI;
