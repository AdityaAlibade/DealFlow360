// TODO: Approval workflow API endpoints
import axiosInstance from './client';

export const approvalAPI = {
  // TODO: Implement get approvals list API call
  getApprovals: async (params) => {},
  // TODO: Implement get approval detail API call
  getApprovalById: async (id) => {},
  // TODO: Implement approve quote API call
  approve: async (id, notes) => {},
  // TODO: Implement reject quote API call
  reject: async (id, reason) => {},
  // TODO: Implement get risk breakdown API call
  getRiskBreakdown: async (id) => {},
};

export default approvalAPI;
