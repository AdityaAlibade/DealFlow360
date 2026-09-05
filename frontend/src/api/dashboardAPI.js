import apiClient from './client';

export const dashboardAPI = {
  getMetrics: async () => {
    // TODO: GET /dashboard/metrics
    return apiClient('/dashboard/metrics');
  },
  getRecentActivity: async () => {
    // TODO: GET /dashboard/activity
    return apiClient('/dashboard/activity');
  }
};

export default dashboardAPI;
