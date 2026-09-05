import apiClient from './client';

export const reportsAPI = {
  getSalesReport: async (filters) => {
    // TODO: GET /reports/sales
    return apiClient('/reports/sales', { params: filters });
  },
  getMarginReport: async (filters) => {
    // TODO: GET /reports/margins
    return apiClient('/reports/margins', { params: filters });
  }
};

export default reportsAPI;
