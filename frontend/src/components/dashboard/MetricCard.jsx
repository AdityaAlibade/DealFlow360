import React from 'react';
import Card from '../common/Card';

const MetricCard = ({ title, value, change, isUrgent = false }) => {
  // TODO: Implement metric trend calculations and icons
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{title}</p>
          <h4 className="text-2xl font-bold text-slate-900 mt-1">{value}</h4>
        </div>
        {change && (
          <span
            className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (isUrgent ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')}
          >
            {change}
          </span>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
