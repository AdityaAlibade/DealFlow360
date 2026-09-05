import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const FulfillmentList = ({ data = [], onRowClick }) => {
  const columns = [
    { header: 'Fulfillment / Order ID', accessor: 'id', render: (r) => <span className="font-mono font-bold text-[#a459a8]">{r.fulfillmentNumber || r.order?.orderNumber || r.id}</span> },
    { header: 'Customer', accessor: 'customer', render: (r) => <span className="font-semibold text-slate-800">{r.order?.customer?.name || r.customerName || 'Direct Account'}</span> },
    { header: 'Warehouse Depot', accessor: 'warehouse', render: (r) => <span className="text-slate-700 text-xs font-semibold">{r.warehouse?.name || r.warehouse?.code || 'Central Logistics Hub'}</span> },
    {
      header: 'Fulfillment Status',
      accessor: 'status',
      render: (row) => {
        const s = String(row.status || '').toUpperCase();
        const variant = s.includes('DELIV') || s.includes('COMPL') ? 'success' : s.includes('SHIP') ? 'primary' : 'warning';
        return <Badge variant={variant} dot>{row.status || 'ALLOCATED'}</Badge>;
      }
    }
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={data}
        emptyMessage="No fulfillment shipments recorded."
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default FulfillmentList;
