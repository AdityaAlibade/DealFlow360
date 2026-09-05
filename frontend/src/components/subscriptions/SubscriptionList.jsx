import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const SubscriptionList = () => {
  // TODO: Fetch subscription plans from subscriptionAPI.getAll
  const columns = [
    { header: 'Contract ID', accessor: 'id' },
    { header: 'Account', accessor: 'account' },
    { header: 'Billing Cycle', accessor: 'cycle' },
    { header: 'MRR / ARR', accessor: 'revenue' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>
    }
  ];

  const dummyData = [
    { id: 'SUB-101', account: 'Acme Global', cycle: 'Monthly', revenue: '$1,200/mo', status: 'Active', statusVariant: 'success' },
    { id: 'SUB-102', account: 'Stark Industries', cycle: 'Annual', revenue: '$85,000/yr', status: 'Active', statusVariant: 'success' },
  ];

  return <Table columns={columns} data={dummyData} />;
};

export default SubscriptionList;
