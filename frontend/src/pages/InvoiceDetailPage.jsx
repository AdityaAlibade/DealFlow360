import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import InvoiceDetail from '../components/invoices/InvoiceDetail';

const InvoiceDetailPage = () => {
  const { id } = useParams();

  // TODO: Render payment reconciliation and line items in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Invoice Detail & Reconciliation</h1>
        <InvoiceDetail id={id} />
      </div>
    </MainLayout>
  );
};

export default InvoiceDetailPage;
