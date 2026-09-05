import apiClient from './client';

export const subscriptionAPI = {
  getAll: async () => {
    // TODO: GET /subscriptions
    return apiClient('/subscriptions');
  },
  getById: async (id) => {
    // TODO: GET /subscriptions/:id
    return apiClient('/subscriptions/' + id);
  },
  updateBilling: async (id, billingData) => {
    // TODO: PUT /subscriptions/:id/billing
    return apiClient('/subscriptions/' + id + '/billing', { method: 'PUT', body: billingData });
  }
};

export default subscriptionAPI;
