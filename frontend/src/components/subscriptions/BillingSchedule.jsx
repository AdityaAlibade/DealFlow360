import React from 'react';
import Card from '../common/Card';

const BillingSchedule = () => {
  // TODO: Render next upcoming billing date and scheduled prorations
  return (
    <Card title="Billing Schedule">
      <div className="space-y-2 text-sm text-slate-600">
        <p>Next Invoice Date: <strong className="text-slate-800">June 1, 2024</strong></p>
        <p>Auto-renew: <strong className="text-slate-800">Enabled</strong></p>
      </div>
    </Card>
  );
};

export default BillingSchedule;
