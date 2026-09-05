import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const InvoiceList = () => {
  // TODO: Fetch invoices from invoiceAPI.getAll
  const columns = [
    { header: 'Invoice #', accessor: 'id' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Due Date', accessor: 'dueDate' },
    { header: 'Amount', accessor: 'amount' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>
    }
  ];

  const dummyData = [
    { id: 'INV-2026-101', customer: 'Tata Consultancy Services (TCS)', dueDate: '2026-09-15', amount: '₹10,03,000', status: 'Paid', statusVariant: 'success' },
    { id: 'INV-2026-102', customer: 'Infosys Limited', dueDate: '2026-09-20', amount: '₹11,50,500', status: 'Partially Paid', statusVariant: 'warning' },
    { id: 'INV-2026-103', customer: 'Reliance Digital Enterprises', dueDate: '2026-09-25', amount: '₹6,60,800', status: 'Paid', statusVariant: 'success' },
    { id: 'INV-2026-104', customer: 'Wipro Infotech Solutions', dueDate: '2026-09-30', amount: '₹10,03,000', status: 'Unpaid', statusVariant: 'danger' }
  ];

  return <Table columns={columns} data={dummyData} />;
};

export default InvoiceList;
