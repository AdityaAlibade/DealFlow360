import apiClient from './client';

export const warehouseAPI = {
  /**
   * Fetch all warehouses with stock levels from PostgreSQL
   */
  getAll: () => {
    return apiClient('/warehouses', { method: 'GET' });
  },

  /**
   * Fetch single warehouse with fulfillments and stock details
   */
  getById: (id) => {
    return apiClient(`/warehouses/${id}`, { method: 'GET' });
  },

  /**
   * Create new warehouse in PostgreSQL
   */
  create: (warehouseData) => {
    return apiClient('/warehouses', {
      method: 'POST',
      body: JSON.stringify(warehouseData)
    });
  },

  /**
   * Update warehouse details in PostgreSQL
   */
  update: (id, warehouseData) => {
    return apiClient(`/warehouses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(warehouseData)
    });
  },

  /**
   * Add or update product stock at a specific warehouse
   */
  updateStock: (warehouseId, stockData) => {
    return apiClient(`/warehouses/${warehouseId}/stock`, {
      method: 'POST',
      body: JSON.stringify(stockData)
    });
  }
};

export default warehouseAPI;
