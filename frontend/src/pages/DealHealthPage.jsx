import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const DealHealthPage = () => {
  const navigate = useNavigate();

  const summaryCards = [
    { title: 'Healthy Deals', count: 42, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    { title: 'At Risk', count: 8, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
    { title: 'Critical Anomalies', count: 3, color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle }
  ];

  const alerts = [
    {
      id: 1,
      severity: 'CRITICAL',
      variant: 'danger',
      quote: 'Q-1024',
      customer: 'Wayne Enterprises',
      message: 'Inactive in negotiation stage for 8 days without buyer response',
      time: '2 hours ago'
    },
    {
      id: 2,
      severity: 'WARNING',
      variant: 'warning',
      quote: 'Q-1032',
      customer: 'Stark Industries',
      message: 'Conceded discount (23%) is 12pt above rep quarterly average',
      time: '4 hours ago'
    },
    {
      id: 3,
      severity: 'CRITICAL',
      variant: 'danger',
      quote: 'Q-1041',
      customer: 'Zenith Co',
      message: 'Warehouse stock shortage is jeopardizing delivery promise date',
      time: '1 day ago'
    },
    {
      id: 4,
      severity: 'WARNING',
      variant: 'warning',
      quote: 'Q-1045',
      customer: 'Nova Retail',
      message: 'Awaiting VP Finance approval for more than 48 hours',
      time: '2 days ago'
    }
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Deal Health Dashboard</h1>
        <p className="text-xs text-slate-500 mt-1">Autonomous deal risk telemetry detecting margin degradation and process bottlenecks</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {summaryCards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <Card key={idx} className={`border ${c.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider">{c.title}</p>
                  <h3 className="text-3xl font-extrabold mt-1">{c.count}</h3>
                </div>
                <Icon className="w-8 h-8 opacity-80" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Alerts List */}
      <Card title="Active Deal Anomalies & Telemetry Alerts" subtitle="Click any alert to inspect the underlying quotation">
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => navigate(`/quotations/${alert.quote}`)}
              className="p-4 bg-white hover:bg-purple-50/40 rounded-xl border border-slate-200 hover:border-[#a459a8] transition-all cursor-pointer shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <Badge variant={alert.variant} className="mt-0.5 text-[10px] font-bold">
                  {alert.severity}
                </Badge>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#a459a8] group-hover:underline">{alert.quote}</span>
                    <span className="text-slate-400">&bull;</span>
                    <span className="text-xs font-semibold text-slate-800">{alert.customer}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 flex items-center gap-2 justify-end">
                <span className="text-[11px] text-slate-400">{alert.time}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#a459a8]" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </MainLayout>
  );
};

export default DealHealthPage;
