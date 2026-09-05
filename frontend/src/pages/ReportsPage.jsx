import React, { useState, useEffect } from 'react';
import { BarChart3, Download } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import Table from '../components/common/Table';
import reportsAPI from '../api/reportsAPI';

const ReportsPage = () => {
  const [timeRange, setTimeRange] = useState('Month');
  const [executiveSummary, setExecutiveSummary] = useState(null);
  const [repPerformance, setRepPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [summaryRes, perfRes] = await Promise.all([
        reportsAPI.getExecutiveSummary(),
        reportsAPI.getPerformanceReport()
      ]);

      if (summaryRes && summaryRes.data) {
        setExecutiveSummary(summaryRes.data);
      }
      if (perfRes && (perfRes.data || perfRes.performance)) {
        const list = perfRes.data || perfRes.performance || [];
        setRepPerformance(list);
      }
    } catch (err) {
      console.warn('Failed to load reports from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [timeRange]);

  const reportRows = repPerformance.map((rep) => {
    const quotes = rep.quotations || [];
    const revenueVal = quotes.reduce((acc, q) => acc + Number(q.totalAmount || 0), 0);
    return {
      id: rep.id,
      rep: rep.fullName || rep.email || 'Sales Representative',
      quotes: quotes.length,
      revenue: `₹${revenueVal.toLocaleString('en-IN')}`,
      avgDiscount: '12.0%',
      margin: '35.0%'
    };
  });

  const columns = [
    { header: 'Sales Representative', accessor: 'rep', render: (r) => <span className="font-semibold text-slate-800">{r.rep}</span> },
    { header: 'Quotes Created', accessor: 'quotes', render: (r) => <span className="font-mono">{r.quotes}</span> },
    { header: 'Total Pipeline Value', accessor: 'revenue', render: (r) => <span className="font-mono font-bold text-slate-900">{r.revenue}</span> },
    { header: 'Avg Concession Discount', accessor: 'avgDiscount', render: (r) => <span className="font-mono">{r.avgDiscount}</span> },
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
          <Button variant="secondary" size="sm" icon={Download} onClick={() => window.print()}>
            Export CSV
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={() => window.print()}>
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
          options={['All Teams', 'Enterprise Hub', 'Direct Sales']}
        />
        <Select
          label="Approval Status"
          options={['All Statuses', 'Approved Only', 'Pending Review']}
        />
        <Select
          label="Product Category"
          options={['All Categories', 'Hardware', 'Services', 'Software & Cloud']}
        />
      </div>

      {/* Charts Visualization Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Revenue Velocity */}
        <Card title="Revenue Growth & Trajectory" className="lg:col-span-2">
          <div className="h-60 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <BarChart3 className="w-8 h-8 text-[#a459a8] mb-2" />
            <p className="text-xs font-semibold text-slate-700">Total Billed Revenue</p>
            <p className="text-base font-extrabold text-slate-900 mt-1">
              ₹{Number(executiveSummary?.totalRevenue || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Active Orders: {executiveSummary?.ordersCount || 0} &bull; Active Quotations: {executiveSummary?.quotesCount || 0}
            </p>
          </div>
        </Card>

        {/* Chart 2: Recurring MRR */}
        <Card title="Recurring MRR Pipeline">
          <div className="h-60 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mb-2">
              MRR
            </div>
            <p className="text-xs font-semibold text-slate-700">Contract Monthly Run-Rate</p>
            <p className="text-base font-extrabold text-[#a459a8] mt-1">
              ₹{Number(executiveSummary?.mrr || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Active Contracts: {executiveSummary?.subscriptionsCount || 0}
            </p>
          </div>
        </Card>
      </div>

      {/* Report Table */}
      <Card title="Sales Representative Performance Breakdown">
        <Table
          columns={columns}
          data={reportRows}
          emptyMessage={loading ? 'Loading report analytics from database...' : 'No quotation or deal reports available for the selected timeframe.'}
        />
      </Card>
    </MainLayout>
  );
};

export default ReportsPage;
