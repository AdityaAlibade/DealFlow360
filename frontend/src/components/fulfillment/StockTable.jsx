import React from 'react';
import Table from '../common/Table';

const StockTable = () => {
  // TODO: Display real-time inventory on hand across warehouses
  const columns = [
    { header: 'SKU', accessor: 'sku' },
    { header: 'Product', accessor: 'name' },
    { header: 'Required', accessor: 'required' },
    { header: 'In Stock', accessor: 'inStock' },
    { header: 'Shortage', accessor: 'shortage' },
  ];

  const dummyData = [
    { sku: 'HW-SRV-01', name: 'Dedicated Server Blade', required: 50, inStock: 42, shortage: 8 },
  ];

  return <Table columns={columns} data={dummyData} />;
};

export default StockTable;
