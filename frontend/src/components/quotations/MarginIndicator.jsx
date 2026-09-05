import React from 'react';
import Card from '../common/Card';

const MarginIndicator = ({ margin = 30 }) => {
  // TODO: Compute threshold alerts if margin drops below corporate guidelines
  return (
    <Card title="Deal Margin Analysis">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Calculated Margin:</span>
          <span className="text-lg font-bold text-emerald-600">{margin}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2.5">
          <div
            className="bg-emerald-500 h-2.5 rounded-full"
            style={{ width: margin + '%' }}
          />
        </div>
        <p className="text-xs text-slate-500">Target deal margin: &gt; 25%</p>
      </div>
    </Card>
  );
};

export default MarginIndicator;
