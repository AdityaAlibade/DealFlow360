import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, XCircle, ArrowUpRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const DealHealthPage = () => {
  const navigate = useNavigate();

  const [quotations] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dealflow360_quotations') || '[]');
    } catch {
      return [];
    }
  });

  const healthyCount = quotations.filter((q) => !(q.status || '').toLowerCase().includes('pending')).length;
  const atRiskCount = quotations.filter((q) => (q.status || '').toLowerCase().includes('pending')).length;

  const summaryCards = [
    { title: 'Healthy Deals', count: healthyCount, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
    { title: 'At Risk', count: atRiskCount, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle },
    { title: 'Critical Anomalies', count: 0, color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle }
  ];

  const alerts = quotations
    .filter((q) => (q.status || '').toLowerCase().includes('pending'))
    .map((q, idx) => ({
      id: idx + 1,
      severity: 'WARNING',
      variant: 'warning',
      quote: q.id,
      customer: q.customer,
      message: 'Discount concession requires commercial approval sign-off',
      time: q.date
    }));

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
            <Card key={idx}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.title}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{c.count} Deals</h3>
                </div>
                <div className={`p-3 rounded-xl border ${c.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Active Alerts List */}
      <Card title="Active Deal Alerts" subtitle="Prioritized list of deals requiring intervention">
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              All deals are operating within healthy governance thresholds. No active risk alerts detected.
            </div>
          ) : (
            alerts.map((alert) => (
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
            ))
          )}
        </div>
      </Card>
    </MainLayout>
  );
};

export default DealHealthPage;
