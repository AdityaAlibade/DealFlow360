import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import BillingDetail from '../components/subscriptions/BillingDetail';

const SubscriptionDetailPage = () => {
  const { id } = useParams();

  // TODO: Render subscription contract lines and schedule in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Subscription Contract Detail</h1>
        <BillingDetail id={id} />
      </div>
    </MainLayout>
  );
};

export default SubscriptionDetailPage;
