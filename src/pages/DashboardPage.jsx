// TODO: Dashboard page with metrics, recent activity, quick actions
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import SalesDashboard from '../components/dashboard/SalesDashboard';
import RecentActivity from '../components/dashboard/RecentActivity';

const DashboardPage = () => {
  // TODO: Fetch dashboard data
  return (
    <MainLayout>
      {/* TODO: Build dashboard UI */}
      <SalesDashboard />
      <RecentActivity />
    </MainLayout>
  );
};

export default DashboardPage;
