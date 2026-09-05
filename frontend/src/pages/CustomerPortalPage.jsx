import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  CheckCircle2,
  Send,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Clock,
  Check,
  ShoppingBag,
  FileText,
  ListOrdered,
  Search,
  Plus,
  Minus,
  XCircle,
  CheckCircle,
  Info,
  ArrowRight,
  LogOut
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import customerPortalAPI from '../api/customerPortalAPI';

const CustomerPortalPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Active Tab: 'quote' | 'catalog' | 'requests'
  const [activeTab, setActiveTab] = useState('quote');

  const [quoteData, setQuoteData] = useState(null);
  const [products, setProducts] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Negotiation state
  const [comment, setComment] = useState('Can this be 15% off instead of 10%? We are committing to a 2-year term.');
  const [counterDiscount, setCounterDiscount] = useState(15);
  const [requestedDate, setRequestedDate] = useState('2026-09-01');
  const [submittedStatus, setSubmittedStatus] = useState(null);
  const [activeLineComment, setActiveLineComment] = useState({});

  // Catalog filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [requestQuantities, setRequestQuantities] = useState({});
  const [requestMessages, setRequestMessages] = useState({});
  const [submittingRequestId, setSubmittingRequestId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const categories = ['All', 'Hardware', 'Services', 'Software & Cloud', 'Warranty & SLA'];

  const refreshAllData = async () => {
    try {
      const [qRes, pRes, reqRes] = await Promise.all([
        customerPortalAPI.getQuoteByToken(token),
        customerPortalAPI.getProducts(token, { search: searchQuery, category: selectedCategory }),
        customerPortalAPI.getProductRequests(token)
      ]);

      if (qRes && qRes.data) {
        setQuoteData(qRes.data);
        setCounterDiscount(qRes.data.currentDiscount);
      }
      if (pRes && pRes.data) {
        setProducts(pRes.data);
        const initialQty = {};
        pRes.data.forEach((p) => {
          initialQty[p.id] = initialQty[p.id] || 1;
        });
        setRequestQuantities((prev) => ({ ...initialQty, ...prev }));
      }
      if (reqRes && reqRes.data) {
        setProductRequests(reqRes.data);
      }
    } catch (err) {
      setError(err.message || 'Unauthorized: Invalid or expired quotation access token.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    refreshAllData();
  }, [token]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const pRes = await customerPortalAPI.getProducts(token, { search: searchQuery, category: selectedCategory });
        if (pRes && pRes.data) {
          setProducts(pRes.data);
        }
      } catch (err) {
        console.warn('Catalog filter error', err);
      }
    };
    if (!loading && quoteData) {
      fetchCatalog();
    }
  }, [searchQuery, selectedCategory]);

  const handleQtyChange = (productId, delta) => {
    setRequestQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(50, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleRequestProduct = async (product) => {
    setSubmittingRequestId(product.id);
    setError(null);
    try {
      const qty = requestQuantities[product.id] || 1;
      const msg = requestMessages[product.id] || `Please include ${qty}x ${product.name} in our active quotation proposal.`;

      await customerPortalAPI.createProductRequest(token, {
        productId: product.id,
        quantity: qty,
        message: msg
      });

      setToastMessage({
        type: 'success',
        text: `Product request for ${qty}x ${product.name} sent to your Sales Representative!`
      });

      // Clear custom message
      setRequestMessages((prev) => ({ ...prev, [product.id]: '' }));

      // Refresh requests list
      const reqRes = await customerPortalAPI.getProductRequests(token);
      if (reqRes && reqRes.data) setProductRequests(reqRes.data);

      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      setError(err.message || 'Failed to submit product request');
    } finally {
      setSubmittingRequestId(null);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await customerPortalAPI.cancelProductRequest(token, requestId);
      setToastMessage({
        type: 'info',
        text: `Product request ${requestId} has been cancelled.`
      });
      const reqRes = await customerPortalAPI.getProductRequests(token);
      if (reqRes && reqRes.data) setProductRequests(reqRes.data);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setError(err.message || 'Failed to cancel product request');
    }
  };

  const handleSubmitCounter = async () => {
    try {
      const res = await customerPortalAPI.submitCounterProposal(token, {
        counterDiscount,
        comment,
        requestedDate
      });
      setSubmittedStatus(res);
      const updated = await customerPortalAPI.getQuoteByToken(token);
      setQuoteData(updated.data);
    } catch {
      setError('Failed to submit counter proposal');
    }
  };

  const handleConfirmQuotation = async () => {
    try {
      const res = await customerPortalAPI.acceptQuote(token);
      setSubmittedStatus(res);
      const updated = await customerPortalAPI.getQuoteByToken(token);
      setQuoteData(updated.data);
    } catch {
      setError('Failed to confirm quotation');
    }
  };

  const handleAddLineComment = async (lineId) => {
    const lineText = activeLineComment[lineId];
    if (!lineText) return;
    try {
      await customerPortalAPI.addLineComment(token, lineId, lineText);
      setActiveLineComment({ ...activeLineComment, [lineId]: '' });
      const updated = await customerPortalAPI.getQuoteByToken(token);
      setQuoteData(updated.data);
    } catch {
      setError('Failed to add comment to line item');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-md text-center space-y-3">
          <div className="w-8 h-8 border-4 border-[#a459a8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Validating Secure Session & Catalog...</p>
        </div>
      </div>
    );
  }

  if (error && !quoteData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="p-8 bg-white rounded-2xl border border-red-200 shadow-xl text-center max-w-md space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">403 - Customer Access Forbidden</h2>
          <p className="text-xs text-slate-600">{error || 'Invalid or expired customer token. You are not authorized to view this quotation.'}</p>
          <p className="text-[11px] text-slate-400">Token provided: <span className="font-mono">{token}</span></p>
          <div className="pt-2">
            <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 underline">
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header (Isolated Customer Portal Layout) */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#a459a8] flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-[#a459a8]/30">
            D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900">
                DealFlow<span className="text-[#a459a8]">360</span> Customer Portal
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Verified Session
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Quotation: <span className="font-mono font-bold text-slate-800">{quoteData.quotationId}</span> &bull; {quoteData.customerName} ({quoteData.contactPerson})
            </p>
          </div>
        </div>

        {/* Portal Section Navigation Tabs & Logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('quote')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'quote'
                  ? 'bg-white text-[#a459a8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quotation</span>
            </button>

            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'catalog'
                  ? 'bg-white text-[#a459a8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Products & Services</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === 'requests'
                  ? 'bg-white text-[#a459a8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>My Requests</span>
              {productRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#a459a8] text-white rounded-full text-[9px] font-extrabold">
                  {productRequests.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="max-w-5xl mx-auto w-full px-6 pt-4 animate-in fade-in duration-200">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-700 hover:text-emerald-900">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-8 space-y-6">

        {/* ===================================================
            TAB 1: PRODUCTS & SERVICES (CUSTOMER CATALOG)
        =================================================== */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Catalog Hero & Search Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[#a459a8]" />
                    Customer Products & Services Catalog
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse eligible hardware, enterprise cloud services, and SLA plans. Request items to be added directly to your proposal.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-purple-50 rounded-xl border border-purple-200/80 text-[11px] text-purple-900 font-semibold flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-[#a459a8]" />
                    <span>Requests are sent to your Sales Rep for quote inclusion</span>
                  </div>
                </div>
              </div>

              {/* Search & Category Filter Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search products by title, category, or specifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-[#a459a8] focus:ring-2 focus:ring-[#a459a8]/20 bg-slate-50 focus:bg-white transition-all"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-[#a459a8] text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {products.map((p) => {
                const qty = requestQuantities[p.id] || 1;
                const isSubmitting = submittingRequestId === p.id;
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-[#a459a8]/50 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Badge variant="primary" className="text-[10px] mb-1.5">{p.category}</Badge>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{p.name}</h3>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-extrabold text-[#a459a8] font-mono">${p.unitPrice}</p>
                          <p className="text-[10px] text-slate-400">{p.unit}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.description}</p>

                      {/* Specs */}
                      {p.specs && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {p.specs.map((spec, idx) => (
                            <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-medium">
                              &bull; {spec}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quantity & Request Section */}
                    <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(p.id, -1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold font-mono text-slate-800">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(p.id, 1)}
                            className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Optional Note */}
                      <div>
                        <input
                          type="text"
                          placeholder="Add optional request notes / specifications for sales..."
                          value={requestMessages[p.id] || ''}
                          onChange={(e) => setRequestMessages({ ...requestMessages, [p.id]: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#a459a8]"
                        />
                      </div>

                      <Button
                        variant="primary"
                        size="sm"
                        icon={Send}
                        disabled={isSubmitting}
                        onClick={() => handleRequestProduct(p)}
                        className="w-full bg-[#a459a8] hover:bg-[#924b96] py-2 text-xs font-bold"
                      >
                        {isSubmitting ? 'Submitting Request...' : `Request ${qty}x Product`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================
            TAB 2: MY PRODUCT REQUESTS
        =================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-[#a459a8]" />
                    My Product Requests History
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track the status of all requested products sent to your dedicated Sales Representative.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={ShoppingBag}
                  onClick={() => setActiveTab('catalog')}
                >
                  Browse More Products
                </Button>
              </div>

              {productRequests.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-purple-50 text-[#a459a8] rounded-2xl flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">No Product Requests Submitted Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    You can browse our catalog of hardware, enterprise services, and SLA plans to request additions to your active proposal.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2 bg-[#a459a8]"
                    onClick={() => setActiveTab('catalog')}
                  >
                    Open Product Catalog
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-xs">
                    <thead>
                      <tr className="text-slate-500 font-semibold uppercase bg-slate-50/70">
                        <th className="py-3 px-3 text-left">Request ID</th>
                        <th className="py-3 px-3 text-left">Product</th>
                        <th className="py-3 px-3 text-center">Qty</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-3 text-left">Requested Date</th>
                        <th className="py-3 px-3 text-left">Sales Representative Response</th>
                        <th className="py-3 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productRequests.map((req) => {
                        let badgeVariant = 'warning';
                        if (req.status === 'ACCEPTED') badgeVariant = 'success';
                        if (req.status === 'REJECTED') badgeVariant = 'danger';
                        if (req.status === 'CANCELLED') badgeVariant = 'default';

                        return (
                          <tr key={req.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-3 font-mono font-bold text-[#a459a8]">{req.id}</td>
                            <td className="py-3 px-3">
                              <p className="font-bold text-slate-800">{req.productName}</p>
                              <p className="text-[10px] text-slate-400">{req.category} &bull; ${req.unitPrice} base</p>
                            </td>
                            <td className="py-3 px-3 text-center font-mono font-bold">{req.quantity}</td>
                            <td className="py-3 px-3 text-center">
                              <Badge variant={badgeVariant} dot>{req.status}</Badge>
                            </td>
                            <td className="py-3 px-3 text-slate-500">
                              {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="py-3 px-3 text-slate-700 max-w-xs">
                              {req.salesResponse ? (
                                <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px]">
                                  <span className="font-semibold text-slate-800">{req.reviewedBy || 'Sales Rep'}: </span>
                                  {req.salesResponse}
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-[11px]">Awaiting sales rep review...</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {req.status === 'PENDING' ? (
                                <button
                                  onClick={() => handleCancelRequest(req.id)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
                                >
                                  Cancel
                                </button>
                              ) : req.status === 'ACCEPTED' ? (
                                <button
                                  onClick={() => setActiveTab('quote')}
                                  className="px-2.5 py-1 text-[11px] font-bold text-[#a459a8] hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors flex items-center gap-1 ml-auto"
                                >
                                  View in Quote <ArrowRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-slate-400 text-[10px]">&mdash;</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================================================
            TAB 3: CURRENT QUOTATION & NEGOTIATION
        =================================================== */}
        {activeTab === 'quote' && (
          <div className="space-y-6">
            {submittedStatus && (
              <div className={`p-6 rounded-2xl border text-center shadow-sm space-y-2 ${
                submittedStatus.reApprovalTriggered
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto ${
                  submittedStatus.reApprovalTriggered ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  {submittedStatus.reApprovalTriggered ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                </div>
                <h3 className="text-base font-bold">{submittedStatus.message}</h3>
                <p className="text-xs opacity-80">Quotation Status: <span className="font-bold">{submittedStatus.status}</span></p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Quote Details & Line Items */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Quotation Proposal: {quoteData.quotationId}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Prepared exclusively for <span className="font-semibold text-slate-700">{quoteData.customerName} ({quoteData.contactPerson})</span></p>
                    </div>
                    <Badge variant="primary">Valid Until {quoteData.quoteValidity}</Badge>
                  </div>

                  {/* Line items table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-xs">
                      <thead>
                        <tr className="text-slate-500 font-semibold uppercase">
                          <th className="py-2 text-left">Item Description</th>
                          <th className="py-2 text-center">Qty</th>
                          <th className="py-2 text-right">Price</th>
                          <th className="py-2 text-right">Discount</th>
                          <th className="py-2 text-right">Net ({quoteData.currency})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quoteData.lineItems.map((item) => (
                          <React.Fragment key={item.id}>
                            <tr>
                              <td className="py-3 font-medium text-slate-800">
                                {item.name}
                                {item.id.includes('req') && (
                                  <span className="ml-2 px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded">
                                    Added from Product Request
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-center font-mono">{item.qty}</td>
                              <td className="py-3 text-right font-mono">${item.price}</td>
                              <td className="py-3 text-right font-mono text-emerald-600 font-semibold">{item.discount}%</td>
                              <td className="py-3 text-right font-mono font-bold text-slate-900">${item.total}</td>
                            </tr>
                            <tr>
                              <td colSpan={5} className="pb-3 pt-0">
                                <div className="flex items-center gap-2 pl-2">
                                  <input
                                    type="text"
                                    placeholder={`Ask question or comment on ${item.name}...`}
                                    value={activeLineComment[item.id] || ''}
                                    onChange={(e) => setActiveLineComment({ ...activeLineComment, [item.id]: e.target.value })}
                                    className="flex-1 px-2.5 py-1 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:border-[#a459a8]"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-[10px] py-1 px-2"
                                    onClick={() => handleAddLineComment(item.id)}
                                  >
                                    <MessageSquare className="w-3 h-3 mr-1" /> Send Note
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total Investment */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 uppercase">Total Proposed Investment:</span>
                    <span className="text-xl font-extrabold text-[#a459a8]">
                      ${quoteData.lineItems.reduce((acc, curr) => acc + curr.total, 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Negotiation / Status History */}
                {quoteData.negotiationHistory && quoteData.negotiationHistory.length > 0 && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Negotiation & Activity History</h4>
                    <div className="space-y-2">
                      {quoteData.negotiationHistory.map((hist, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-400">
                            <span className="font-semibold text-slate-700">{hist.actor}</span>
                            <span>{new Date(hist.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-slate-600">{hist.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right 1 Col: Negotiation Panel */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#a459a8]" />
                    Negotiate & Counter
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700">Requested Counter Discount (%)</label>
                      <input
                        type="number"
                        value={counterDiscount}
                        onChange={(e) => setCounterDiscount(Number(e.target.value))}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#a459a8]/30 font-mono"
                        min="0"
                        max="50"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Standard discount is {quoteData.currentDiscount}%. Setting &gt;10% will route for re-approval.
                      </p>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">Requested Delivery Date</label>
                      <input
                        type="date"
                        value={requestedDate}
                        onChange={(e) => setRequestedDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#a459a8]/30"
                      />
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700">Customer Terms / Justification Note</label>
                      <textarea
                        rows={4}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full mt-1 p-3 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#a459a8]/30"
                        placeholder="Provide term requirements or multi-year commitment justification..."
                      />
                    </div>

                    <div className="pt-2 space-y-2">
                      <Button
                        variant="primary"
                        className="w-full bg-[#a459a8] hover:bg-[#924b96]"
                        icon={Send}
                        onClick={handleSubmitCounter}
                      >
                        Submit Counter Request
                      </Button>
                      <Button
                        variant="success"
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        icon={Check}
                        onClick={handleConfirmQuotation}
                      >
                        Confirm & Accept Quotation
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Quick Add Products banner */}
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <ShoppingBag className="w-4 h-4 text-[#a459a8]" />
                    <span>Need More Hardware or Services?</span>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    Browse our product catalog to request add-on storage, docking stations, or 24/7 SLA plans.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab('catalog')}
                    className="w-full border-purple-300 text-purple-900 hover:bg-purple-100 text-xs"
                  >
                    Open Product Catalog
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-400">
        &copy; 2026 DealFlow360 Platform. Secured with 256-bit encryption.
      </footer>
    </div>
  );
};

export default CustomerPortalPage;
