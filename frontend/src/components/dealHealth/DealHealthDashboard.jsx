import React from 'react';
import AlertList from './AlertList';

const DealHealthDashboard = () => {
  // TODO: Fetch deal anomaly scores from dealHealthAPI.getAnomalies
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Deal Health & Anomaly Detector</h3>
        <p className="text-sm text-slate-500 mt-1">
          Automated risk signals detecting margin dilution, approval stagnation, and inventory risks.
        </p>
      </div>
      <AlertList />
    </div>
  );
};

export default DealHealthDashboard;
