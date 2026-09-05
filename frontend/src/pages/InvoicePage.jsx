import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import invoiceAPI from '../api/invoiceAPI';

const InvoicePage = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await invoiceAPI.getAll();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setInvoices(list);
    } catch (err) {
      console.warn('Failed to load invoices from API:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const unpaidCount = invoices.filter((i) => (i.status || '').toUpperCase() === 'ISSUED' || (i.status || '').toUpperCase() === 'PENDING' || (i.status || '').toUpperCase() === 'UNPAID').length;
  const paidCount = invoices.filter((i) => (i.status || '').toUpperCase() === 'PAID').length;

  const formattedInvoices = invoices.map((inv) => {
    const isPaid = (inv.status || '').toUpperCase() === 'PAID';
    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber || inv.id,
      customer: inv.customer?.companyName || inv.customer?.name || inv.order?.customer?.companyName || 'Customer Account',
      amount: `₹${Number(inv.totalAmount || inv.amount || 0).toLocaleString('en-IN')}`,
      status: isPaid ? 'Paid' : 'Unpaid',
      statusVariant: isPaid ? 'success' : 'danger',
      dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : 'Net 30 Days'
    };
  });

  const columns = [
    {
      header: 'Invoice #',
      accessor: 'invoiceNumber',
      render: (r) => (
        <span className="font-mono font-bold text-[#a459a8] flex items-center gap-1 group-hover:underline">
          {r.invoiceNumber} <ArrowUpRight className="w-3.5 h-3.5" />
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
          {r.status === 'Paid' ? '🟢 Paid' : '🔴 Unpaid'}
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
            {(unpaidCount > 0 || paidCount > 0) && (
              <div className="flex items-center gap-2 text-xs">
                {unpaidCount > 0 && <Badge variant="danger">{unpaidCount} Unpaid</Badge>}
                {paidCount > 0 && <Badge variant="success">{paidCount} Paid</Badge>}
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Automated tax invoices, payment reconciliation, and customer ledger</p>
        </div>
      </div>

      <Card title="Billing Ledger">
        <Table
          columns={columns}
          data={formattedInvoices}
          emptyMessage={loading ? 'Loading invoices from database...' : 'No invoices generated yet.'}
          onRowClick={(row) => navigate(`/invoices/${row.id}`)}
        />
      </Card>
    </MainLayout>
  );
};

export default InvoicePage;
