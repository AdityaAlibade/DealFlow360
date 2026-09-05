import React from 'react';

const EmptyState = ({ title = 'No data available', description = '', action }) => {
  // TODO: Display placeholder illustration and call-to-action button
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-dashed border-slate-300 rounded-xl">
      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
        +
      </div>
      <h4 className="text-base font-semibold text-slate-800">{title}</h4>
      {description && <p className="text-sm text-slate-500 mt-1 max-w-sm">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
