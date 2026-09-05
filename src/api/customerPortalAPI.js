// TODO: Customer portal and public negotiation API endpoints
import axiosInstance from './client';

export const customerPortalAPI = {
  // TODO: Implement get quotation by customer token API call
  getQuotationByToken: async (token) => {},
  // TODO: Implement customer accept quote API call
  acceptQuote: async (token) => {},
  // TODO: Implement customer counter proposal API call
  submitCounterProposal: async (token, proposalData) => {},
};

export default customerPortalAPI;
