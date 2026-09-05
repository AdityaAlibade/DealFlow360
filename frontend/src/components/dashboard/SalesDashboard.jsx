import React from 'react';
import MetricCard from './MetricCard';
import RecentActivity from './RecentActivity';

const SalesDashboard = () => {
  // TODO: Fetch dashboard data from dashboardAPI.getMetrics
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Total Pipeline" value="$1,245,800" change="+14.2%" />
        <MetricCard title="Active Quotations" value="38" change="+5" />
        <MetricCard title="Pending Approvals" value="6" change="-2" isUrgent />
        <MetricCard title="Avg Deal Margin" value="32.4%" change="+1.8%" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* TODO: Integrate Sales trend chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200">
            <h3 className="text-base font-semibold text-slate-800 mb-4">Pipeline Velocity</h3>
            <div className="h-64 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-lg text-slate-400">
              Pipeline Trend Chart Placeholder
            </div>
          </div>
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
