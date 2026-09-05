import React from 'react';
import Table from '../common/Table';

const ProductTable = ({ data = [], onRowClick }) => {
  const columns = [
    { header: 'SKU', accessor: 'sku', render: (r) => <span className="font-mono text-xs text-slate-500">{r.sku}</span> },
    { header: 'Product Name', accessor: 'name', render: (r) => <span className="font-semibold text-slate-800">{r.name}</span> },
    { header: 'Base Price', accessor: 'basePrice', render: (r) => <span className="font-mono font-bold text-slate-900">₹{Number(r.basePrice || 0).toLocaleString('en-IN')}</span> },
    { header: 'Standard Cost', accessor: 'standardCost', render: (r) => <span className="font-mono text-slate-600">₹{Number(r.standardCost || 0).toLocaleString('en-IN')}</span> },
    {
      header: 'Margin',
      accessor: 'margin',
      render: (r) => {
        const margin = r.basePrice > 0 ? (((r.basePrice - (r.standardCost || 0)) / r.basePrice) * 100).toFixed(1) : '0.0';
        return <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{margin}%</span>;
      }
    }
  ];

  return (
    <Table
      columns={columns}
      data={data}
      emptyMessage="No catalog products found."
      onRowClick={onRowClick}
    />
  );
};

export default ProductTable;
