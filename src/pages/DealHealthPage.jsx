// TODO: Deal health dashboard with alerts and anomalies
import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import DealHealthDashboard from '../components/dealHealth/DealHealthDashboard';
import AlertList from '../components/dealHealth/AlertList';

const DealHealthPage = () => {
  // TODO: Fetch alerts data
  return (
    <MainLayout>
      {/* TODO: Build deal health dashboard UI */}
      <DealHealthDashboard />
      <AlertList />
    </MainLayout>
  );
};

export default DealHealthPage;
