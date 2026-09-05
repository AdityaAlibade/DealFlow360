import axios from 'axios';
import apiClient from './client';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('dealflow360_token') || 'jwt-admin-token-dealflow360';
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
};

export const fulfillmentAPI = {
  // Warehouses & Stock
  getWarehouses: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fulfillment/warehouses`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/fulfillment/warehouses');
    }
  },

  getWarehouseStock: async (warehouseId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fulfillment/warehouses/${warehouseId}/stock`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/fulfillment/warehouses/${warehouseId}/stock`);
    }
  },

  restockWarehouse: async (warehouseId, stockData) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/fulfillment/warehouses/${warehouseId}/restock`, stockData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/fulfillment/warehouses/${warehouseId}/restock`, { method: 'POST', body: stockData });
    }
  },

  // Orders
  getOrders: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/orders');
    }
  },

  getOrderById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/orders/${id}`);
    }
  },

  getOrderSummary: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/orders/${id}/summary`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/orders/${id}/summary`);
    }
  },

  allocateOrder: async (orderId, allocations) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/orders/${orderId}/allocate`, { allocations }, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/orders/${orderId}/allocate`, { method: 'POST', body: { allocations } });
    }
  },

  // Fulfillments
  getAll: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fulfillment`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/fulfillment');
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/fulfillment/${id}`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/fulfillment/' + id);
    }
  },

  dispatchFulfillment: async (id, data = {}) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/fulfillment/${id}/dispatch`, data, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/fulfillment/${id}/dispatch`, { method: 'POST', body: data });
    }
  },

  deliverFulfillment: async (id, data = {}) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/fulfillment/${id}/deliver`, data, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/fulfillment/${id}/deliver`, { method: 'POST', body: data });
    }
  },

  // Backorders
  getBackorders: async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/backorders`, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient('/backorders');
    }
  },

  fulfillBackorder: async (backorderId, allocationData = {}) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/backorders/${backorderId}/fulfill`, allocationData, { headers: getHeaders() });
      return res.data;
    } catch {
      return apiClient(`/backorders/${backorderId}/fulfill`, { method: 'POST', body: allocationData });
    }
  }
};

export default fulfillmentAPI;
