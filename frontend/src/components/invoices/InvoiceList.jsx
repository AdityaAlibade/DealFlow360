import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const InvoiceList = ({ data = [], onRowClick }) => {
  const columns = [
    { header: 'Invoice #', accessor: 'invoiceNumber', render: (r) => <span className="font-mono font-bold text-[#a459a8]">{r.invoiceNumber || r.id}</span> },
    { header: 'Customer', accessor: 'customer', render: (r) => <span className="font-semibold text-slate-800">{r.customer?.name || r.customerName || 'Customer Account'}</span> },
    {
      header: 'Due Date',
      accessor: 'dueDate',
      render: (r) => <span className="text-slate-500 text-xs">{r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : 'Net 30'}</span>
    },
    { header: 'Amount', accessor: 'totalAmount', render: (r) => <span className="font-mono font-bold text-slate-900">₹{Number(r.totalAmount || 0).toLocaleString('en-IN')}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const s = String(row.status || '').toUpperCase();
        const variant = s === 'PAID' ? 'success' : s === 'PARTIALLY_PAID' ? 'warning' : 'danger';
        return <Badge variant={variant} dot>{row.status || 'UNPAID'}</Badge>;
      }
    }
  ];

  return (
    <Table
      columns={columns}
      data={data}
      emptyMessage="No invoices generated yet."
      onRowClick={onRowClick}
    />
  );
};

export default InvoiceList;
