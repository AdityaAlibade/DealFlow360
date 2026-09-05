import React from 'react';
import Badge from '../common/Badge';

const AlertCard = ({ alert }) => {
  // TODO: Render alert resolution action triggers
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start justify-between shadow-sm">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant={alert.severity === 'danger' ? 'danger' : 'warning'}>
            {alert.severity.toUpperCase()}
          </Badge>
          <span className="font-semibold text-slate-800 text-sm">{alert.title}</span>
        </div>
        <p className="text-xs font-medium text-slate-600">Deal: {alert.deal}</p>
        <p className="text-xs text-slate-500">{alert.desc}</p>
      </div>
    </div>
  );
};

export default AlertCard;
