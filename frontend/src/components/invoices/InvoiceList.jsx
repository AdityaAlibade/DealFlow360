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
    { id: 'INV-2024-089', customer: 'Acme Global', dueDate: '2024-06-15', amount: '$14,200', status: 'Paid', statusVariant: 'success' },
    { id: 'INV-2024-090', customer: 'Stark Industries', dueDate: '2024-06-20', amount: '$85,000', status: 'Unpaid', statusVariant: 'warning' },
  ];

  return <Table columns={columns} data={dummyData} />;
};

export default InvoiceList;
