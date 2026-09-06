import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building, Mail, Phone, MapPin, Shield, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import customerAPI from '../api/customerAPI';
import { useAuth } from '../contexts/AuthContext';

const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const currentRole = (user?.role || role || '').toLowerCase().trim();
  const isReadOnly = currentRole === 'sales_rep';
  const isNew = !id || id === 'new';

  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    tier: 'BRONZE',
    billingAddress: '',
    shippingAddress: ''
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isNew) {
      const loadCustomer = async () => {
        try {
          setLoading(true);
          const res = await customerAPI.getById(id);
          const c = res?.data || res;
          if (c) {
            setFormData({
              name: c.name || '',
              companyName: c.companyName || '',
              email: c.email || '',
              phone: c.phone || '',
              tier: c.tier || 'BRONZE',
              billingAddress: c.billingAddress || '',
              shippingAddress: c.shippingAddress || ''
            });
          }
        } catch (err) {
          console.warn('Failed to load customer:', err);
          setMessage({ type: 'danger', text: 'Failed to load customer details from PostgreSQL.' });
        } finally {
          setLoading(false);
        }
      };
      loadCustomer();
    }
  }, [id, isNew]);

  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;
    try {
      setSaving(true);
      setMessage(null);

      if (isNew) {
        await customerAPI.create(formData);
        setMessage({ type: 'success', text: 'Customer created successfully in PostgreSQL!' });
      } else {
        await customerAPI.update(id, formData);
        setMessage({ type: 'success', text: 'Customer updated successfully in PostgreSQL!' });
      }

      setTimeout(() => navigate('/customers'), 1200);
    } catch (err) {
      setMessage({ type: 'danger', text: err.message || 'Failed to save customer record.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            icon={ArrowLeft}
            onClick={() => navigate('/customers')}
            size="sm"
          >
            Back to Customers
          </Button>

          <h1 className="text-xl font-extrabold text-slate-900">
            {isNew ? 'New Customer Account' : `Customer: ${formData.name}`}
          </h1>
        </div>

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <Card title="Customer Profile Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Primary Contact Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Ananya Deshmukh"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Legal Entity Name *</label>
                <input
                  type="text"
                  name="companyName"
                  required
                  placeholder="e.g. Tata Consultancy Services Ltd"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Email Address *</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. procurement@tcs.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g. +91 98201 45678"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Pricing Tier</label>
                <select
                  name="tier"
                  value={formData.tier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8] bg-white"
                >
                  <option value="GOLD">GOLD (Strategic Bulk Discount)</option>
                  <option value="SILVER">SILVER (Standard Corporate Tier)</option>
                  <option value="BRONZE">BRONZE (Retail / Base Tier)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Billing Address</label>
                <input
                  type="text"
                  name="billingAddress"
                  placeholder="e.g. TCS House, Fort, Mumbai, MH 400001"
                  value={formData.billingAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Shipping / Delivery Address</label>
                <input
                  type="text"
                  name="shippingAddress"
                  placeholder="e.g. TCS Olympus, Hiranandani Estate, Thane, MH 400607"
                  value={formData.shippingAddress}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8]"
                />
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              {isReadOnly ? (
                <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Read-Only View: Customer profiles are managed directly by customer accounts.</span>
                </div>
              ) : <div />}

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/customers')}
                >
                  Back
                </Button>
                {!isReadOnly && (
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Save}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : isNew ? 'Create Customer' : 'Save Changes'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </form>
      </div>
    </MainLayout>
  );
};

export default CustomerDetailPage;
