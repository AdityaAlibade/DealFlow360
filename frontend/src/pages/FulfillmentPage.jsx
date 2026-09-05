import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';

const FulfillmentPage = () => {
  const navigate = useNavigate();

  const stockData = [
    { warehouse: 'Main Warehouse (BOM-1)', product: 'Laptop Pro 14', inStock: 40, reserved: 18, available: 22 },
    { warehouse: 'East Depot (CCU-1)', product: 'Laptop Pro 14', inStock: 10, reserved: 6, available: 4 },
    { warehouse: 'Main Warehouse (BOM-1)', product: 'Docking Station USB-C', inStock: 65, reserved: 12, available: 53 },
    { warehouse: 'South Hub (BLR-1)', product: 'Server Blade GenX', inStock: 12, reserved: 8, available: 4 },
  ];

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

  const ordersData = [
    {
      order: 'Q-1042',
      customer: 'Acme Corp',
      status: 'Split Pending',
      statusVariant: 'warning',
      warehouses: 'Main + East Depot',
      qty: '24 Units'
    },
    {
      order: 'Q-1030',
      customer: 'Zenith Co',
      status: 'Backorder',
      statusVariant: 'danger',
      warehouses: 'East Depot',
      qty: '12 Units'
    },
    {
      order: 'Q-1025',
      customer: 'Apex Global',
      status: 'Fulfilled',
      statusVariant: 'success',
      warehouses: 'South Hub',
      qty: '8 Units'
    }
  ];

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
        <Table columns={stockColumns} data={stockData} />
      </Card>

      {/* Orders Awaiting Fulfillment */}
      <Card title="Orders Awaiting Fulfillment" subtitle="Manage split shipments and carrier routing">
        <Table
          columns={ordersColumns}
          data={ordersData}
          onRowClick={(row) => navigate(`/fulfillment/${row.order}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default FulfillmentPage;
