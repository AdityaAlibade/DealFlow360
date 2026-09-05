import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import FulfillmentDetail from '../components/fulfillment/FulfillmentDetail';

const FulfillmentDetailPage = () => {
  const { id } = useParams();

  // TODO: Render warehouse split allocation in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Fulfillment Order Detail</h1>
        <FulfillmentDetail id={id} />
      </div>
    </MainLayout>
  );
};

export default FulfillmentDetailPage;
