import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Laptop Pro 14',
      qty: 2,
      price: 1200,
      discount: 12,
      limit: 15,
      status: 'OK',
      statusType: 'success'
    },
    {
      id: 2,
      name: 'Onsite Setup Service',
      qty: 1,
      price: 450,
      discount: 18,
      limit: 10,
      status: 'OVER (+8pt)',
      statusType: 'danger'
    },
    {
      id: 3,
      name: 'Extended Warranty (2 Years)',
      qty: 1,
      price: 180,
      discount: 10,
      limit: 15,
      status: 'OK',
      statusType: 'success'
    }
  ]);

  const upsellItems = [
    {
      id: 'up-1',
      name: 'Docking Station USB-C Dual 4K',
      price: 180,
      margin: 42,
      badge: 'PROMO'
    },
    {
      id: 'up-2',
      name: 'Premium Cloud Backup 1TB',
      price: 60,
      margin: 85,
      badge: 'POPULAR'
    },
    {
      id: 'up-3',
      name: 'Annual Care Plan Gold SLA',
      price: 250,
      margin: 60,
      badge: 'HIGH MARGIN'
    }
  ];

  const handleAddUpsell = (item) => {
    const newItem = {
      id: Date.now(),
      name: item.name,
      qty: 1,
      price: item.price,
      discount: 5,
      limit: 15,
      status: 'OK',
      statusType: 'success'
    };
    setProducts([...products, newItem]);
  };

  const handleRemoveProduct = (prodId) => {
    setProducts(products.filter((p) => p.id !== prodId));
  };

  // Calculations
  const subtotal = products.reduce((acc, p) => acc + p.qty * p.price, 0);
  const totalDiscount = products.reduce((acc, p) => acc + (p.qty * p.price * p.discount) / 100, 0);
  const tax = (subtotal - totalDiscount) * 0.18;
  const total = subtotal - totalDiscount + tax;
  const hasRisk = products.some((p) => p.discount > p.limit);

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                Quotation Detail: <span className="text-[#a459a8]">{id || 'Q-1042'}</span>
              </h1>
              <Badge variant="warning" dot>Draft</Badge>
            </div>
            <p className="text-xs text-slate-500">Customer: Acme Corp &bull; Created by John Doe</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={ExternalLink}
            onClick={() => navigate('/customer-portal/demo-token-q1042')}
          >
            Preview Portal
          </Button>
          <Button variant="secondary" size="sm" icon={Save}>
            Save Draft
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Send}
            onClick={() => navigate('/approvals/Q-1042')}
          >
            Submit for Approval
          </Button>
        </div>
      </div>

      {/* Customer Info Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Customer</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-800">Acme Corp</span>
              <Badge variant="gold">Gold Tier</Badge>
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Contact Person</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">R. Sharma (Procurement Head)</p>
            <p className="text-slate-500 text-[11px]">rsharma@acmecorp.com</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Phone & Location</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">+91 98200 12345</p>
            <p className="text-slate-500 text-[11px]">Mumbai, MH (HQ)</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Assigned Sales Rep</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">John Doe</p>
            <p className="text-slate-500 text-[11px]">Sales Rep (West Region)</p>
          </div>
        </div>
      </Card>

      {/* Main Grid: Products Table + Upsell Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Products Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Quotation Line Items"
            subtitle="Configure quantity, base price and discount margins"
            action={
              <Button size="sm" variant="outline" icon={Plus}>
                Add Custom Line
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-left">Product</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Price</th>
                    <th className="px-3 py-2.5 text-center">Discount %</th>
                    <th className="px-3 py-2.5 text-center">Limit</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => {
                    const isOver = p.discount > p.limit;
                    return (
                      <tr key={p.id} className={isOver ? 'bg-red-50/40' : 'hover:bg-slate-50/50'}>
                        <td className="px-3 py-3 font-semibold text-slate-800">
                          {p.name}
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-medium">{p.qty}</td>
                        <td className="px-3 py-3 text-right font-mono font-medium">₹{p.price}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`font-mono font-bold ${isOver ? 'text-red-600' : 'text-slate-700'}`}>
                            {p.discount}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-500 font-mono">{p.limit}%</td>
                        <td className="px-3 py-3 text-center">
                          {isOver ? (
                            <Badge variant="danger" className="text-[10px]">
                              ⚠️ OVER (+{p.discount - p.limit}pt)
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px]">
                              ✅ OK
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => handleRemoveProduct(p.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {hasRisk && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-bold">Approval Requirement Triggered:</span> Onsite Setup Service exceeds the standard 10% representative discount limit. Requires Sales Manager sign-off.
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Column: Upsell Panel */}
        <div className="space-y-6">
          <Card
            title="Recommended Add-ons"
            subtitle="AI upsell intelligence for deal margin expansion"
          >
            <div className="space-y-3">
              {upsellItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 hover:bg-purple-50/40 border border-slate-200 rounded-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="primary" className="text-[9px] py-0">{item.badge}</Badge>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">{item.name}</h4>
                    </div>
                    <span className="text-xs font-bold text-slate-900">₹{item.price}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                    <span className="text-emerald-600 font-semibold">+{item.margin}% margin uplift</span>
                    <Button
                      size="sm"
                      variant="primary"
                      icon={Plus}
                      onClick={() => handleAddUpsell(item)}
                      className="py-1 px-2 text-[11px]"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Summary Footer Card */}
      <Card title="Quotation Financial Summary">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Financial Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Gross Subtotal:</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600 font-medium">
              <span>Total Discount Applied:</span>
              <span>-₹{totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">GST (18%):</span>
              <span className="font-semibold text-slate-800">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-extrabold text-slate-900">
              <span>Net Payable Total:</span>
              <span className="text-base text-[#a459a8]">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Center: Margin Analysis */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Calculated Deal Margin:</span>
              <span className="font-bold text-emerald-600 text-sm">34.2%</span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '68%' }} />
            </div>
            <p className="text-[11px] text-slate-500">Target threshold is 25%. This quote is within healthy gross margin parameters.</p>
          </div>

          {/* Right: Risk & Status */}
          <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a459a8]">Approval Governance</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">Status: Pending Manager Sign-off</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Line 2 exceeds rep limit. Multi-tier approval route assigned.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => navigate('/approvals/Q-1042')}
              className="mt-3 w-full"
            >
              Proceed to Approval Review
            </Button>
          </div>
        </div>
      </Card>
    </MainLayout>
  );
};

export default QuotationDetailPage;
