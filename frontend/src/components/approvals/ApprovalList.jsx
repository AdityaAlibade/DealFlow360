import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const ApprovalList = () => {
  // TODO: Fetch pending approvals from approvalAPI.getAll
  const columns = [
    { header: 'Quote Ref', accessor: 'quoteId' },
    { header: 'Requester', accessor: 'requester' },
    { header: 'Discount Requested', accessor: 'discount' },
    { header: 'Risk Score', accessor: 'riskScore' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>
    }
  ];

  const dummyData = [
    { quoteId: 'QT-2024-002', requester: 'Jane Doe', discount: '35%', riskScore: 'Medium', status: 'Pending', statusVariant: 'warning' },
  ];

  return (
    <div className="space-y-4">
      <Table columns={columns} data={dummyData} />
    </div>
  );
};

export default ApprovalList;
