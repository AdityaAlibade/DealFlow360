import React from 'react';
import Card from '../common/Card';

const MarginIndicator = ({ margin = 34.2, target = 25 }) => {
  const isHealthy = margin >= target;

  return (
    <Card title="Deal Margin Realization">
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-700">Calculated Gross Margin:</span>
          <span className={`font-bold text-sm ${isHealthy ? 'text-emerald-600' : 'text-red-600'}`}>
            {margin}%
          </span>
        </div>
        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${isHealthy ? 'bg-emerald-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(margin * 2, 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500">
          Target corporate threshold: &gt; {target}%. {isHealthy ? 'Deal is within policy limits.' : 'Concessions exceed margin baseline.'}
        </p>
      </div>
    </Card>
  );
};

export default MarginIndicator;
