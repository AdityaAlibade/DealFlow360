import React from 'react';
import QuotationBuilder from './QuotationBuilder';
import QuotationStatus from './QuotationStatus';

const QuotationDetail = ({ id }) => {
  // TODO: Fetch quote data by id from quotationAPI.getById
  return (
    <div className="space-y-6">
      <QuotationStatus id={id} status="Draft" />
      <QuotationBuilder quotationId={id} />
    </div>
  );
};

export default QuotationDetail;
