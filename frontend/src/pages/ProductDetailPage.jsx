import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isSubscription, setIsSubscription] = useState(false);

  const discountTiers = [
    { tier: 'Tier 1 (Retail)', minQty: 1, maxQty: 9, maxDiscount: '10%' },
    { tier: 'Tier 2 (Mid-Market)', minQty: 10, maxQty: 49, maxDiscount: '15%' },
    { tier: 'Tier 3 (Enterprise)', minQty: 50, maxQty: 500, maxDiscount: '22%' }
  ];

  const variants = [
    { name: '16GB RAM / 512GB SSD', sku: 'LP-14-16G', priceDelta: '+₹0' },
    { name: '32GB RAM / 1TB SSD', sku: 'LP-14-32G', priceDelta: '+₹250' }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/products')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">
              Product Configuration: <span className="text-[#a459a8]">Laptop Pro 14</span>
            </h1>
            <p className="text-xs text-slate-500">SKU Ref: {id || 'PRD-101'} &bull; Category: Hardware</p>
          </div>
        </div>

        <Button variant="primary" size="sm" icon={Save}>
          Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Product Info & Pricing */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Product Info */}
          <Card title="Product Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Product Name" defaultValue="Laptop Pro 14" required />
              <Input label="SKU Code" defaultValue="LP-14-PRO" required />
              <Select
                label="Category"
                options={['Hardware', 'Services', 'Subscription', 'Accessories']}
                defaultValue="Hardware"
                required
              />
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Description</label>
                <textarea
                  rows={3}
                  defaultValue="Enterprise-grade 14-inch performance laptop with long battery life and biometric security."
                  className="w-full mt-1 p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30"
                />
              </div>
            </div>
          </Card>

          {/* Section 2: Pricing & Subscription */}
          <Card title="Pricing & Billing Model">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Base Price (₹)" type="number" defaultValue="1000" required />
              <Input label="Tax Rate (%)" type="number" defaultValue="18" required />
              <Select label="Unit of Measure" options={['Each', 'User / Month', 'Hour', 'Flat Rate']} defaultValue="Each" />
            </div>

            {/* Subscription Toggle */}
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800">Recurring Subscription Product</span>
                <p className="text-[11px] text-slate-500">Enable automatic recurring schedule for SaaS plans or multi-year contracts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSubscription}
                  onChange={(e) => setIsSubscription(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a459a8]"></div>
              </label>
            </div>
          </Card>

          {/* Section 3: Discount Tiers */}
          <Card
            title="Tiered Volume Discount Rules"
            subtitle="Configure allowed discount ranges per quantity bracket"
            action={<Button size="sm" variant="outline" icon={Plus}>Add Tier</Button>}
          >
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <th className="px-3 py-2 text-left">Tier Name</th>
                  <th className="px-3 py-2 text-center">Min Qty</th>
                  <th className="px-3 py-2 text-center">Max Qty</th>
                  <th className="px-3 py-2 text-right">Max Allowed Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discountTiers.map((t, idx) => (
                  <tr key={idx}>
                    <td className="px-3 py-2.5 font-medium text-slate-800">{t.tier}</td>
                    <td className="px-3 py-2.5 text-center font-mono">{t.minQty}</td>
                    <td className="px-3 py-2.5 text-center font-mono">{t.maxQty}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-[#a459a8]">{t.maxDiscount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Right 1 Col: Attributes & Variants */}
        <div className="space-y-6">
          <Card
            title="Product Variants"
            subtitle="Configure SKU options and price increments"
            action={<Button size="sm" variant="outline" icon={Plus}>Add Variant</Button>}
          >
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800">{v.name}</span>
                    <span className="font-mono font-semibold text-emerald-600">{v.priceDelta}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">SKU: {v.sku}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductDetailPage;
