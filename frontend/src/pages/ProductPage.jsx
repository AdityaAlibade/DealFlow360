import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Table from '../components/common/Table';

const ProductPage = () => {
  const navigate = useNavigate();

  const products = [
    {
      id: 'PRD-101',
      name: 'Laptop Pro 14',
      category: 'Hardware',
      variants: '2 Variants (16GB, 32GB)',
      price: '₹1,000',
      unit: 'Each',
      status: 'Active'
    },
    {
      id: 'PRD-102',
      name: 'Onsite Setup Service',
      category: 'Services',
      variants: '-',
      price: '₹450',
      unit: 'Each',
      status: 'Active'
    },
    {
      id: 'PRD-103',
      name: 'Docking Station USB-C',
      category: 'Hardware',
      variants: '2 Variants',
      price: '₹180',
      unit: 'Each',
      status: 'Active'
    },
    {
      id: 'PRD-104',
      name: 'Care Plan 3 years',
      category: 'Subscription',
      variants: '-',
      price: '₹10/month',
      unit: 'Recurring',
      status: 'Active'
    }
  ];

  const columns = [
    {
      header: 'Product Name',
      accessor: 'name',
      render: (r) => (
        <span className="font-semibold text-slate-800 flex items-center gap-1 group-hover:text-[#a459a8]">
          {r.name} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
        </span>
      )
    },
    { header: 'Category', accessor: 'category', render: (r) => <Badge variant="default">{r.category}</Badge> },
    { header: 'Variants Available', accessor: 'variants', render: (r) => <span className="text-slate-500">{r.variants}</span> },
    { header: 'Base Catalog Price', accessor: 'price', render: (r) => <span className="font-mono font-bold text-slate-900">{r.price}</span> },
    { header: 'Billing Unit', accessor: 'unit' }
  ];

  return (
    <MainLayout>
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Product Catalog</h1>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="success">125 active</Badge>
              <Badge variant="default">0 inactive</Badge>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage SKUs, tiered pricing rules, and subscription billing attributes</p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/products/PRD-101')}
        >
          New Product
        </Button>
      </div>

      <Card title="Master Product Directory">
        <Table
          columns={columns}
          data={products}
          onRowClick={(row) => navigate(`/products/${row.id}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default ProductPage;
