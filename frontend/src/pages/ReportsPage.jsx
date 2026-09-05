import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import AdminReports from '../components/reports/AdminReports';

const ReportsPage = () => {
  // TODO: Render sales & margin intelligence reports in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Executive & Admin Reports</h1>
        <AdminReports />
      </div>
    </MainLayout>
  );
};

export default ReportsPage;
