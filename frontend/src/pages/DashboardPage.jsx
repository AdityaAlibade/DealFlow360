import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const getDashboardHeading = () => {
    switch (role) {
      case 'sales_rep':
        return 'Sales Rep Dashboard';
      case 'sales_manager':
        return 'Sales Manager Dashboard';
      case 'finance_ops':
        return 'Finance & Operations Dashboard';
      case 'admin':
        return 'Admin Operations Dashboard';
      default:
        return 'Sales Dashboard';
    }
  };

  const [quotations] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dealflow360_quotations') || '[]');
    } catch {
      return [];
    }
  });

  const totalRev = quotations.reduce((acc, q) => {
    const numeric = parseFloat(String(q.amount || '').replace(/[^0-9.]/g, '')) || 0;
    return acc + numeric;
  }, 0);

  const activeCount = quotations.length;
  const pendingCount = quotations.filter((q) => (q.status || '').toLowerCase().includes('pending')).length;
  const approvedCount = quotations.filter((q) => (q.status || '').toLowerCase().includes('approved')).length;
  const confirmedCount = quotations.filter((q) => (q.status || '').toLowerCase().includes('confirmed')).length;
  const draftCount = quotations.filter((q) => (q.status || '').toLowerCase().includes('draft')).length;

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `₹${totalRev.toLocaleString()}`,
      change: activeCount > 0 ? `${activeCount} quotes active` : 'No revenue recorded yet',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Active Quotes',
      value: String(activeCount),
      change: activeCount > 0 ? `${draftCount} in draft` : 'No active quotes',
      icon: FileText,
      color: 'bg-sky-50 text-sky-600 border-sky-200'
    },
    {
      title: 'Pending Approvals',
      value: String(pendingCount),
      change: pendingCount > 0 ? `${pendingCount} require sign-off` : 'All clear',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      isWarning: pendingCount > 0
    },
    {
      title: 'Deal Health',
      value: activeCount > 0 ? `${approvedCount + confirmedCount} / ${activeCount}` : '0 / 0',
      change: activeCount > 0 ? `${Math.round(((approvedCount + confirmedCount) / activeCount) * 100)}% healthy deals` : 'No deals evaluated',
      icon: CheckCircle2,
      color: 'bg-purple-50 text-[#a459a8] border-purple-200'
    }
  ];

  const recentActivities = [];

  const kanbanColumns = [
    {
      title: 'Draft',
      count: draftCount,
      color: 'border-slate-300 bg-slate-50',
      items: quotations.filter((q) => (q.status || '').toLowerCase().includes('draft'))
    },
    {
      title: 'Pending Approval',
      count: pendingCount,
      color: 'border-amber-300 bg-amber-50/40',
      items: quotations.filter((q) => (q.status || '').toLowerCase().includes('pending'))
    },
    {
      title: 'Approved',
      count: approvedCount,
      color: 'border-emerald-300 bg-emerald-50/40',
      items: quotations.filter((q) => (q.status || '').toLowerCase().includes('approved'))
    },
    {
      title: 'Confirmed',
      count: confirmedCount,
      color: 'border-purple-300 bg-purple-50/40',
      items: quotations.filter((q) => (q.status || '').toLowerCase().includes('confirmed'))
    }
  ];


  return (
    <MainLayout>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{getDashboardHeading()}</h1>
          <p className="text-xs text-slate-500 mt-1">Last updated: Today, 2:30 PM &bull; Real-time pipeline intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/deal-health')}>
            View Health Alerts
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/quotations/new')}>
            New Quotation
          </Button>
        </div>
      </div>

      {/* Metric Cards (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((m, idx) => {
          const Icon = m.icon;
          return (
            <Card key={idx} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1.5">{m.value}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    {m.change}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Deal Health Summary & Quick Actions (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deal Health Summary */}
        <Card title="Deal Health Distribution" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Overall Pipeline Health</span>
              <span className="font-bold text-[#a459a8]">79% Healthy</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div className="bg-emerald-500 h-full" style={{ width: '79%' }} title="Healthy: 42" />
              <div className="bg-amber-500 h-full" style={{ width: '15%' }} title="At Risk: 8" />
              <div className="bg-red-500 h-full" style={{ width: '6%' }} title="Critical: 3" />
            </div>

            {/* Status distribution dots */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">Healthy</span>
                </div>
                <p className="text-xl font-bold text-emerald-700 mt-1">42 deals</p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold text-slate-700">At Risk</span>
                </div>
                <p className="text-xl font-bold text-amber-700 mt-1">8 deals</p>
              </div>

              <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-slate-700">Critical</span>
                </div>
                <p className="text-xl font-bold text-red-700 mt-1">3 deals</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <button
              onClick={() => navigate('/quotations/new')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#a459a8] hover:bg-purple-50/30 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#a459a8]/10 text-[#a459a8]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">New Quotation</p>
                  <p className="text-[11px] text-slate-400">Build custom CPQ quote</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/approvals')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/30 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Review Approvals</p>
                  <p className="text-[11px] text-slate-400">8 quotes pending sign-off</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/deal-health')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-red-500 hover:bg-red-50/30 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-200">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">View Health Alerts</p>
                  <p className="text-[11px] text-slate-400">3 critical anomaly warnings</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </Card>
      </div>

      {/* Pipeline Preview Kanban */}
      <Card title="Pipeline Stage Overview" subtitle="Real-time deal progress by stage">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col, idx) => (
            <div key={idx} className={`p-3.5 rounded-xl border ${col.color} space-y-3`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">{col.title}</h4>
                <Badge variant="default" className="text-[10px] px-2 py-0.5">{col.count}</Badge>
              </div>

              <div className="space-y-2">
                {col.items.length === 0 ? (
                  <div className="py-6 px-3 border border-dashed border-slate-300 rounded-lg text-center text-[11px] text-slate-400 font-medium">
                    No quotations in {col.title}
                  </div>
                ) : (
                  col.items.map((item, iIdx) => (
                    <div
                      key={iIdx}
                      onClick={() => navigate(`/quotations/${item.id}`)}
                      className="p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:border-[#a459a8] cursor-pointer transition-all hover:shadow"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-[#a459a8]">{item.id}</span>
                        {item.tag && <Badge variant="danger" className="text-[9px] py-0">{item.tag}</Badge>}
                      </div>
                      <p className="text-xs font-semibold text-slate-800 mt-1 truncate">{item.customer}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                        <span>{item.rep}</span>
                        <span className="font-bold text-slate-900">{item.amount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity Section */}
      <Card
        title="Recent Activity"
        subtitle="Latest quote lifecycle and approval events"
        action={
          <button onClick={() => navigate('/quotations')} className="text-xs font-semibold text-[#a459a8] hover:underline">
            View All Activity
          </button>
        }
      >
        {recentActivities.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No recent activity recorded yet. Create a new quotation to get started.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <li key={act.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{act.text}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">By {act.user}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">{act.time}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </MainLayout>
  );
};

export default DashboardPage;
