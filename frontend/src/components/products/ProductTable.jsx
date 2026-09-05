import React from 'react';
import Table from '../common/Table';

const ProductTable = () => {
  // TODO: Display searchable, filterable product catalog table
  const columns = [
    { header: 'SKU', accessor: 'sku' },
    { header: 'Product Name', accessor: 'name' },
    { header: 'Base Price', accessor: 'price' },
    { header: 'Standard Cost', accessor: 'cost' },
    { header: 'Target Margin', accessor: 'margin' }
  ];

  const dummyData = [
    { sku: 'CLD-001', name: 'Enterprise Cloud Platform (Seat)', price: '$120.00', cost: '$40.00', margin: '66.7%' },
    { sku: 'SRV-002', name: 'Dedicated Server Hardware', price: '$4,500.00', cost: '$3,100.00', margin: '31.1%' }
  ];

  return <Table columns={columns} data={dummyData} />;
};

export default ProductTable;
