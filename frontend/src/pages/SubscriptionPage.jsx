import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import SubscriptionList from '../components/subscriptions/SubscriptionList';

const SubscriptionPage = () => {
  // TODO: Render recurring subscription contracts in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Subscriptions & Recurring Plans</h1>
        <SubscriptionList />
      </div>
    </MainLayout>
  );
};

export default SubscriptionPage;
