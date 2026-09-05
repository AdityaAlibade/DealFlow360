import React from 'react';
import ReportFilters from './ReportFilters';
import ReportChart from './ReportChart';

const AdminReports = () => {
  // TODO: Fetch analytics data from reportsAPI.getSalesReport
  return (
    <div className="space-y-6">
      <ReportFilters />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReportChart title="Discount vs Margin Realization" />
        <ReportChart title="Quote Conversion Velocity" />
      </div>
    </div>
  );
};

export default AdminReports;
