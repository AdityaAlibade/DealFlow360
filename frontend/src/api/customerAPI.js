import apiClient from './client';

export const customerAPI = {
  /**
   * Fetch all customers with real-time counters from PostgreSQL
   */
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/customers?${query}` : '/customers';
    return apiClient(endpoint, { method: 'GET' });
  },

  /**
   * Fetch customer by ID with full quotation, order, and request relations
   */
  getById: (id) => {
    return apiClient(`/customers/${id}`, { method: 'GET' });
  },

  /**
   * Create new customer in PostgreSQL
   */
  create: (customerData) => {
    return apiClient('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  },

  /**
   * Update existing customer in PostgreSQL
   */
  update: (id, customerData) => {
    return apiClient(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  }
};

export default customerAPI;
