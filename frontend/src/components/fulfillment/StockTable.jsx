import React from 'react';
import Table from '../common/Table';

const StockTable = () => {
  const stockData = [
    { warehouse: 'Main Warehouse (BOM-1)', product: 'Laptop Pro 14', inStock: 40, reserved: 18, available: 22 },
    { warehouse: 'East Depot (CCU-1)', product: 'Laptop Pro 14', inStock: 10, reserved: 6, available: 4 },
    { warehouse: 'Main Warehouse (BOM-1)', product: 'Docking Station USB-C', inStock: 65, reserved: 12, available: 53 },
  ];

  const columns = [
    { header: 'Warehouse Location', accessor: 'warehouse', render: (r) => <span className="font-semibold text-slate-800">{r.warehouse}</span> },
    { header: 'Product Item', accessor: 'product' },
    { header: 'In Stock', accessor: 'inStock', render: (r) => <span className="font-mono">{r.inStock}</span> },
    { header: 'Reserved', accessor: 'reserved', render: (r) => <span className="font-mono text-amber-600">{r.reserved}</span> },
    {
      header: 'Available',
      accessor: 'available',
      render: (r) => <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{r.available}</span>
    }
  ];

  return <Table columns={columns} data={stockData} />;
};

export default StockTable;
