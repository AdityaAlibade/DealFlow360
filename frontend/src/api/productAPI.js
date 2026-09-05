import apiClient from './client';

export const productAPI = {
  getAll: async (params) => {
    // TODO: GET /products
    return apiClient('/products', { params });
  },
  getById: async (id) => {
    // TODO: GET /products/:id
    return apiClient('/products/' + id);
  },
  create: async (productData) => {
    // TODO: POST /products
    return apiClient('/products', { method: 'POST', body: productData });
  },
  update: async (id, productData) => {
    // TODO: PUT /products/:id
    return apiClient('/products/' + id, { method: 'PUT', body: productData });
  }
};

export default productAPI;
