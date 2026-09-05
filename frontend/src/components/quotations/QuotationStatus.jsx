import React from 'react';
import Badge from '../common/Badge';

const QuotationStatus = ({ id, status = 'Draft' }) => {
  // TODO: Render quote progress timeline and state transitions
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
      <div>
        <span className="text-xs text-slate-400 uppercase">Quotation Ref</span>
        <h3 className="text-lg font-bold text-slate-800">#{id || 'QT-NEW'}</h3>
      </div>
      <Badge variant="primary">{status}</Badge>
    </div>
  );
};

export default QuotationStatus;
