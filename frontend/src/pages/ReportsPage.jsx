import React, { useState } from 'react';
import { BarChart3, Download, Filter, Calendar } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Table from '../components/common/Table';

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState('Month');

  const reportData = [
    { rep: 'John Doe', quotes: 14, revenue: '₹8,45,000', avgDiscount: '11.4%', margin: '34.8%' },
    { rep: 'Sarah Lee', quotes: 12, revenue: '₹6,90,000', avgDiscount: '9.2%', margin: '38.1%' },
    { rep: 'R. Iyer', quotes: 9, revenue: '₹5,10,000', avgDiscount: '14.5%', margin: '29.4%' },
    { rep: 'J. Rao', quotes: 18, revenue: '₹12,20,000', avgDiscount: '12.0%', margin: '32.6%' }
  ];

  const columns = [
    { header: 'Sales Representative', accessor: 'rep', render: (r) => <span className="font-semibold text-slate-800">{r.rep}</span> },
    { header: 'Quotes Closed', accessor: 'quotes', render: (r) => <span className="font-mono">{r.quotes}</span> },
    { header: 'Total Revenue', accessor: 'revenue', render: (r) => <span className="font-mono font-bold text-slate-900">{r.revenue}</span> },
    { header: 'Avg Conceded Discount', accessor: 'avgDiscount', render: (r) => <span className="font-mono">{r.avgDiscount}</span> },
    {
      header: 'Realized Gross Margin',
      accessor: 'margin',
      render: (r) => (
        <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
          {r.margin}
        </span>
      )
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">Cross-sectional revenue intelligence, margin realization, and rep performance</p>
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" size="sm" icon={Download}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" icon={Download}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
        <Select
          label="Date Range"
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          options={['Today', 'This Week', 'This Month', 'Custom Range']}
        />
        <Select
          label="Sales Team"
          options={['All Teams', 'West Region', 'North Region', 'South Hub']}
        />
        <Select
          label="Approval Status"
          options={['All Statuses', 'Approved Only', 'Pending Review', 'Auto-Approved']}
        />
        <Select
          label="Product Category"
          options={['All Categories', 'Hardware', 'Services', 'Subscription Plans']}
        />
      </div>

      {/* Charts Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Velocity */}
        <Card title="Revenue Growth & Trajectory" className="lg:col-span-2">
          <div className="h-60 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <BarChart3 className="w-8 h-8 text-[#a459a8] mb-2" />
            <p className="text-xs font-semibold text-slate-700">Revenue Trend (Q3 vs Q2 Velocity)</p>
            <p className="text-[11px] text-slate-400 mt-1">Visualizing ₹28.5L in closed pipeline with 18.4% monthly expansion</p>
          </div>
        </Card>

        {/* Chart 2: Approval Status Distribution */}
        <Card title="Discount vs Margin Realization">
          <div className="h-60 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mb-2">
              34%
            </div>
            <p className="text-xs font-semibold text-slate-700">Healthy Margin Realization</p>
            <p className="text-[11px] text-slate-400 mt-1">Average discount: 11.8% against target 25% floor margin</p>
          </div>
        </Card>
      </div>

      {/* Report Table */}
      <Card title="Sales Representative Performance Breakdown">
        <Table columns={columns} data={reportData} />
      </Card>
    </MainLayout>
  );
};

export default ReportsPage;
