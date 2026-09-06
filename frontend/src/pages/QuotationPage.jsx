import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ArrowUpRight, ShoppingBag, ArrowRight, RefreshCw, FileText, Lock } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import productAPI from '../api/productAPI';
import quotationAPI from '../api/quotationAPI';
import { useAuth } from '../contexts/AuthContext';

const QuotationPage = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const currentRole = (user?.role || role || '').toLowerCase().trim();
  const canCreateQuotation = currentRole === 'sales_rep';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [customerRequests, setCustomerRequests] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuotationsAndRequests = async () => {
    try {
      setLoading(true);
      const [qRes, rRes] = await Promise.all([
        quotationAPI.getAll({
          status: statusFilter !== 'All' ? statusFilter.toUpperCase().replace(' ', '_') : undefined
        }),
        productAPI.getAllCustomerRequests()
      ]);

      if (qRes && (qRes.data || Array.isArray(qRes))) {
        setQuotations(Array.isArray(qRes.data) ? qRes.data : Array.isArray(qRes) ? qRes : []);
      }
      if (rRes && rRes.data) {
        setCustomerRequests(rRes.data);
      }
    } catch (err) {
      console.warn('Failed to load live quotations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotationsAndRequests();
  }, [statusFilter]);

  const pendingRequests = customerRequests.filter((r) => r.status === 'PENDING');

  const filteredQuotations = quotations.filter((q) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const num = (q.quoteNumber || q.id || '').toLowerCase();
    const cust = (q.customer?.name || q.customerName || '').toLowerCase();
    return num.includes(term) || cust.includes(term);
  });

  const getStatusVariant = (status) => {
    const s = String(status || '').toUpperCase();
    if (s.includes('APPROV') || s.includes('CONFIRM')) return 'success';
    if (s.includes('PEND')) return 'warning';
    if (s.includes('CANCEL') || s.includes('REJECT')) return 'danger';
    return 'default';
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quotations</h1>
          <p className="text-xs text-slate-500 mt-1">Configure pricing, discount compliance, and customer negotiations</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchQuotationsAndRequests} disabled={loading}>
            Refresh
          </Button>
          {canCreateQuotation ? (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate('/order-requests')}
            >
              New Quotation
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Read-Only Mode</span>
            </div>
          )}
        </div>
      </div>

      {/* Customer Product Requests Alert Banner */}
      {pendingRequests.length > 0 && (
        <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#a459a8] text-white flex items-center justify-center font-bold shadow-md shadow-[#a459a8]/30">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-purple-950">
                {pendingRequests.length} Incoming Customer Product Request(s) Pending Review
              </p>
              <p className="text-[11px] text-purple-800">
                Latest: <span className="font-semibold">{pendingRequests[0].customerName}</span> requested{' '}
                <span className="font-bold">{pendingRequests[0].quantity}x {pendingRequests[0].productName}</span>.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            className="bg-[#a459a8] text-xs font-bold"
            onClick={() => navigate('/order-requests')}
          >
            Review Inbound Requests <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by quote # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30 focus:border-[#a459a8]"
          />
        </div>

        {/* Status Dropdown */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30 text-slate-700"
        >
          <option value="All">Status: All</option>
          <option value="Draft">Draft</option>
          <option value="Pending Approval">Pending Approval</option>
          <option value="Approved">Approved</option>
          <option value="Confirmed">Confirmed</option>
        </select>
      </div>

      {/* Quotation Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-6 h-6 text-[#a459a8] animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading quotations from database...</p>
        </div>
      ) : filteredQuotations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-purple-50 text-[#a459a8] rounded-2xl flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Quotations Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Select an inbound customer Order Request to generate a compliant CPQ quotation.
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/order-requests')}
          >
            Create Quotation from Request
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredQuotations.map((quote) => (
              <div
                key={quote.id}
                onClick={() => navigate(`/quotations/${quote.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#a459a8] transition-all cursor-pointer group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#a459a8] group-hover:underline">
                        {quote.quoteNumber || quote.id}
                      </span>
                      <Badge variant="gold">{quote.customer?.tier || 'GOLD'} Tier</Badge>
                    </div>
                    <Badge variant={getStatusVariant(quote.status)} dot>{quote.status}</Badge>
                  </div>

                  <div className="py-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#a459a8] transition-colors">
                      {quote.customer?.name || quote.customerName || 'Direct Account'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Sales Rep: <span className="font-medium text-slate-700">{quote.salesRep?.fullName || 'Sales Representative'}</span> &bull; {quote.items?.length || 1} Line Items
                    </p>
                    {quote.productRequest && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-[10px] font-bold">
                        <ShoppingBag className="w-3 h-3 text-[#a459a8]" />
                        From #{quote.productRequest.requestNumber}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Amount</span>
                    <p className="text-lg font-extrabold text-slate-900">₹{Number(quote.totalAmount || quote.total || 0).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">{new Date(quote.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                    <div className="flex items-center gap-1 text-xs text-[#a459a8] font-semibold mt-0.5 justify-end">
                      Open Builder <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <Pagination currentPage={currentPage} totalPages={1} onPageChange={setCurrentPage} />
        </>
      )}
    </MainLayout>
  );
};

export default QuotationPage;
