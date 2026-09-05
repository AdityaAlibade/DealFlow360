import apiClient from './client';

export const invoiceAPI = {
  getAll: async () => {
    // TODO: GET /invoices
    return apiClient('/invoices');
  },
  getById: async (id) => {
    // TODO: GET /invoices/:id
    return apiClient('/invoices/' + id);
  },
  reconcilePayment: async (id, paymentData) => {
    // TODO: POST /invoices/:id/reconcile
    return apiClient('/invoices/' + id + '/reconcile', { method: 'POST', body: paymentData });
  }
};

export default invoiceAPI;
