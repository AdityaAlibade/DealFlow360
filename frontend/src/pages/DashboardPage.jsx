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

const DashboardPage = () => {
  const navigate = useNavigate();

  const metricCards = [
    {
      title: 'Total Revenue',
      value: '₹28.5L',
      change: '+18.4% vs last month',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Active Quotes',
      value: '24',
      change: '+4 new today',
      icon: FileText,
      color: 'bg-sky-50 text-sky-600 border-sky-200'
    },
    {
      title: 'Pending Approvals',
      value: '8',
      change: '3 require attention',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      isWarning: true
    },
    {
      title: 'Deal Health',
      value: '42 / 53',
      change: '79% healthy deals',
      icon: CheckCircle2,
      color: 'bg-purple-50 text-[#a459a8] border-purple-200'
    }
  ];

  const recentActivities = [
    { id: 1, icon: FileText, text: 'Quote Q-1042 (Acme Corp) submitted for approval', time: '10 mins ago', user: 'J. Rao' },
    { id: 2, icon: CheckCircle2, text: 'Quote Q-1039 approved by Sales Manager', time: '45 mins ago', user: 'M. Shah' },
    { id: 3, icon: AlertTriangle, text: 'High discount alert flagged on Q-1045', time: '2 hours ago', user: 'Deal Sentinel' },
    { id: 4, icon: DollarSign, text: 'Invoice INV-1038 marked Paid (₹9,750)', time: '4 hours ago', user: 'Finance' },
    { id: 5, icon: Activity, text: 'Counter proposal received on Customer Portal Q-1030', time: '5 hours ago', user: 'Customer' },
  ];

  const kanbanColumns = [
    {
      title: 'Draft',
      count: 6,
      color: 'border-slate-300 bg-slate-50',
      items: [
        { id: 'Q-1048', customer: 'Nexus Tech', amount: '₹18,400', rep: 'John Doe' },
        { id: 'Q-1049', customer: 'Orbit Retail', amount: '₹7,200', rep: 'Sarah Lee' },
      ]
    },
    {
      title: 'Pending Approval',
      count: 8,
      color: 'border-amber-300 bg-amber-50/40',
      items: [
        { id: 'Q-1042', customer: 'Acme Corp', amount: '₹12,400', rep: 'J. Rao', tag: 'High Risk' },
        { id: 'Q-1039', customer: 'Beta Ind.', amount: '₹45,000', rep: 'R. Iyer' },
      ]
    },
    {
      title: 'Approved',
      count: 7,
      color: 'border-emerald-300 bg-emerald-50/40',
      items: [
        { id: 'Q-1035', customer: 'Nova Retail', amount: '₹28,900', rep: 'John Doe' },
        { id: 'Q-1033', customer: 'Skyline Corp', amount: '₹62,000', rep: 'Sarah Lee' },
      ]
    },
    {
      title: 'Confirmed',
      count: 12,
      color: 'border-purple-300 bg-purple-50/40',
      items: [
        { id: 'Q-1028', customer: 'Zenith Co', amount: '₹95,000', rep: 'J. Rao' },
        { id: 'Q-1025', customer: 'Apex Global', amount: '₹34,500', rep: 'John Doe' },
      ]
    }
  ];

  return (
    <MainLayout>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Last updated: Today, 2:30 PM &bull; Real-time pipeline intelligence</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => navigate('/deal-health')}>
            View Health Alerts
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/quotations')}>
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
              onClick={() => navigate('/quotations')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#a459a8] hover:bg-purple-50/30 transition-all text-left"
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
                {col.items.map((item, iIdx) => (
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
                ))}
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
      </Card>
    </MainLayout>
  );
};

export default DashboardPage;
