import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import InvoiceList from '../components/invoices/InvoiceList';

const InvoicePage = () => {
  // TODO: Render invoices list in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Invoices & Billing</h1>
        <InvoiceList />
      </div>
    </MainLayout>
  );
};

export default InvoicePage;
