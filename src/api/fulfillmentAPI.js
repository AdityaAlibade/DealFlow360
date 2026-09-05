// TODO: Fulfillment and warehouse management API endpoints
import axiosInstance from './client';

export const fulfillmentAPI = {
  // TODO: Implement get fulfillments list API call
  getFulfillments: async (params) => {},
  // TODO: Implement get fulfillment detail API call
  getFulfillmentById: async (id) => {},
  // TODO: Implement split warehouse shipment API call
  splitWarehouse: async (id, splitData) => {},
  // TODO: Implement backorder handling API call
  handleBackorder: async (id, data) => {},
};

export default fulfillmentAPI;
