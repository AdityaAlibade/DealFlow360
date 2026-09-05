// TODO: Admin reports page with filters and charts
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import AdminReports from '../components/reports/AdminReports';
import ReportFilters from '../components/reports/ReportFilters';
import ReportChart from '../components/reports/ReportChart';

const ReportsPage = () => {
  // TODO: Fetch reports data
  return (
    <MainLayout>
      {/* TODO: Build reports UI */}
      <AdminReports />
      <ReportFilters />
      <ReportChart />
    </MainLayout>
  );
};

export default ReportsPage;
