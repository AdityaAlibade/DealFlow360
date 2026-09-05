import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, ArrowUpRight, ShoppingBag, ArrowRight } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Pagination from '../components/common/Pagination';
import productAPI from '../api/productAPI';

const QuotationPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [tierFilter, setTierFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [customerRequests, setCustomerRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await productAPI.getAllCustomerRequests();
        if (res && res.data) setCustomerRequests(res.data);
      } catch (err) {
        console.warn('Failed to load customer requests', err);
      }
    };
    fetchRequests();
  }, []);

  const pendingRequests = customerRequests.filter((r) => r.status === 'PENDING');

  const [quotations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dealflow360_quotations') || '[]');
    } catch {
      return [];
    }
  });


  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Quotations</h1>
          <p className="text-xs text-slate-500 mt-1">Configure pricing, discount compliance, and customer negotiations</p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() => navigate('/quotations/new')}
        >
          New Quotation
        </Button>
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
            onClick={() => navigate('/quotations/Q-1042')}
          >
            Review in Quote Builder <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
          <option value="Negotiation">Negotiation</option>
          <option value="Confirmed">Confirmed</option>
        </select>

        {/* Customer Tier Dropdown */}
        <select
          value={tierFilter}
          onChange={(e) => setTierFilter(e.target.value)}
          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#a459a8]/30 text-slate-700"
        >
          <option value="All">Tier: All</option>
          <option value="Gold">Gold Tier</option>
          <option value="Silver">Silver Tier</option>
          <option value="Bronze">Bronze Tier</option>
        </select>

        <Button variant="secondary" size="sm" icon={Filter}>
          More Filters
        </Button>
      </div>

      {/* Quotation Cards Grid */}
      {quotations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-purple-50 text-[#a459a8] rounded-2xl flex items-center justify-center mx-auto border border-purple-100 shadow-sm">
            <Plus className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No Quotations Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Get started by creating your first CPQ quotation with multi-tier customer discounts and margin protections.
            </p>
          </div>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/quotations/new')}
          >
            Create Quotation
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {quotations.map((quote) => (
              <div
                key={quote.id}
                onClick={() => navigate(`/quotations/${quote.id}`)}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#a459a8] transition-all cursor-pointer group relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#a459a8] group-hover:underline">
                        {quote.id}
                      </span>
                      <Badge variant={(quote.tier || 'standard').toLowerCase()}>{quote.tier}</Badge>
                    </div>
                    <Badge variant={quote.statusVariant || 'default'} dot>{quote.status}</Badge>
                  </div>

                  <div className="py-4">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#a459a8] transition-colors">
                      {quote.customer}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Sales Rep: <span className="font-medium text-slate-700">{quote.salesRep}</span> &bull; {quote.itemsCount} Line Items
                    </p>
                    {quote.pendingCustomerRequests > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-[10px] font-bold">
                        <ShoppingBag className="w-3 h-3 text-[#a459a8]" />
                        {quote.pendingCustomerRequests} Pending Product Request
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Amount</span>
                    <p className="text-lg font-extrabold text-slate-900">{quote.amount}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400">{quote.date}</span>
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
