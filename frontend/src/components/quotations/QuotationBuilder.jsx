import React from 'react';
import Cart from './Cart';
import UpsellPanel from './UpsellPanel';
import MarginIndicator from './MarginIndicator';

const QuotationBuilder = ({ quotationId }) => {
  // TODO: Manage dynamic product addition, tiered discounts, and bundle calculations
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Cart />
        <UpsellPanel />
      </div>
      <div className="space-y-6">
        <MarginIndicator margin={34.5} />
        {/* TODO: Add Price summary and Approval submit card */}
      </div>
    </div>
  );
};

export default QuotationBuilder;
