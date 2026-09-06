import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layers, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import subscriptionAPI from '../api/subscriptionAPI';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('contracts'); // 'contracts' | 'plans'
  const [subscriptions, setSubscriptions] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subRes, plansRes] = await Promise.allSettled([
        subscriptionAPI.getAll(),
        subscriptionAPI.getPlans()
      ]);

      if (subRes.status === 'fulfilled') {
        const list = Array.isArray(subRes.value?.data)
          ? subRes.value.data
          : Array.isArray(subRes.value)
          ? subRes.value
          : [];
        setSubscriptions(list);
      }

      if (plansRes.status === 'fulfilled') {
        const planList = Array.isArray(plansRes.value?.data)
          ? plansRes.value.data
          : Array.isArray(plansRes.value)
          ? plansRes.value
          : [];
        setPlans(planList);
      }
    } catch (err) {
      console.warn('Failed to load subscriptions or plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeletePlan = async (e, planId, planName) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the plan "${planName}"?`)) return;

    try {
      await subscriptionAPI.deletePlan(planId);
      setActionMessage(`Plan "${planName}" deleted successfully.`);
      fetchData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete plan');
    }
  };

  const activeCount = subscriptions.filter((s) => (s.status || '').toUpperCase() === 'ACTIVE').length;
  const pausedCount = subscriptions.filter((s) => (s.status || '').toUpperCase() === 'PAUSED').length;

  const formattedRows = subscriptions.map((s) => ({
    id: s.id,
    customer: s.customer?.companyName || s.customer?.name || 'Customer Account',
    plan: s.planName || s.plan || 'SaaS Enterprise Tier',
    cycle: s.billingCycle || s.cycle || 'Monthly',
    amount: `₹${Number(s.recurringAmount || s.price || 0).toLocaleString('en-IN')}`,
    nextBill: s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString('en-IN') : 'Auto-scheduled',
    status: s.status || 'Active',
    statusVariant: (s.status || '').toUpperCase() === 'ACTIVE' ? 'success' : (s.status || '').toUpperCase() === 'PAUSED' ? 'warning' : 'default'
  }));

  const columns = [
    { header: 'Customer', accessor: 'customer', render: (r) => <span className="font-semibold text-slate-800">{r.customer}</span> },
    { header: 'Contract Plan', accessor: 'plan' },
    { header: 'Billing Cycle', accessor: 'cycle' },
    { header: 'Recurring MRR/ARR', accessor: 'amount', render: (r) => <span className="font-mono font-bold text-slate-900">{r.amount}</span> },
    { header: 'Next Invoice Date', accessor: 'nextBill', render: (r) => <span className="font-mono text-slate-500">{r.nextBill}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <Badge variant={r.statusVariant} dot>{r.status}</Badge>
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Subscriptions</h1>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="success">{activeCount} Active Contracts</Badge>
                {plans.length > 0 && <Badge variant="primary">{plans.length} Published Plans</Badge>}
                {pausedCount > 0 && <Badge variant="warning">{pausedCount} Paused</Badge>}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1">Recurring contracts, SaaS packages, and automated billing schedules</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/subscriptions/plans/new')}
            >
              New Plan (Admin)
            </Button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold">
            {actionMessage}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'contracts'
                ? 'bg-[#a459a8] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            Active Contracts ({subscriptions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-[#a459a8] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Published SaaS Plans ({plans.length})
          </button>
        </div>

        {/* Tab 1: Contracts */}
        {activeTab === 'contracts' && (
          <Card title="Active Subscription Contracts">
            <Table
              columns={columns}
              data={formattedRows}
              emptyMessage={loading ? 'Loading subscriptions from database...' : 'No active subscription contracts found. Click "+ New Plan (Admin)" to configure plans.'}
              onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
            />
          </Card>
        )}

        {/* Tab 2: Published Plans */}
        {activeTab === 'plans' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((p) => {
                let parsedFeatures = [];
                try {
                  if (Array.isArray(p.features)) {
                    parsedFeatures = p.features;
                  } else if (typeof p.features === 'string') {
                    parsedFeatures = JSON.parse(p.features);
                  }
                } catch {
                  parsedFeatures = [];
                }

                return (
                  <div
                    key={p.id || p.slug}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={p.isActive !== false ? 'success' : 'default'}>
                          {p.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                          {p.billingCycle}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                      {p.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                      )}

                      <div className="mt-4 pb-3 border-b border-slate-100 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">
                          ₹{Number(p.price || 0).toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500">/{p.billingCycle?.toLowerCase()}</span>
                      </div>

                      <div className="mt-3 text-xs text-slate-600 space-y-1">
                        <div>
                          <span className="font-semibold text-slate-700">Max Quotes:</span>{' '}
                          {p.maxQuotes || 'Unlimited'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700">Included Users:</span>{' '}
                          {p.maxUsers || 5} seats
                        </div>
                        {p.trialDays > 0 && (
                          <div>
                            <span className="font-semibold text-slate-700">Free Trial:</span>{' '}
                            {p.trialDays} days
                          </div>
                        )}
                      </div>

                      {parsedFeatures.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                            Included Features
                          </span>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {parsedFeatures.slice(0, 4).map((f, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                <span className="truncate">{f}</span>
                              </li>
                            ))}
                            {parsedFeatures.length > 4 && (
                              <li className="text-[11px] text-slate-400 italic">
                                +{parsedFeatures.length - 4} more features
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-slate-400">{p.slug}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeletePlan(e, p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {plans.length === 0 && !loading && (
              <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl">
                <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-700">No Published Plans Found</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Create and publish your first recurring SaaS packaging plan.
                </p>
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => navigate('/subscriptions/plans/new')}
                >
                  Create First Plan
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SubscriptionPage;
