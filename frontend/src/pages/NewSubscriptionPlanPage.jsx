import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Repeat,
  DollarSign,
  Shield,
  Layers,
  Sparkles,
  Calendar
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import subscriptionAPI from '../api/subscriptionAPI';

const NewSubscriptionPlanPage = () => {
  const navigate = useNavigate();

  // Plan Form State matching Prisma Subscription schema & enterprise CPQ plans
  const [formData, setFormData] = useState({
    planName: '',
    planCode: '',
    description: '',
    billingCycle: 'MONTHLY',
    currency: 'INR',
    price: '',
    setupFee: '0',
    trialDays: '14',
    status: 'ACTIVE',
    autoRenew: true,
    userLimit: '10',
    storageLimitGB: '100'
  });

  // Features list
  const [features, setFeatures] = useState([
    'Automated Quote-to-Cash Workflow',
    'Real-time Margin & Compliance Sentinel',
    'Tier-based Discount Matrix'
  ]);
  const [newFeatureText, setNewFeatureText] = useState('');

  // UX & Submission State
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate plan code if editing plan name
    if (name === 'planName') {
      const code = value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '-')
        .slice(0, 16);
      setFormData((prev) => ({
        ...prev,
        planName: value,
        planCode: prev.planCode || (code ? `PLAN-${code}` : '')
      }));
    }
  };

  const handleAddFeature = () => {
    if (newFeatureText.trim()) {
      setFeatures([...features, newFeatureText.trim()]);
      setNewFeatureText('');
    }
  };

  const handleRemoveFeature = (idx) => {
    setFeatures(features.filter((_, i) => i !== idx));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.planName.trim()) {
      newErrors.planName = 'Plan name is required.';
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid recurring price greater than 0.';
    }
    if (!formData.billingCycle) {
      newErrors.billingCycle = 'Select a valid billing interval.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        setupFee: parseFloat(formData.setupFee) || 0,
        trialDays: parseInt(formData.trialDays, 10) || 0,
        features
      };

      // Call API directly to persist in database
      if (subscriptionAPI && typeof subscriptionAPI.createPlan === 'function') {
        await subscriptionAPI.createPlan(payload);
      } else if (subscriptionAPI && typeof subscriptionAPI.create === 'function') {
        await subscriptionAPI.create(payload);
      }

      setSubmitSuccess(`Subscription Plan "${formData.planName}" published successfully!`);
      setTimeout(() => {
        navigate('/subscriptions');
      }, 1500);
    } catch (err) {
      setSubmitError(err.response?.data?.message || err.message || 'Failed to create subscription plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/subscriptions')}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              title="Back to Subscriptions"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Subscription Plan</h1>
                <Badge variant="primary">Admin Portal</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure SaaS packaging, billing intervals, recurring revenue schedules, and license quotas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/subscriptions')}
              disabled={isSubmitting}
            >
              Back to Plans
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Plan...' : 'Save & Publish Plan'}
            </Button>
          </div>
        </div>

        {/* Success / Error Alerts */}
        {submitSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {submitError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Main Configuration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Plan Details */}
            <div className="lg:col-span-2 space-y-6">
              <Card title="Plan Definition & Commercials" subtitle="Core contract and pricing attributes">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Plan Name */}
                    <div>
                      <Input
                        label="Plan Name"
                        required
                        name="planName"
                        value={formData.planName}
                        onChange={handleInputChange}
                        placeholder="e.g. Enterprise Cloud Care Plan"
                        error={errors.planName}
                      />
                    </div>

                    {/* Plan Code / SKU */}
                    <div>
                      <Input
                        label="Plan Code / SKU"
                        name="planCode"
                        value={formData.planCode}
                        onChange={handleInputChange}
                        placeholder="e.g. PLAN-ENT-CARE"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      Plan Description
                    </label>
                    <textarea
                      name="description"
                      rows={2}
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Brief overview of features and target customer segment..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30 focus:border-[#a459a8] transition-all text-slate-800"
                    />
                  </div>

                  {/* Pricing and Billing Interval Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
                    <div>
                      <Select
                        label="Billing Interval"
                        required
                        name="billingCycle"
                        value={formData.billingCycle}
                        onChange={handleInputChange}
                        options={[
                          { value: 'MONTHLY', label: 'Monthly' },
                          { value: 'QUARTERLY', label: 'Quarterly' },
                          { value: 'ANNUAL', label: 'Annual (Yearly)' }
                        ]}
                      />
                    </div>

                    <div>
                      <Input
                        label="Recurring Price"
                        required
                        type="number"
                        min="0"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="e.g. 1500"
                        error={errors.price}
                        icon={DollarSign}
                      />
                    </div>

                    <div>
                      <Select
                        label="Currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleInputChange}
                        options={[
                          { value: 'INR', label: 'INR (₹)' },
                          { value: 'USD', label: 'USD ($)' },
                          { value: 'EUR', label: 'EUR (€)' }
                        ]}
                      />
                    </div>
                  </div>

                  {/* Setup Fee & Free Trial */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="One-Time Onboarding Fee"
                        type="number"
                        min="0"
                        name="setupFee"
                        value={formData.setupFee}
                        onChange={handleInputChange}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <Input
                        label="Free Trial Period (Days)"
                        type="number"
                        min="0"
                        name="trialDays"
                        value={formData.trialDays}
                        onChange={handleInputChange}
                        placeholder="14"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Feature Matrix Card */}
              <Card title="Plan Features & Inclusions" subtitle="Capabilities delivered under this recurring tier">
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      placeholder="Add a plan feature (e.g. 24/7 Dedicated Support)..."
                      className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#a459a8]"
                    />
                    <Button type="button" variant="primary" size="sm" icon={Plus} onClick={handleAddFeature}>
                      Add
                    </Button>
                  </div>

                  <ul className="space-y-2 pt-2">
                    {features.map((feat, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg text-xs"
                      >
                        <span className="flex items-center gap-2 font-medium text-slate-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {feat}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(idx)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          title="Remove feature"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>

            {/* Right Column: Governance, Status & Preview */}
            <div className="space-y-6">
              {/* Status & Renewal Settings */}
              <Card title="Lifecycle & Quotas" subtitle="Access constraints and renewal behavior">
                <div className="space-y-4 text-xs">
                  <div>
                    <Select
                      label="Plan Publishing Status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      options={[
                        { value: 'ACTIVE', label: 'Active (Available for quoting)' },
                        { value: 'DRAFT', label: 'Draft (Internal only)' },
                        { value: 'ARCHIVED', label: 'Archived / Deprecated' }
                      ]}
                    />
                  </div>

                  <div>
                    <Input
                      label="Included User Seats"
                      type="number"
                      name="userLimit"
                      value={formData.userLimit}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <Input
                      label="Cloud Storage Quota (GB)"
                      type="number"
                      name="storageLimitGB"
                      value={formData.storageLimitGB}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800 block">Auto-Renew Contract</span>
                      <span className="text-[11px] text-slate-500">Automatically renew contract on expiry</span>
                    </div>
                    <input
                      type="checkbox"
                      name="autoRenew"
                      checked={formData.autoRenew}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-[#a459a8] rounded border-slate-300 focus:ring-[#a459a8]"
                    />
                  </div>
                </div>
              </Card>

              {/* Plan Preview Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#ddbade]">Plan Card Preview</span>
                  <Badge variant="primary">{formData.billingCycle}</Badge>
                </div>

                <div>
                  <h3 className="text-lg font-black text-white">
                    {formData.planName || 'Enterprise Plan Preview'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                    {formData.description || 'Deliver enterprise SLA reliability and CPQ integration.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">
                      {formData.currency === 'INR' ? '₹' : '$'}
                      {formData.price ? Number(formData.price).toLocaleString() : '0'}
                    </span>
                    <span className="text-xs text-slate-400">
                      / {formData.billingCycle.toLowerCase()}
                    </span>
                  </div>
                  {formData.trialDays > 0 && (
                    <span className="text-[11px] text-emerald-400 block mt-1">
                      Includes {formData.trialDays}-day trial period
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-700/80">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#c892cb]" />
                    <span>{features.length} plan features included</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-[#c892cb]" />
                    <span>Up to {formData.userLimit} user seats</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={isSubmitting}
                  className="w-full shadow-lg shadow-[#a459a8]/30"
                >
                  {isSubmitting ? 'Creating...' : 'Publish Plan'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default NewSubscriptionPlanPage;
