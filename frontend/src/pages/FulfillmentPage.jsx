import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import FulfillmentList from '../components/fulfillment/FulfillmentList';

const FulfillmentPage = () => {
  // TODO: Render fulfillment orders list in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Order Fulfillment & Stock</h1>
        <FulfillmentList />
      </div>
    </MainLayout>
  );
};

export default FulfillmentPage;
