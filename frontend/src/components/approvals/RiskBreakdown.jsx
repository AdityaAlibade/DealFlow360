import React from 'react';
import Card from '../common/Card';

const RiskBreakdown = () => {
  // TODO: Calculate discount vs standard rate margin violation metrics
  return (
    <Card title="Risk Breakdown & Governance">
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h5 className="text-sm font-semibold text-amber-800">High Discount Flag</h5>
          <p className="text-xs text-amber-700 mt-1">
            Discount requested (35%) exceeds standard sales rep threshold (20%).
          </p>
        </div>
      </div>
    </Card>
  );
};

export default RiskBreakdown;
