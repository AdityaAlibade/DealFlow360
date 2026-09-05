// TODO: Fulfillment page with warehouse stock and orders
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import FulfillmentList from '../components/fulfillment/FulfillmentList';
import StockTable from '../components/fulfillment/StockTable';

const FulfillmentPage = () => {
  // TODO: Fetch stock and order data
  return (
    <MainLayout>
      {/* TODO: Build fulfillment list UI */}
      <FulfillmentList />
      <StockTable />
    </MainLayout>
  );
};

export default FulfillmentPage;
