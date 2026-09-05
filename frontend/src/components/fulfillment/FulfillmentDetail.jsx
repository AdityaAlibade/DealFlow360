import React from 'react';
import WarehouseSplit from './WarehouseSplit';
import StockTable from './StockTable';
import BackorderHandler from './BackorderHandler';

const FulfillmentDetail = ({ id }) => {
  // TODO: Fetch fulfillment order detail from fulfillmentAPI.getById
  return (
    <div className="space-y-6">
      <StockTable />
      <WarehouseSplit />
      <BackorderHandler />
    </div>
  );
};

export default FulfillmentDetail;
