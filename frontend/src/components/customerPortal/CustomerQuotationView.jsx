import React from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

const CustomerQuotationView = ({ token }) => {
  // TODO: Load live quote payload from customerPortalAPI.getQuoteByToken
  return (
    <Card title="Proposed Package Details">
      <div className="space-y-4">
        <div className="border-b pb-4">
          <h4 className="font-semibold text-slate-800">DealFlow360 Enterprise Plan</h4>
          <p className="text-sm text-slate-500">50 Seats + 24/7 SLA + Dedicated Infrastructure</p>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-base font-bold text-slate-800">Total Investment:</span>
          <span className="text-2xl font-bold text-primary">₹10,03,000</span>
        </div>
        <div className="pt-4 flex gap-3">
          <Button variant="primary" className="w-full">
            Accept & Sign Quotation
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CustomerQuotationView;
