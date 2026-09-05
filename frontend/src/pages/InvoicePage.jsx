import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';

const InvoicePage = () => {
  const navigate = useNavigate();

  const invoices = [
    {
      id: 'INV-1042',
      customer: 'Acme Corp',
      amount: '₹2,730',
      status: 'Unpaid',
      statusVariant: 'danger',
      dueDate: 'Sep 10, 2026'
    },
    {
      id: 'INV-1043',
      customer: 'Acme Corp',
      amount: '₹46',
      status: 'Paid',
      statusVariant: 'success',
      dueDate: 'Sep 15, 2026'
    },
    {
      id: 'INV-1038',
      customer: 'Nova Retail',
      amount: '₹9,750',
      status: 'Paid',
      statusVariant: 'success',
      dueDate: 'Aug 30, 2026'
    },
    {
      id: 'INV-1035',
      customer: 'Beta Industries',
      amount: '₹45,000',
      status: 'Paid',
      statusVariant: 'success',
      dueDate: 'Aug 25, 2026'
    }
  ];

  const columns = [
    {
      header: 'Invoice #',
      accessor: 'id',
      render: (r) => (
        <span className="font-mono font-bold text-[#a459a8] flex items-center gap-1 group-hover:underline">
          {r.id} <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      )
    },
    { header: 'Customer', accessor: 'customer', render: (r) => <span className="font-semibold text-slate-800">{r.customer}</span> },
    { header: 'Amount Due', accessor: 'amount', render: (r) => <span className="font-mono font-bold text-slate-900">{r.amount}</span> },
    {
      header: 'Payment Status',
      accessor: 'status',
      render: (r) => (
        <Badge variant={r.statusVariant} dot>
          {r.status === 'Unpaid' ? '🔴 Unpaid' : '🟢 Paid'}
        </Badge>
      )
    },
    { header: 'Due Date', accessor: 'dueDate', render: (r) => <span className="font-mono text-slate-500">{r.dueDate}</span> }
  ];

  return (
    <MainLayout>
      {/* Header with stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Invoices</h1>
            <div className="flex items-center gap-2 text-xs">
              <Badge variant="danger">4 Unpaid</Badge>
              <Badge variant="success">21 Paid</Badge>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1">Automated tax invoices, payment reconciliation, and customer ledger</p>
        </div>
      </div>

      <Card title="Billing Ledger">
        <Table
          columns={columns}
          data={invoices}
          onRowClick={(row) => navigate(`/invoices/${row.id}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default InvoicePage;
