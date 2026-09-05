import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import productAPI from '../api/productAPI';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Hardware',
    description: '',
    price: '',
    unit: 'Each',
    isSubscription: false,
    taxRate: '18'
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isNew) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          const res = await productAPI.getById(id);
          const p = res?.data || res;
          if (p) {
            setFormData({
              name: p.name || '',
              sku: p.sku || '',
              category: p.category || 'Hardware',
              description: p.description || '',
              price: String(p.basePrice || p.price || 0),
              unit: p.unitOfMeasure || p.unit || 'Each',
              isSubscription: Boolean(p.isSubscription),
              taxRate: '18'
            });
          }
        } catch (err) {
          console.warn('Failed to load product detail:', err);
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      const payload = {
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        basePrice: parseFloat(formData.price) || 0,
        unitOfMeasure: formData.unit,
        isSubscription: formData.isSubscription
      };

      if (isNew) {
        await productAPI.create(payload);
        setMessage({ type: 'success', text: 'Product created successfully in database!' });
      } else {
        await productAPI.update(id, payload);
        setMessage({ type: 'success', text: 'Product updated successfully in database!' });
      }
      setTimeout(() => navigate('/products'), 1200);
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to save product configuration' });
    } finally {
      setSaving(false);
    }
  };

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
              {isNew ? 'New Catalog Product' : `Product Configuration: ${formData.name || id}`}
            </h1>
            <p className="text-xs text-slate-500">
              {isNew ? 'Define a new SKU and pricing terms' : `SKU Ref: ${formData.sku || id} • Category: ${formData.category}`}
            </p>
          </div>
        </div>

        <Button variant="primary" size="sm" icon={Save} onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>

      {message && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading product configuration from database...</div>
      ) : (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Product Info & Pricing */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Product Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Product Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Enterprise Server Blade"
                  required
                />
                <Input
                  label="SKU Code"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  placeholder="e.g. SRV-BLADE-01"
                  required
                />
                <Select
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  options={['Hardware', 'Services', 'Software & Cloud', 'Warranty & SLA', 'Accessories']}
                  required
                />
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide technical specifications and commercial description..."
                    className="w-full mt-1 p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30"
                  />
                </div>
              </div>
            </Card>

            <Card title="Pricing & Billing Model">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Base Price (₹)"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0"
                  required
                />
                <Input
                  label="Tax Rate (%)"
                  type="number"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                />
                <Select
                  label="Unit of Measure"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  options={['Each', 'User / Month', 'Hour', 'Flat Rate']}
                />
              </div>

              {/* Subscription Toggle */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-800">Recurring Subscription Product</span>
                  <p className="text-[11px] text-slate-500">Enable recurring schedule for SaaS plans or multi-year contracts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isSubscription"
                    checked={formData.isSubscription}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a459a8]"></div>
                </label>
              </div>
            </Card>
          </div>

          {/* Right 1 Col: Summary info */}
          <div className="space-y-6">
            <Card title="Catalog Governance">
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Database Status</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{isNew ? 'Unsaved New Record' : 'Active PostgreSQL SKU'}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-bold uppercase text-[10px] block">Standard Authority Limit</span>
                  <p className="font-semibold text-slate-800 mt-0.5">15% Max Concession Floor</p>
                </div>
              </div>
            </Card>
          </div>
        </form>
      )}
    </MainLayout>
  );
};

export default ProductDetailPage;
