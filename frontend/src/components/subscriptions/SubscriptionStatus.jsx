import React from 'react';
import Badge from '../common/Badge';

const SubscriptionStatus = ({ status = 'Active', plan = 'Pro Plan' }) => {
  // TODO: Manage upgrade, downgrade, or cancellation triggers
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
      <div>
        <span className="text-xs text-slate-400 uppercase">Current Plan</span>
        <h4 className="text-lg font-bold text-slate-900">{plan}</h4>
      </div>
      <Badge variant="success">{status}</Badge>
    </div>
  );
};

export default SubscriptionStatus;
