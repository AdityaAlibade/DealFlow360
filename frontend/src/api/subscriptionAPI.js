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

export const subscriptionAPI = {
  getAll: async (params) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/subscriptions`, { headers: getHeaders(), params });
      return res.data;
    } catch {
      return apiClient('/subscriptions');
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/subscriptions/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/subscriptions/' + id);
    }
  },

  getPlans: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/subscriptions/plans`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/subscriptions/plans');
    }
  },

  create: async (subscriptionData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/subscriptions`, subscriptionData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/subscriptions', { method: 'POST', body: subscriptionData });
    }
  },

  createPlan: async (planData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/subscriptions/plans`, planData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/subscriptions/plans', { method: 'POST', body: planData });
    }
  },

  pause: async (id) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/subscriptions/${id}/pause`, {}, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/subscriptions/${id}/pause`, { method: 'POST' });
    }
  },

  resume: async (id) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/subscriptions/${id}/resume`, {}, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/subscriptions/${id}/resume`, { method: 'POST' });
    }
  },

  cancel: async (id) => {
    try {
      const res = await axios.delete(`${API_BASE_URL}/subscriptions/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/subscriptions/' + id, { method: 'DELETE' });
    }
  },

  getBillingSchedule: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/subscriptions/${id}/billing-schedule`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/subscriptions/${id}/billing-schedule`);
    }
  }
};

export default subscriptionAPI;
