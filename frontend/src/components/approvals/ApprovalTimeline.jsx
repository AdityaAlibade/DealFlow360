import React from 'react';
import Card from '../common/Card';

const ApprovalTimeline = () => {
  // TODO: Render tiered multi-stage approval history
  return (
    <Card title="Approval Hierarchy">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">✓</span>
          <div className="text-sm">
            <p className="font-medium text-slate-800">Sales Manager</p>
            <span className="text-xs text-slate-400">Approved</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">●</span>
          <div className="text-sm">
            <p className="font-medium text-slate-800">VP Finance</p>
            <span className="text-xs text-slate-400">Awaiting review</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ApprovalTimeline;
