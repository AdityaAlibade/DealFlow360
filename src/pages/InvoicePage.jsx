// TODO: Invoice list page with status filters
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import InvoiceList from '../components/invoices/InvoiceList';

const InvoicePage = () => {
  // TODO: Fetch invoices data
  return (
    <MainLayout>
      {/* TODO: Build invoice list UI */}
      <InvoiceList />
    </MainLayout>
  );
};

export default InvoicePage;
