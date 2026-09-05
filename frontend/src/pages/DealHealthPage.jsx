import React from 'react';
import MainLayout from '../components/layout/MainLayout';
import DealHealthDashboard from '../components/dealHealth/DealHealthDashboard';

const DealHealthPage = () => {
  // TODO: Render deal health anomaly detection in MainLayout
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Deal Health & Anomaly Detector</h1>
        <DealHealthDashboard />
      </div>
    </MainLayout>
  );
};

export default DealHealthPage;
