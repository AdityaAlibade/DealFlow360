import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import QuotationDetail from '../components/quotations/QuotationDetail';

const QuotationDetailPage = () => {
  const { id } = useParams();

  // TODO: Render quotation detail and CPQ builder in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Quotation Detail</h1>
        <QuotationDetail id={id} />
      </div>
    </MainLayout>
  );
};

export default QuotationDetailPage;
