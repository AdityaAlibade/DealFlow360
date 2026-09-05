import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import SalesDashboard from '../components/dashboard/SalesDashboard';

const DashboardPage = () => {
  // TODO: Load dashboard view in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
        <SalesDashboard />
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
