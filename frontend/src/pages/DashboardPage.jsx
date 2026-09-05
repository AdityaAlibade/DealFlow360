import React, { useState, useEffect } from 'react';
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
  Activity,
  Inbox,
  Eye,
  MessageSquare,
  Package,
  RefreshCw
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import dashboardAPI from '../api/dashboardAPI';
import orderRequestAPI from '../api/orderRequestAPI';
import quotationAPI from '../api/quotationAPI';

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

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: '₹0',
    totalRevenueNumeric: 0,
    activeQuotes: 0,
    pendingApprovals: 0,
    dealHealthScore: '0/0',
    totalQuotes: 0
  });

  const [orderStats, setOrderStats] = useState({
    pending: 0,
    underReview: 0,
    quoted: 0,
    sentToCustomer: 0,
    negotiation: 0,
    approved: 0,
    confirmed: 0,
    fulfilled: 0,
    total: 0
  });

  const [healthSummary, setHealthSummary] = useState({
    healthy: 0,
    atRisk: 0,
    critical: 0,
    total: 0,
    percentage: 100
  });

  const [pipelineSummary, setPipelineSummary] = useState([]);
  const [quotations, setQuotations] = useState([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [mRes, oRes, hRes, pRes, qRes] = await Promise.all([
        dashboardAPI.getMetrics(),
        orderRequestAPI.getStats(),
        dashboardAPI.getDealHealthSummary(),
        dashboardAPI.getPipelineSummary(),
        quotationAPI.getAll()
      ]);

      if (mRes && mRes.data) setMetrics(mRes.data);
      if (oRes && oRes.data) setOrderStats(oRes.data);
      if (hRes && hRes.data) setHealthSummary(hRes.data);
      if (pRes && pRes.data) setPipelineSummary(pRes.data);
      if (qRes && (qRes.data || Array.isArray(qRes))) {
        setQuotations(Array.isArray(qRes.data) ? qRes.data : Array.isArray(qRes) ? qRes : []);
      }
    } catch (err) {
      console.warn('Dashboard live data fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const draftQuotes = quotations.filter((q) => (q.status || '').toUpperCase() === 'DRAFT');
  const pendingQuotes = quotations.filter((q) => (q.status || '').toUpperCase().includes('PEND'));
  const approvedQuotes = quotations.filter((q) => (q.status || '').toUpperCase().includes('APPROV'));
  const confirmedQuotes = quotations.filter((q) => (q.status || '').toUpperCase().includes('CONFIRM'));

  const metricCards = [
    {
      title: 'Total Revenue',
      value: metrics.totalRevenue || `₹${Number(metrics.totalRevenueNumeric || 0).toLocaleString('en-IN')}`,
      change: metrics.activeQuotes > 0 ? `${metrics.activeQuotes} active quotations` : 'From confirmed orders',
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
    },
    {
      title: 'Active Quotes',
      value: String(metrics.activeQuotes || quotations.length),
      change: `${draftQuotes.length} in draft status`,
      icon: FileText,
      color: 'bg-sky-50 text-sky-600 border-sky-200'
    },
    {
      title: 'Pending Approvals',
      value: String(metrics.pendingApprovals || pendingQuotes.length),
      change: metrics.pendingApprovals > 0 ? `${metrics.pendingApprovals} require sign-off` : 'All approvals cleared',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-200',
      isWarning: metrics.pendingApprovals > 0
    },
    {
      title: 'Deal Health',
      value: `${healthSummary.healthy}/${healthSummary.total || quotations.length || 0}`,
      change: `${healthSummary.percentage}% healthy deals in pipeline`,
      icon: CheckCircle2,
      color: 'bg-purple-50 text-[#a459a8] border-purple-200'
    }
  ];

  const kanbanColumns = [
    {
      title: 'Draft',
      count: draftQuotes.length,
      color: 'border-slate-300 bg-slate-50',
      items: draftQuotes
    },
    {
      title: 'Pending Approval',
      count: pendingQuotes.length,
      color: 'border-amber-300 bg-amber-50/40',
      items: pendingQuotes
    },
    {
      title: 'Approved',
      count: approvedQuotes.length,
      color: 'border-emerald-300 bg-emerald-50/40',
      items: approvedQuotes
    },
    {
      title: 'Confirmed',
      count: confirmedQuotes.length,
      color: 'border-purple-300 bg-purple-50/40',
      items: confirmedQuotes
    }
  ];

  return (
    <MainLayout>
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{getDashboardHeading()}</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time PostgreSQL pipeline telemetry &bull; Authenticated as {user?.name || user?.fullName || 'User'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchDashboardData} disabled={loading}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" icon={Inbox} onClick={() => navigate('/order-requests')}>
            Order Requests
          </Button>
          <Button variant="primary" size="sm" icon={Plus} onClick={() => navigate('/order-requests')}>
            Create From Request
          </Button>
        </div>
      </div>

      {/* Order Requests Summary Strip */}
      <div className="p-4 bg-gradient-to-r from-purple-900/10 via-slate-900/5 to-purple-900/10 rounded-2xl border border-purple-200/60 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#a459a8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Customer Order Requests Pipeline
            </h3>
          </div>
          <button
            onClick={() => navigate('/order-requests')}
            className="text-xs font-bold text-[#a459a8] hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Order Requests <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          <div
            onClick={() => navigate('/order-requests?status=PENDING')}
            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all text-center"
          >
            <span className="text-[10px] font-bold uppercase text-amber-700 block">Pending</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{orderStats.pending || 0}</span>
          </div>

          <div
            onClick={() => navigate('/order-requests?status=UNDER_REVIEW')}
            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-purple-400 hover:shadow-xs cursor-pointer transition-all text-center"
          >
            <span className="text-[10px] font-bold uppercase text-purple-700 block">Under Review</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{orderStats.underReview || 0}</span>
          </div>

          <div
            onClick={() => navigate('/order-requests?status=QUOTATION_CREATED')}
            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-blue-400 hover:shadow-xs cursor-pointer transition-all text-center"
          >
            <span className="text-[10px] font-bold uppercase text-blue-700 block">Quotes Created</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{orderStats.quoted || 0}</span>
          </div>

          <div
            onClick={() => navigate('/order-requests?status=SENT_TO_CUSTOMER')}
            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-sky-400 hover:shadow-xs cursor-pointer transition-all text-center"
          >
            <span className="text-[10px] font-bold uppercase text-sky-700 block">Awaiting Cust.</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{orderStats.sentToCustomer || 0}</span>
          </div>

          <div
            onClick={() => navigate('/order-requests?status=NEGOTIATION')}
            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all text-center"
          >
            <span className="text-[10px] font-bold uppercase text-amber-700 block">Negotiations</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{orderStats.negotiation || 0}</span>
          </div>

          <div
            onClick={() => navigate('/order-requests?status=APPROVED')}
            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-xs cursor-pointer transition-all text-center"
          >
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Approved</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{orderStats.approved || 0}</span>
          </div>

          <div
            onClick={() => navigate('/order-requests?status=CONFIRMED')}
            className="p-3 bg-white rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:shadow-xs cursor-pointer transition-all text-center"
          >
            <span className="text-[10px] font-bold uppercase text-emerald-800 block">Confirmed</span>
            <span className="text-xl font-black text-slate-900 mt-0.5 block">{orderStats.confirmed || 0}</span>
          </div>
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
              <span className="font-bold text-[#a459a8]">{healthSummary.percentage}% Healthy</span>
            </div>
            {/* Dynamic Progress Bar */}
            <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${healthSummary.percentage}%` }}
                title={`Healthy: ${healthSummary.healthy}`}
              />
              <div
                className="bg-amber-500 h-full transition-all"
                style={{ width: `${healthSummary.total > 0 ? (healthSummary.atRisk / healthSummary.total) * 100 : 0}%` }}
                title={`At Risk: ${healthSummary.atRisk}`}
              />
              <div
                className="bg-red-500 h-full transition-all"
                style={{ width: `${healthSummary.total > 0 ? (healthSummary.critical / healthSummary.total) * 100 : 0}%` }}
                title={`Critical: ${healthSummary.critical}`}
              />
            </div>

            {/* Status distribution dots */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-slate-700">Healthy</span>
                </div>
                <p className="text-xl font-bold text-emerald-700 mt-1">{healthSummary.healthy} deals</p>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-semibold text-slate-700">At Risk</span>
                </div>
                <p className="text-xl font-bold text-amber-700 mt-1">{healthSummary.atRisk} deals</p>
              </div>

              <div className="p-3 bg-red-50/60 border border-red-100 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-slate-700">Critical</span>
                </div>
                <p className="text-xl font-bold text-red-700 mt-1">{healthSummary.critical} deals</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="space-y-3">
            <button
              onClick={() => navigate('/order-requests')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#a459a8] hover:bg-purple-50/30 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[#a459a8]/10 text-[#a459a8]">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">New Quotation</p>
                  <p className="text-[11px] text-slate-400">Build CPQ quote from Order Request</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/approvals')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#a459a8] hover:bg-purple-50/30 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Review Approvals</p>
                  <p className="text-[11px] text-slate-400">{metrics.pendingApprovals} quotes pending sign-off</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/deal-health')}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-[#a459a8] hover:bg-purple-50/30 transition-all text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">View Health Alerts</p>
                  <p className="text-[11px] text-slate-400">{healthSummary.critical} critical risk warnings</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </Card>
      </div>

      {/* Pipeline Stage Kanban Overview */}
      <Card title="Pipeline Stage Overview" subtitle="Real-time deal progress by stage">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {kanbanColumns.map((col, idx) => (
            <div key={idx} className={`p-4 rounded-xl border ${col.color}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">{col.title}</span>
                <Badge variant="default">{col.count}</Badge>
              </div>
              <div className="space-y-2">
                {col.items.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic text-center py-4">No deals in this stage</p>
                ) : (
                  col.items.slice(0, 4).map((q) => (
                    <div
                      key={q.id}
                      onClick={() => navigate(`/quotations/${q.id}`)}
                      className="p-2.5 bg-white rounded-lg border border-slate-200/80 hover:border-[#a459a8] transition-all cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{q.quoteNumber || q.id}</span>
                        <span className="text-xs font-mono font-semibold text-[#a459a8]">₹{Number(q.totalAmount || q.total || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{q.customer?.name || q.customerName || 'Customer'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </MainLayout>
  );
};

export default DashboardPage;
