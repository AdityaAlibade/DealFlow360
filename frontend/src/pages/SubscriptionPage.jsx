import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Table from '../components/common/Table';

const SubscriptionPage = () => {
  const navigate = useNavigate();

  const subscriptions = [
    {
      id: 'SUB-101',
      customer: 'Acme Corp',
      plan: 'Care Plan 2yr',
      cycle: 'Monthly',
      nextBill: 'Sep 15, 2026',
      amount: '₹1,200/mo',
      status: 'Active',
      statusVariant: 'success'
    },
    {
      id: 'SUB-102',
      customer: 'Beta Industries',
      plan: 'Support SLA Platinum',
      cycle: 'Quarterly',
      nextBill: 'Nov 01, 2026',
      amount: '₹8,500/qtr',
      status: 'Active',
      statusVariant: 'success'
    },
    {
      id: 'SUB-103',
      customer: 'Delta LLC',
      plan: 'Care Plan 1yr',
      cycle: 'Monthly',
      nextBill: '-',
      amount: '₹600/mo',
      status: 'Paused',
      statusVariant: 'warning'
    },
    {
      id: 'SUB-104',
      customer: 'Nova Retail',
      plan: 'Cloud License Pro',
      cycle: 'Annual',
      nextBill: 'Dec 31, 2026',
      amount: '₹24,000/yr',
      status: 'Active',
      statusVariant: 'success'
    }
  ];

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
              <Badge variant="success">18 Active</Badge>
              <Badge variant="warning">2 Paused</Badge>
              <Badge variant="danger">3 Cancelled</Badge>
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
          data={subscriptions}
          onRowClick={(row) => navigate(`/subscriptions/${row.id}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default SubscriptionPage;
