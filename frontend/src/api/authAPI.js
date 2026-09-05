import apiClient from './client';

export const authAPI = {
  login: async (credentials) => {
    // TODO: POST /auth/login
    return apiClient('/auth/login', { method: 'POST', body: credentials });
  },
  signup: async (userData) => {
    // TODO: POST /auth/signup
    return apiClient('/auth/signup', { method: 'POST', body: userData });
  },
  getCurrentUser: async () => {
    // TODO: GET /auth/me
    return apiClient('/auth/me');
  }
};

export default authAPI;
