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
    { id: 'SUB-2026-881', account: 'Tata Consultancy Services (TCS)', cycle: 'Annual', revenue: '₹3,50,000/yr', status: 'Active', statusVariant: 'success' },
    { id: 'SUB-2026-882', account: 'Infosys Limited', cycle: 'Annual', revenue: '₹1,20,000/yr', status: 'Active', statusVariant: 'success' },
    { id: 'SUB-2026-883', account: 'Reliance Digital Enterprises', cycle: 'Annual', revenue: '₹95,000/yr', status: 'Active', statusVariant: 'success' }
  ];

  return <Table columns={columns} data={dummyData} />;
};

export default SubscriptionList;
