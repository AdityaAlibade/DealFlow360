import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const SubscriptionList = ({ data = [], onRowClick }) => {
  const columns = [
    { header: 'Contract ID', accessor: 'id', render: (r) => <span className="font-mono font-bold text-[#a459a8]">{r.id || r.planName}</span> },
    { header: 'Account / Plan', accessor: 'account', render: (r) => <span className="font-semibold text-slate-800">{r.customer?.name || r.account || r.planName}</span> },
    { header: 'Billing Cycle', accessor: 'billingCycle', render: (r) => <span className="text-slate-600">{r.billingCycle || r.cycle || 'Monthly'}</span> },
    { header: 'Recurring Amount', accessor: 'recurringAmount', render: (r) => <span className="font-mono font-bold text-slate-900">₹{Number(r.recurringAmount || r.amount || 0).toLocaleString('en-IN')}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status === 'ACTIVE' || row.status === 'Active' ? 'success' : 'warning'} dot>
          {row.status || 'Active'}
        </Badge>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      data={data}
      emptyMessage="No active subscription contracts found."
      onRowClick={onRowClick}
    />
  );
};

export default SubscriptionList;
