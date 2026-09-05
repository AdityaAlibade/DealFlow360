import apiClient from './client';

export const fulfillmentAPI = {
  getAll: async () => {
    // TODO: GET /fulfillment
    return apiClient('/fulfillment');
  },
  getById: async (id) => {
    // TODO: GET /fulfillment/:id
    return apiClient('/fulfillment/' + id);
  },
  splitWarehouse: async (id, splitData) => {
    // TODO: POST /fulfillment/:id/split
    return apiClient('/fulfillment/' + id + '/split', { method: 'POST', body: splitData });
  }
};

export default fulfillmentAPI;
