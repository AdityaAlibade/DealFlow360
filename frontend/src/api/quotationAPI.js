import apiClient from './client';

export const quotationAPI = {
  getAll: async (params) => {
    // TODO: GET /quotations
    return apiClient('/quotations', { params });
  },
  getById: async (id) => {
    // TODO: GET /quotations/:id
    return apiClient('/quotations/' + id);
  },
  create: async (quotationData) => {
    // TODO: POST /quotations
    return apiClient('/quotations', { method: 'POST', body: quotationData });
  },
  update: async (id, quotationData) => {
    // TODO: PUT /quotations/:id
    return apiClient('/quotations/' + id, { method: 'PUT', body: quotationData });
  }
};

export default quotationAPI;
