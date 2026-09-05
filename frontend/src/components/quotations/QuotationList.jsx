import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Table from '../common/Table';
import Badge from '../common/Badge';
import Button from '../components/common/Button';

const QuotationList = ({ data = [], onRowClick }) => {
  const navigate = useNavigate();

  const getStatusVariant = (status) => {
    const s = String(status || '').toUpperCase();
    if (s.includes('APPROV') || s.includes('CONFIRM')) return 'success';
    if (s.includes('PEND')) return 'warning';
    if (s.includes('CANCEL') || s.includes('REJECT')) return 'danger';
    return 'default';
  };

  const columns = [
    { header: 'Quote ID', accessor: 'quoteNumber', render: (r) => <span className="font-mono font-bold text-[#a459a8]">{r.quoteNumber || r.id}</span> },
    { header: 'Customer', accessor: 'customer', render: (r) => <span className="font-semibold text-slate-800">{r.customer?.name || r.customerName || 'Direct Account'}</span> },
    { header: 'Total Value', accessor: 'totalAmount', render: (r) => <span className="font-mono font-bold text-slate-900">₹{Number(r.totalAmount || r.total || 0).toLocaleString('en-IN')}</span> },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <Badge variant={getStatusVariant(row.status)} dot>{row.status || 'Draft'}</Badge>
    },
    {
      header: 'Date',
      accessor: 'createdAt',
      render: (r) => <span className="text-slate-500 text-xs">{new Date(r.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">All Quotations</h3>
        <Button variant="primary" icon={Plus} onClick={() => navigate('/order-requests')}>
          New Quotation
        </Button>
      </div>
      <Table
        columns={columns}
        data={data}
        emptyMessage="No quotations created yet."
        onRowClick={onRowClick || ((row) => navigate(`/quotations/${row.id}`))}
      />
    </div>
  );
};

export default QuotationList;
