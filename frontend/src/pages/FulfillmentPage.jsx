import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';

const FulfillmentPage = () => {
  const navigate = useNavigate();

  const stockData = [];

  const stockColumns = [
    { header: 'Warehouse Location', accessor: 'warehouse', render: (r) => <span className="font-semibold text-slate-800">{r.warehouse}</span> },
    { header: 'Product Item', accessor: 'product' },
    { header: 'In Stock', accessor: 'inStock', render: (r) => <span className="font-mono">{r.inStock}</span> },
    { header: 'Reserved', accessor: 'reserved', render: (r) => <span className="font-mono text-amber-600">{r.reserved}</span> },
    {
      header: 'Available',
      accessor: 'available',
      render: (r) => (
        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
          {r.available}
        </span>
      )
    }
  ];

  const ordersData = [];


  const ordersColumns = [
    {
      header: 'Order Ref',
      accessor: 'order',
      render: (r) => (
        <span className="font-mono font-bold text-[#a459a8] flex items-center gap-1 group-hover:underline">
          {r.order} <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      )
    },
    { header: 'Customer', accessor: 'customer', render: (r) => <span className="font-semibold text-slate-800">{r.customer}</span> },
    { header: 'Quantity', accessor: 'qty' },
    { header: 'Warehouse Allocation', accessor: 'warehouses' },
    {
      header: 'Fulfillment Status',
      accessor: 'status',
      render: (r) => <Badge variant={r.statusVariant}>{r.status}</Badge>
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fulfillment & Stock</h1>
        <p className="text-xs text-slate-500 mt-1">Multi-location inventory tracking, warehouse splitting, and backorder logistics</p>
      </div>

      {/* Stock Table */}
      <Card title="Real-time Inventory on Hand" subtitle="Current warehouse stock availability">
        <Table
          columns={stockColumns}
          data={stockData}
          emptyMessage="No inventory stock records configured for warehouses."
        />
      </Card>

      {/* Orders Awaiting Fulfillment */}
      <Card title="Orders Awaiting Fulfillment" subtitle="Manage split shipments and carrier routing">
        <Table
          columns={ordersColumns}
          data={ordersData}
          emptyMessage="No orders currently awaiting fulfillment."
          onRowClick={(row) => navigate(`/fulfillment/${row.order}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default FulfillmentPage;
