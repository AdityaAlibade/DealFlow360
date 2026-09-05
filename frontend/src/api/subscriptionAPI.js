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
  create: async (subscriptionData) => {
    return apiClient('/subscriptions', { method: 'POST', body: subscriptionData });
  },
  createPlan: async (planData) => {
    return apiClient('/subscriptions/plans', { method: 'POST', body: planData });
  },
  updateBilling: async (id, billingData) => {
    return apiClient('/subscriptions/' + id + '/billing', { method: 'PUT', body: billingData });
  }
};

export default subscriptionAPI;
