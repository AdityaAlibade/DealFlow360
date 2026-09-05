import apiClient from './client';

export const dealHealthAPI = {
  getAlerts: async () => {
    // TODO: GET /deal-health/alerts
    return apiClient('/deal-health/alerts');
  },
  getAnomalies: async () => {
    // TODO: GET /deal-health/anomalies
    return apiClient('/deal-health/anomalies');
  }
};

export default dealHealthAPI;
