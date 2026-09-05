// TODO: Subscription billing detail page with one-time and recurring lines
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import BillingDetail from '../components/subscriptions/BillingDetail';
import BillingSchedule from '../components/subscriptions/BillingSchedule';

const SubscriptionDetailPage = () => {
  const { id } = useParams();
  // TODO: Fetch subscription details and billing timeline
  return (
    <MainLayout>
      {/* TODO: Build subscription detail page UI */}
      <BillingDetail id={id} />
      <BillingSchedule subscriptionId={id} />
    </MainLayout>
  );
};

export default SubscriptionDetailPage;
