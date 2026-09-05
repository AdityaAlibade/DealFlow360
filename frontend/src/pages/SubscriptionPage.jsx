import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
import subscriptionAPI from '../api/subscriptionAPI';

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await subscriptionAPI.getAll();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setSubscriptions(list);
    } catch (err) {
      console.warn('Failed to load subscriptions from API:', err);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

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
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Subscriptions</h1>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="success">{activeCount} Active</Badge>
              {pausedCount > 0 && <Badge variant="warning">{pausedCount} Paused</Badge>}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Recurring contracts, SaaS licenses, and automated billing schedules</p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/subscriptions/plans/new')}
        >
          New Plan (Admin)
        </Button>
      </div>

      <Card title="Active Subscription Contracts">
        <Table
          columns={columns}
          data={formattedRows}
          emptyMessage={loading ? 'Loading subscriptions from database...' : 'No active subscription contracts found. Click "+ New Plan (Admin)" to configure plans.'}
          onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default SubscriptionPage;
