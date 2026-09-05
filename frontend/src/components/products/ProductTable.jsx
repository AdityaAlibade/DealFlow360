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
    { sku: 'SKU-HW-LPT-14', name: 'Enterprise Laptop Pro 14"', price: '₹1,50,000', cost: '₹1,10,000', margin: '26.7%' },
    { sku: 'SKU-HW-MON-4K', name: 'UltraHD 4K Executive Monitor 32"', price: '₹45,000', cost: '₹32,000', margin: '28.9%' },
    { sku: 'SKU-ACC-DCK-01', name: 'Thunderbolt 4 Docking Station Pro', price: '₹18,500', cost: '₹12,000', margin: '35.1%' },
    { sku: 'SKU-SFT-CPQ-YR', name: 'DealFlow360 Enterprise CPQ Platform', price: '₹3,50,000', cost: '₹85,000', margin: '75.7%' }
  ];

  return <Table columns={columns} data={dummyData} />;
};

export default ProductTable;
