import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';

const ApprovalPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingOnly, setPendingOnly] = useState(false);

  const [approvalRows] = useState(() => {
    try {
      const savedQuotes = JSON.parse(localStorage.getItem('dealflow360_quotations') || '[]');
      const pendingQuotes = savedQuotes.filter((q) => (q.status || '').toLowerCase().includes('pending'));
      return pendingQuotes.map((q) => ({
        id: q.id,
        customer: q.customer,
        risk: 'MEDIUM',
        riskColor: 'medium',
        stage: 'Sales Manager',
        assignedTo: 'Governance Approver',
        date: q.date,
        status: 'Pending',
        reason: 'Commercial discount limits require approval'
      }));
    } catch {
      return [];
    }
  });

  const tabs = [
    { key: 'all', label: 'All', count: approvalRows.length },
    { key: 'pending', label: 'Pending', count: approvalRows.filter(r => r.status === 'Pending').length },
    { key: 'approved', label: 'Approved', count: approvalRows.filter(r => r.status === 'Approved').length },
    { key: 'returned', label: 'Returned', count: approvalRows.filter(r => r.status === 'Returned').length }
  ];


  const filteredRows = approvalRows.filter((r) => {
    if (activeTab === 'pending') return r.status === 'Pending';
    if (activeTab === 'approved') return r.status === 'Approved';
    if (activeTab === 'returned') return r.status === 'Returned';
    if (pendingOnly) return r.status === 'Pending';
    return true;
  });

  const columns = [
    {
      header: 'Quotation',
      accessor: 'id',
      render: (row) => (
        <span className="font-mono font-bold text-[#a459a8] flex items-center gap-1 group-hover:underline">
          {row.id} <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      )
    },
    { header: 'Customer', accessor: 'customer', render: (row) => <span className="font-semibold text-slate-800">{row.customer}</span> },
    {
      header: 'Blended Risk',
      accessor: 'risk',
      render: (row) => (
        <Badge variant={row.riskColor}>
          {row.risk === 'HIGH' ? '🟠 HIGH' : row.risk === 'MEDIUM' ? '🟡 MEDIUM' : '🟢 LOW'}
        </Badge>
      )
    },
    { header: 'Current Stage', accessor: 'stage' },
    { header: 'Assigned Approver', accessor: 'assignedTo' },
    { header: 'Submission Date', accessor: 'date' },
    {
      header: 'Action',
      accessor: 'action',
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/approvals/${row.id}`);
          }}
          className="text-xs font-semibold text-[#a459a8] hover:underline"
        >
          Review Risk
        </button>
      )
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approvals</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-tier discount governance and risk audit trail</p>
        </div>

        {/* Toggle pending only */}
        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200">
          <input
            type="checkbox"
            checked={pendingOnly}
            onChange={(e) => setPendingOnly(e.target.checked)}
            className="rounded text-[#a459a8] focus:ring-[#a459a8]"
          />
          Filter: Pending Only
        </label>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-[#a459a8] text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Table View */}
      <Table
        columns={columns}
        data={filteredRows}
        emptyMessage="No quotations currently awaiting review or approval."
        onRowClick={(row) => navigate(`/approvals/${row.id}`)}
      />
    </MainLayout>
  );
};

export default ApprovalPage;
