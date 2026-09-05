// TODO: Fulfillment detail page with warehouse split
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import FulfillmentDetail from '../components/fulfillment/FulfillmentDetail';
import WarehouseSplit from '../components/fulfillment/WarehouseSplit';

const FulfillmentDetailPage = () => {
  const { id } = useParams();
  // TODO: Fetch fulfillment order and warehouse stock splits
  return (
    <MainLayout>
      {/* TODO: Build fulfillment detail page UI */}
      <FulfillmentDetail id={id} />
      <WarehouseSplit orderId={id} />
    </MainLayout>
  );
};

export default FulfillmentDetailPage;
