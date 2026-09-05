import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const FulfillmentList = () => {
  // TODO: Fetch fulfillment orders from fulfillmentAPI.getAll
  const columns = [
    { header: 'Order ID', accessor: 'id' },
    { header: 'Quote Ref', accessor: 'quoteRef' },
    { header: 'Warehouse Locations', accessor: 'warehouses' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={row.statusVariant}>{row.status}</Badge>
    }
  ];

  const dummyData = [
    { id: 'FL-9001', quoteRef: 'QT-2024-001', warehouses: 'US-East, EU-Central', status: 'Allocated', statusVariant: 'info' }
  ];

  return (
    <div className="space-y-4">
      <Table columns={columns} data={dummyData} />
    </div>
  );
};

export default FulfillmentList;
