import React from 'react';
import Card from '../common/Card';
import BillingSchedule from './BillingSchedule';
import SubscriptionStatus from './SubscriptionStatus';

const BillingDetail = ({ id }) => {
  // TODO: Fetch subscription and one-time billing items from subscriptionAPI.getById
  return (
    <div className="space-y-6">
      <SubscriptionStatus status="Active" plan="Enterprise Tier" />
      <Card title="One-time & Recurring Breakdown">
        <div className="space-y-3">
          <div className="flex justify-between text-sm py-2 border-b">
            <span>Setup & Implementation Fee (One-Time)</span>
            <span className="font-semibold">$5,000</span>
          </div>
          <div className="flex justify-between text-sm py-2 border-b">
            <span>SaaS Platform Seats (Monthly Recurring)</span>
            <span className="font-semibold">$1,200 / mo</span>
          </div>
        </div>
      </Card>
      <BillingSchedule />
    </div>
  );
};

export default BillingDetail;
