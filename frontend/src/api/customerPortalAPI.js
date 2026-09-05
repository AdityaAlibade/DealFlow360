import apiClient from './client';

export const customerPortalAPI = {
  getQuoteByToken: async (token) => {
    // TODO: GET /customer-portal/:token
    return apiClient('/customer-portal/' + token);
  },
  submitCounterProposal: async (token, proposalData) => {
    // TODO: POST /customer-portal/:token/counter-proposal
    return apiClient('/customer-portal/' + token + '/counter-proposal', { method: 'POST', body: proposalData });
  },
  acceptQuote: async (token) => {
    // TODO: POST /customer-portal/:token/accept
    return apiClient('/customer-portal/' + token + '/accept', { method: 'POST' });
  }
};

export default customerPortalAPI;
