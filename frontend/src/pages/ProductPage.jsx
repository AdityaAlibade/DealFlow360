import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import productAPI from '../api/productAPI';

const ProductPage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getAll();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setProducts(list);
    } catch (err) {
      console.warn('Failed to fetch product catalog from API:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const formattedProducts = products.map((p) => ({
    id: p.id,
    sku: p.sku || 'N/A',
    name: p.name,
    category: p.category || 'General',
    description: p.description || '',
    price: `₹${Number(p.basePrice || p.price || 0).toLocaleString('en-IN')}`,
    unit: p.unitOfMeasure || p.unit || 'Each',
    isSubscription: p.isSubscription || false
  }));

  const columns = [
    {
      header: 'Product Name',
      accessor: 'name',
      render: (r) => (
        <div>
          <span className="font-semibold text-slate-800 flex items-center gap-1 group-hover:text-[#a459a8]">
            {r.name} <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
          </span>
          <span className="text-[10px] text-slate-400 font-mono">SKU: {r.sku}</span>
        </div>
      )
    },
    { header: 'Category', accessor: 'category', render: (r) => <Badge variant="default">{r.category}</Badge> },
    {
      header: 'Type',
      accessor: 'isSubscription',
      render: (r) => (
        <Badge variant={r.isSubscription ? 'primary' : 'outline'}>
          {r.isSubscription ? 'Subscription' : 'One-Time'}
        </Badge>
      )
    },
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
              <Badge variant="success">{products.length} active in database</Badge>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Manage SKUs, tiered pricing rules, and subscription billing attributes</p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/products/new')}
        >
          New Product
        </Button>
      </div>

      <Card title="Master Product Directory">
        <Table
          columns={columns}
          data={formattedProducts}
          emptyMessage={loading ? 'Loading catalog from database...' : 'No catalog products configured.'}
          onRowClick={(row) => navigate(`/products/${row.id}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default ProductPage;
