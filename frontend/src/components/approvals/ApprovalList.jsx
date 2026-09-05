import React from 'react';
import Table from '../common/Table';
import Badge from '../common/Badge';

const ApprovalList = ({ data = [], onRowClick }) => {
  const columns = [
    { header: 'Quote Ref', accessor: 'quotation', render: (r) => <span className="font-mono font-bold text-[#a459a8]">{r.quotation?.quoteNumber || r.quotationId || r.quoteId || r.id}</span> },
    { header: 'Customer', accessor: 'customer', render: (r) => <span className="font-semibold text-slate-800">{r.quotation?.customer?.name || r.customerName || 'Direct Account'}</span> },
    { header: 'Approval Level', accessor: 'level', render: (r) => <span className="text-slate-700 text-xs font-semibold">{r.level || 'L1 (Sales Manager)'}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => {
        const s = String(row.status || '').toUpperCase();
        const variant = s === 'APPROVED' ? 'success' : s === 'REJECTED' ? 'danger' : 'warning';
        return <Badge variant={variant} dot>{row.status || 'PENDING'}</Badge>;
      }
    },
    {
      header: 'Requested Date',
      accessor: 'createdAt',
      render: (r) => <span className="text-slate-500 text-xs">{new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
    }
  ];

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={data}
        emptyMessage="No approval requests pending review."
        onRowClick={onRowClick}
      />
    </div>
  );
};

export default ApprovalList;
