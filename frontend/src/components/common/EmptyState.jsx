import React from 'react';
import { Sparkles } from 'lucide-react';

const EmptyState = ({ title = 'No data available', description = '', action, icon: Icon = Sparkles }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-300 rounded-2xl shadow-sm">
      <div className="w-14 h-14 rounded-2xl bg-[#a459a8]/10 text-[#a459a8] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
