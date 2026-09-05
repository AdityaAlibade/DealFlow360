import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../common/Button';

const QuotationList = () => {
  // TODO: Connect with quotationAPI.getAll
  const columns = [
    { header: 'Quote ID', accessor: 'id' },
    { header: 'Customer', accessor: 'customer' },
    { header: 'Total Value', accessor: 'total' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>
    },
    { header: 'Date', accessor: 'date' }
  ];

  const dummyData = [
    { id: 'QT-2024-001', customer: 'Acme Global', total: '$45,000', status: 'Approved', statusVariant: 'success', date: '2024-05-01' },
    { id: 'QT-2024-002', customer: 'Stark Industries', total: '$128,500', status: 'Pending Approval', statusVariant: 'warning', date: '2024-05-03' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">All Quotations</h3>
        <Button variant="primary">New Quotation</Button>
      </div>
      <Table columns={columns} data={dummyData} />
    </div>
  );
};

export default QuotationList;
