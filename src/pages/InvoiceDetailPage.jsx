// TODO: Invoice detail page with payment reconciliation
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import InvoiceDetail from '../components/invoices/InvoiceDetail';

const InvoiceDetailPage = () => {
  const { id } = useParams();
  // TODO: Fetch invoice and reconciliation transactions
  return (
    <MainLayout>
      {/* TODO: Build invoice detail page UI */}
      <InvoiceDetail id={id} />
    </MainLayout>
  );
};

export default InvoiceDetailPage;
