import apiClient from './client';

export const approvalAPI = {
  getAll: async () => {
    // TODO: GET /approvals
    return apiClient('/approvals');
  },
  getById: async (id) => {
    // TODO: GET /approvals/:id
    return apiClient('/approvals/' + id);
  },
  approve: async (id, comments) => {
    // TODO: POST /approvals/:id/approve
    return apiClient('/approvals/' + id + '/approve', { method: 'POST', body: { comments } });
  },
  reject: async (id, reason) => {
    // TODO: POST /approvals/:id/reject
    return apiClient('/approvals/' + id + '/reject', { method: 'POST', body: { reason } });
  }
};

export default approvalAPI;
