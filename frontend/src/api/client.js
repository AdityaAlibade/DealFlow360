// TODO: Setup base axios client instance and interceptors

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

export const apiClient = async (endpoint, options = {}) => {
  // TODO: Execute HTTP requests with auth headers
  console.log('[API Request] ' + (options.method || 'GET') + ' ' + BASE_URL + endpoint);
  return { success: true };
};

export default apiClient;
