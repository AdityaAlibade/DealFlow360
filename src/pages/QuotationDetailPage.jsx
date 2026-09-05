// TODO: Quotation detail page with builder, cart, upsells
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import QuotationDetail from '../components/quotations/QuotationDetail';
import QuotationBuilder from '../components/quotations/QuotationBuilder';

const QuotationDetailPage = () => {
  const { id } = useParams();
  // TODO: Fetch quotation data, handle add/remove items
  return (
    <MainLayout>
      {/* TODO: Build quotation builder UI */}
      <QuotationDetail id={id} />
      <QuotationBuilder />
    </MainLayout>
  );
};

export default QuotationDetailPage;
