import React from 'react';
import CustomerQuotationView from './CustomerQuotationView';
import CounterProposal from './CounterProposal';

const CustomerNegotiation = ({ token }) => {
  // TODO: Fetch quote review details by negotiation token
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900">Quotation Proposal Review</h2>
        <p className="text-sm text-slate-500 mt-1">Review the quotation terms, request adjustments, or accept online.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CustomerQuotationView token={token} />
        </div>
        <div>
          <CounterProposal token={token} />
        </div>
      </div>
    </div>
  );
};

export default CustomerNegotiation;
