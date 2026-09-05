import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Badge from '../components/common/Badge';
import Table from '../components/common/Table';
import approvalAPI from '../api/approvalAPI';

const ApprovalPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [pendingOnly, setPendingOnly] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const res = await approvalAPI.getAll();
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setApprovals(list);
    } catch (err) {
      console.warn('Failed to fetch approvals from API:', err);
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const approvalRows = approvals.map((a) => {
    const quote = a.quotation || {};
    const status = a.status || quote.status || 'PENDING';
    const isViolating = (quote.items || []).some((it) => (it.discountPct || 0) > 15);

    return {
      id: a.id,
      quotationId: quote.id || a.quotationId || a.id,
      customer: quote.customer?.companyName || quote.customer?.name || 'Customer Account',
      risk: isViolating ? 'HIGH' : 'MEDIUM',
      riskColor: isViolating ? 'danger' : 'warning',
      stage: a.approver?.role ? a.approver.role.replace('_', ' ') : 'Sales Manager',
      assignedTo: a.approver?.fullName || 'Governance Approver',
      date: a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : 'Recent',
      status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
      reason: a.reason || a.comments || 'Commercial discount limits require governance review'
    };
  });

  const tabs = [
    { key: 'all', label: 'All', count: approvalRows.length },
    { key: 'pending', label: 'Pending', count: approvalRows.filter((r) => r.status.toLowerCase() === 'pending').length },
    { key: 'approved', label: 'Approved', count: approvalRows.filter((r) => r.status.toLowerCase() === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: approvalRows.filter((r) => r.status.toLowerCase() === 'rejected').length }
  ];

  const filteredRows = approvalRows.filter((r) => {
    if (activeTab === 'pending') return r.status.toLowerCase() === 'pending';
    if (activeTab === 'approved') return r.status.toLowerCase() === 'approved';
    if (activeTab === 'rejected') return r.status.toLowerCase() === 'rejected';
    if (pendingOnly) return r.status.toLowerCase() === 'pending';
    return true;
  });

  const columns = [
    {
      header: 'Quotation',
      accessor: 'quotationId',
      render: (row) => (
        <span className="font-mono font-bold text-[#a459a8] flex items-center gap-1 group-hover:underline">
          {row.quotationId} <ArrowUpRight className="w-3.5 h-3.5" />
        </span>
      )
    },
    { header: 'Customer', accessor: 'customer', render: (row) => <span className="font-semibold text-slate-800">{row.customer}</span> },
    {
      header: 'Blended Risk',
      accessor: 'risk',
      render: (row) => (
        <Badge variant={row.riskColor}>
          {row.risk === 'HIGH' ? '🟠 HIGH' : '🟡 MEDIUM'}
        </Badge>
      )
    },
    { header: 'Current Stage', accessor: 'stage' },
    { header: 'Assigned Approver', accessor: 'assignedTo' },
    { header: 'Submission Date', accessor: 'date' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <Badge variant={row.status.toLowerCase() === 'approved' ? 'success' : row.status.toLowerCase() === 'rejected' ? 'danger' : 'warning'} dot>
          {row.status}
        </Badge>
      )
    },
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
        emptyMessage={loading ? 'Loading approvals from database...' : 'No quotations currently awaiting review or approval.'}
        onRowClick={(row) => navigate(`/approvals/${row.id}`)}
      />
    </MainLayout>
  );
};

export default ApprovalPage;
