import React from 'react';
import Badge from '../common/Badge';

const InvoiceStatus = ({ id, status = 'Unpaid' }) => {
  // TODO: Display invoice payment state and overdue alert
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center">
      <div>
        <span className="text-xs text-slate-400 uppercase">Invoice Reference</span>
        <h3 className="text-lg font-bold text-slate-800">#{id || 'INV-2024-090'}</h3>
      </div>
      <Badge variant="warning">{status}</Badge>
    </div>
  );
};

export default InvoiceStatus;
