import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Inbox,
  Search,
  Filter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  FileText,
  AlertCircle,
  Eye,
  PlusCircle,
  TrendingUp,
  RefreshCw,
  Package,
  Layers,
  ArrowRight,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import orderRequestAPI from '../api/orderRequestAPI';
import { useAuth } from '../contexts/AuthContext';

const OrderRequestsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    underReview: 0,
    quoted: 0,
    negotiation: 0,
    approved: 0,
    confirmed: 0,
    fulfilled: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [sortBy, setSortBy] = useState('newest');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [listRes, statsRes] = await Promise.all([
        orderRequestAPI.getAll({
          search: searchQuery || undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        }),
        orderRequestAPI.getStats()
      ]);

      if (listRes && listRes.success) {
        setRequests(listRes.data || []);
      } else if (Array.isArray(listRes)) {
        setRequests(listRes);
      } else if (listRes?.requests) {
        setRequests(listRes.requests);
      }

      if (statsRes && statsRes.success) {
        setStats(statsRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch order requests:', err);
      setError('Could not load order requests from database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRequests();
  };

  const getStatusBadge = (status) => {
    const s = String(status || '').toUpperCase();
    switch (s) {
      case 'PENDING':
        return <Badge variant="warning" dot>Pending Review</Badge>;
      case 'UNDER_REVIEW':
        return <Badge variant="primary" dot>Under Review</Badge>;
      case 'QUOTATION_CREATED':
      case 'QUOTED':
        return <Badge variant="info" dot>Quotation Created</Badge>;
      case 'SENT_TO_CUSTOMER':
        return <Badge variant="primary" dot>Sent to Customer</Badge>;
      case 'NEGOTIATION':
        return <Badge variant="warning" dot>In Negotiation</Badge>;
      case 'ACCEPTED':
      case 'APPROVED':
        return <Badge variant="success" dot>Approved</Badge>;
      case 'CONFIRMED':
        return <Badge variant="success" dot>Confirmed</Badge>;
      case 'FULFILLED':
        return <Badge variant="purple" dot>Fulfilled</Badge>;
      case 'CANCELLED':
      case 'REJECTED':
        return <Badge variant="danger" dot>Cancelled</Badge>;
      default:
        return <Badge variant="default">{s || 'Unknown'}</Badge>;
    }
  };

  // Client-side filtering & sorting
  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const reqNum = (req.requestNumber || req.id || '').toLowerCase();
    const custName = (req.customer?.name || req.customerName || '').toLowerCase();
    const custEmail = (req.customer?.email || req.customerEmail || '').toLowerCase();
    const itemsStr = (req.items || []).map((i) => i.product?.name || i.productName || '').join(' ').toLowerCase();
    return reqNum.includes(q) || custName.includes(q) || custEmail.includes(q) || itemsStr.includes(q);
  }).sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    if (sortBy === 'highest_value') return (b.estimatedTotal || 0) - (a.estimatedTotal || 0);
    return 0;
  });

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-[#a459a8]/10 text-[#a459a8] rounded-xl">
                <Inbox className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Order Requests</h1>
              <Badge variant="primary">{stats.total || requests.length} Total</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Review inbound customer requirements, verify stock availability, and issue compliant quotations
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchRequests}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* KPI / Status Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div
            onClick={() => setStatusFilter('PENDING')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200/80 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.pending || 0}</div>
            <span className="text-[10px] text-slate-400">Needs review</span>
          </div>

          <div
            onClick={() => setStatusFilter('UNDER_REVIEW')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-purple-500/10 border-purple-500/30 ring-2 ring-purple-500/20'
                : 'bg-white border-slate-200/80 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Under Review</span>
              <Eye className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.underReview || 0}</div>
            <span className="text-[10px] text-slate-400">In evaluation</span>
          </div>

          <div
            onClick={() => setStatusFilter('QUOTATION_CREATED')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'QUOTATION_CREATED'
                ? 'bg-blue-500/10 border-blue-500/30 ring-2 ring-blue-500/20'
                : 'bg-white border-slate-200/80 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">Quoted</span>
              <FileText className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.quoted || 0}</div>
            <span className="text-[10px] text-slate-400">Quote dispatched</span>
          </div>

          <div
            onClick={() => setStatusFilter('NEGOTIATION')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'NEGOTIATION'
                ? 'bg-amber-500/10 border-amber-500/30 ring-2 ring-amber-500/20'
                : 'bg-white border-slate-200/80 hover:border-amber-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Negotiation</span>
              <MessageSquare className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.negotiation || 0}</div>
            <span className="text-[10px] text-slate-400">Counter offers</span>
          </div>

          <div
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'CONFIRMED'
                ? 'bg-emerald-500/10 border-emerald-500/30 ring-2 ring-emerald-500/20'
                : 'bg-white border-slate-200/80 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Confirmed</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">{stats.confirmed || 0}</div>
            <span className="text-[10px] text-slate-400">Orders placed</span>
          </div>

          <div
            onClick={() => setStatusFilter('ALL')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-900/20'
                : 'bg-white border-slate-200/80 hover:border-slate-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-bold uppercase tracking-wider ${statusFilter === 'ALL' ? 'text-slate-300' : 'text-slate-600'}`}>All Requests</span>
              <Layers className={`w-4 h-4 ${statusFilter === 'ALL' ? 'text-purple-400' : 'text-slate-400'}`} />
            </div>
            <div className={`text-2xl font-black mt-2 ${statusFilter === 'ALL' ? 'text-white' : 'text-slate-900'}`}>{stats.total || requests.length}</div>
            <span className={`text-[10px] ${statusFilter === 'ALL' ? 'text-slate-400' : 'text-slate-400'}`}>View all records</span>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <Card noPadding>
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Request ID, customer, product, email..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#a459a8] focus:bg-white transition-all"
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:border-[#a459a8]"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="QUOTATION_CREATED">Quotation Created</option>
                <option value="SENT_TO_CUSTOMER">Sent to Customer</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="FULFILLED">Fulfilled</option>
                <option value="CANCELLED">Cancelled</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-semibold">Sort:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-slate-700 focus:outline-none focus:border-[#a459a8]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_value">Highest Value</option>
              </select>
            </div>
          </div>

          {/* Table View */}
          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-6 h-6 text-[#a459a8] animate-spin mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading customer order requests...</p>
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-500 text-xs">
              <AlertCircle className="w-6 h-6 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center">
              <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No order requests found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery || statusFilter !== 'ALL'
                  ? 'Try adjusting your search criteria or status filter.'
                  : 'Customer requests submitted through the catalog will appear here for review.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Requested Items</th>
                    <th className="py-3 px-3 text-center">Total Qty</th>
                    <th className="py-3 px-4 text-right">Est. Value (₹)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Linked Quotation</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.map((req) => {
                    const reqNum = req.requestNumber || req.id;
                    const items = req.items || [];
                    const totalQty = items.reduce((acc, i) => acc + (i.quantity || 1), 0);
                    const estValue = req.totalAmount || req.estimatedTotal || items.reduce((acc, i) => acc + (i.quantity || 1) * (i.targetPrice || i.product?.basePrice || 0), 0);
                    const activeQuote = req.quotations && req.quotations.length > 0 ? req.quotations[0] : null;

                    return (
                      <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Request ID */}
                        <td className="py-3 px-4">
                          <span
                            onClick={() => navigate(`/order-requests/${req.id}`)}
                            className="font-bold text-[#a459a8] hover:underline cursor-pointer flex items-center gap-1.5"
                          >
                            {reqNum}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(req.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {req.customer?.name || req.customerName || 'Direct Customer'}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
                            {req.customer?.email || req.customerEmail || '—'}
                          </div>
                        </td>

                        {/* Requested Items */}
                        <td className="py-3 px-4">
                          {items.length === 0 ? (
                            <span className="text-slate-400 italic">No products listed</span>
                          ) : (
                            <div className="space-y-0.5">
                              <div className="font-medium text-slate-800 truncate max-w-[200px]">
                                {items[0]?.product?.name || items[0]?.productName || 'Product item'}
                              </div>
                              {items.length > 1 && (
                                <span className="text-[10px] text-purple-600 font-semibold">
                                  +{items.length - 1} more {items.length - 1 === 1 ? 'item' : 'items'}
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Total Qty */}
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                            {totalQty}
                          </span>
                        </td>

                        {/* Estimated Value */}
                        <td className="py-3 px-4 text-right">
                          <span className="font-bold text-slate-900 text-sm">
                            ₹{Number(estValue).toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {getStatusBadge(req.status)}
                        </td>

                        {/* Linked Quotation */}
                        <td className="py-3 px-4">
                          {activeQuote ? (
                            <button
                              onClick={() => navigate(`/quotations/${activeQuote.id}`)}
                              className="text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>{activeQuote.quoteNumber || activeQuote.id}</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Not created</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="secondary"
                              size="xs"
                              icon={Eye}
                              onClick={() => navigate(`/order-requests/${req.id}`)}
                            >
                              Review
                            </Button>
                            
                            {!activeQuote && (
                              <Button
                                variant="primary"
                                size="xs"
                                icon={PlusCircle}
                                onClick={() => navigate(`/quotations/new?orderRequestId=${req.id}`)}
                              >
                                Create Quote
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
};

export default OrderRequestsPage;
