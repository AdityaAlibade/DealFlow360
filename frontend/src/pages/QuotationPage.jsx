import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import QuotationList from '../components/quotations/QuotationList';

const QuotationPage = () => {
  // TODO: Render quotation management module in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Quotations</h1>
        <QuotationList />
      </div>
    </MainLayout>
  );
};

export default QuotationPage;
