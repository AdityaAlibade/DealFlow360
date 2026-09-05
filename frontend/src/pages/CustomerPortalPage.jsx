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
  const { token: routeToken } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const token = routeToken || user?.portalToken || user?.id || '';

  // Active Tab: 'quote' | 'catalog' | 'requests'
  const [activeTab, setActiveTab] = useState('quote');
  const [requestsSubTab, setRequestsSubTab] = useState('all'); // 'all' | 'negotiations' | 'products' | 'orders'

  const [quoteData, setQuoteData] = useState(null);
  const [products, setProducts] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [negotiationsList, setNegotiationsList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Negotiation state
  const [comment, setComment] = useState('');
  const [counterDiscount, setCounterDiscount] = useState(0);
  const [requestedDate, setRequestedDate] = useState('');
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

  const normalizeQuoteData = (raw) => {
    if (!raw) return null;
    const rawItems = Array.isArray(raw.lineItems) ? raw.lineItems : Array.isArray(raw.items) ? raw.items : [];
    const lineItems = rawItems.map((it, idx) => ({
      id: String(it.id || `item-${idx + 1}`),
      name: it.name || it.product?.name || `Product #${it.productId || idx + 1}`,
      qty: it.qty || it.quantity || 1,
      price: it.price || it.unitPrice || 0,
      discount: it.discount || 0,
      total: it.total || it.totalPrice || ((it.qty || it.quantity || 1) * (it.price || it.unitPrice || 0))
    }));

    const negotiationHistory = Array.isArray(raw.negotiationHistory)
      ? raw.negotiationHistory.map((n) => ({
          actor: n.actor || n.actorRole || 'Customer',
          timestamp: n.timestamp || n.createdAt || new Date().toISOString(),
          message: n.message || n.comment || 'Negotiation update'
        }))
      : [];

    return {
      ...raw,
      quotationId: raw.quotationId || raw.quoteNumber || raw.id || 'QUOTATION-PREVIEW',
      customerName: raw.customerName || raw.customer?.companyName || raw.customer?.name || 'Valued Customer',
      contactPerson: raw.contactPerson || raw.customer?.contactPerson || raw.customer?.name || 'Representative',
      quoteValidity: raw.quoteValidity || (raw.expiresAt ? new Date(raw.expiresAt).toLocaleDateString('en-IN') : '30 Days'),
      currency: raw.currency || 'INR',
      currentDiscount: raw.currentDiscount ?? (lineItems[0]?.discount || 0),
      lineItems,
      negotiationHistory
    };
  };

  const refreshAllData = async () => {
    try {
      const [qRes, pRes, reqRes] = await Promise.all([
        customerPortalAPI.getQuoteByToken(token),
        customerPortalAPI.getProducts(token, { search: searchQuery, category: selectedCategory }),
        customerPortalAPI.getProductRequests(token)
      ]);

      if (qRes && (qRes.data || qRes.quotationId || qRes.id)) {
        const normalized = normalizeQuoteData(qRes.data || qRes);
        setQuoteData(normalized);
        if (normalized?.currentDiscount !== undefined) {
          setCounterDiscount(normalized.currentDiscount);
        }
      }
      if (pRes) {
        const productList = Array.isArray(pRes.data) ? pRes.data : Array.isArray(pRes) ? pRes : [];
        setProducts(productList);
        const initialQty = {};
        productList.forEach((p) => {
          initialQty[p.id] = initialQty[p.id] || 1;
        });
        setRequestQuantities((prev) => ({ ...initialQty, ...prev }));
      }
      if (reqRes) {
        if (reqRes.data && typeof reqRes.data === 'object' && !Array.isArray(reqRes.data)) {
          setProductRequests(reqRes.data.productRequests || []);
          setNegotiationsList(reqRes.data.negotiations || []);
          setOrdersList(reqRes.data.orders || []);
        } else if (Array.isArray(reqRes.data)) {
          setProductRequests(reqRes.data);
        } else if (Array.isArray(reqRes)) {
          setProductRequests(reqRes);
        }
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
      const current = prev[productId] !== undefined ? prev[productId] : 1;
      const next = Math.max(0, Math.min(50, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleDirectQtyChange = (productId, value) => {
    if (value === '') {
      setRequestQuantities((prev) => ({ ...prev, [productId]: 0 }));
      return;
    }
    const parsed = parseInt(value, 10);
    const next = isNaN(parsed) ? 0 : Math.max(0, Math.min(50, parsed));
    setRequestQuantities((prev) => ({ ...prev, [productId]: next }));
  };

  const handleRequestProduct = async (product) => {
    const qty = requestQuantities[product.id] !== undefined ? requestQuantities[product.id] : 1;
    if (qty <= 0) {
      setError('Please select a quantity greater than 0 before submitting a request.');
      return;
    }
    setSubmittingRequestId(product.id);
    setError(null);
    try {
      const msg = requestMessages[product.id] || `Please include ${qty}x ${product.name} in our active quotation proposal.`;

      await customerPortalAPI.createProductRequest(token, {
        productId: product.id,
        quantity: qty,
        message: msg
      });

      setToastMessage({
        type: 'success',
        text: `Product request for ${qty}x ${product.name} sent to your Sales Representative and added to My Requests!`
      });

      // Clear custom message
      setRequestMessages((prev) => ({ ...prev, [product.id]: '' }));

      // Refresh requests list
      await refreshAllData();

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
      await refreshAllData();
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
      setToastMessage({
        type: 'success',
        text: 'Counter-offer submitted and recorded in your My Requests history!'
      });
      const updated = await customerPortalAPI.getQuoteByToken(token);
      if (updated && (updated.data || updated.id)) {
        setQuoteData(normalizeQuoteData(updated.data || updated));
      }
      await refreshAllData();
      setTimeout(() => setToastMessage(null), 6000);
    } catch {
      setError('Failed to submit counter proposal');
    }
  };

  const handleConfirmQuotation = async () => {
    try {
      const res = await customerPortalAPI.acceptQuote(token);
      setSubmittedStatus(res);
      setToastMessage({
        type: 'success',
        text: 'Quotation confirmed! Order created and warehouse fulfillment initiated.'
      });
      const updated = await customerPortalAPI.getQuoteByToken(token);
      if (updated && (updated.data || updated.id)) {
        setQuoteData(normalizeQuoteData(updated.data || updated));
      }
      await refreshAllData();
      setTimeout(() => setToastMessage(null), 6000);
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
              {(productRequests.length + negotiationsList.length + ordersList.length) > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#a459a8] text-white rounded-full text-[9px] font-extrabold">
                  {productRequests.length + negotiationsList.length + ordersList.length}
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
                const qty = requestQuantities[p.id] !== undefined ? requestQuantities[p.id] : 1;
                const isSubmitting = submittingRequestId === p.id;
                const productPrice = Number(p.basePrice ?? p.price ?? p.unitPrice ?? 0);
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
                          <p className="text-base font-extrabold text-[#a459a8] font-mono">₹{productPrice.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slate-400">{p.unit || 'unit'}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.description}</p>

                      {/* Specs */}
                      {Array.isArray(p.specs) && p.specs.length > 0 && (
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
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(p.id, -1)}
                            disabled={qty <= 0}
                            className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={qty}
                            onChange={(e) => handleDirectQtyChange(p.id, e.target.value)}
                            className="w-10 text-center text-xs font-bold font-mono text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#a459a8] rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleQtyChange(p.id, 1)}
                            disabled={qty >= 50}
                            className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5" />
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
                        disabled={isSubmitting || qty <= 0}
                        onClick={() => handleRequestProduct(p)}
                        className={`w-full py-2 text-xs font-bold transition-all ${
                          qty <= 0
                            ? '!bg-slate-200 !text-slate-400 !border-slate-200 cursor-not-allowed shadow-none'
                            : 'bg-[#a459a8] hover:bg-[#924b96] text-white'
                        }`}
                      >
                        {isSubmitting
                          ? 'Submitting Request...'
                          : qty <= 0
                          ? 'Select Quantity (0 selected)'
                          : `Request ${qty}x Product`}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================
            TAB 2: MY REQUESTS & NEGOTIATIONS DASHBOARD
        =================================================== */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <ListOrdered className="w-5 h-5 text-[#a459a8]" />
                    My Activity & Requests History
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Track the live review status of your quotation counter-offers, product requests, and confirmed orders.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={ShoppingBag}
                  onClick={() => setActiveTab('catalog')}
                >
                  Browse Catalog
                </Button>
              </div>

              {/* Sub-Tabs: All | Negotiations | Product Requests | Orders */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setRequestsSubTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    requestsSubTab === 'all'
                      ? 'bg-[#a459a8] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Activity ({negotiationsList.length + productRequests.length + ordersList.length})
                </button>

                <button
                  onClick={() => setRequestsSubTab('negotiations')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    requestsSubTab === 'negotiations'
                      ? 'bg-[#a459a8] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Counter-Offers & Negotiations</span>
                  <span className="px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded-full text-[10px] font-extrabold">
                    {negotiationsList.length}
                  </span>
                </button>

                <button
                  onClick={() => setRequestsSubTab('products')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    requestsSubTab === 'products'
                      ? 'bg-[#a459a8] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Product Requests</span>
                  <span className="px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded-full text-[10px] font-extrabold">
                    {productRequests.length}
                  </span>
                </button>

                <button
                  onClick={() => setRequestsSubTab('orders')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    requestsSubTab === 'orders'
                      ? 'bg-[#a459a8] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Confirmed Orders</span>
                  <span className="px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded-full text-[10px] font-extrabold">
                    {ordersList.length}
                  </span>
                </button>
              </div>

              {/* 1. NEGOTIATIONS / COUNTER-OFFERS SECTION */}
              {(requestsSubTab === 'all' || requestsSubTab === 'negotiations') && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#a459a8]" />
                      Quotation Counter-Offers & Discount Requests ({negotiationsList.length})
                    </h3>
                  </div>

                  {negotiationsList.length === 0 ? (
                    requestsSubTab === 'negotiations' && (
                      <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        No counter-offers submitted yet. You can submit discount counter-proposals on the Quotation tab.
                      </div>
                    )
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead>
                          <tr className="text-slate-500 font-semibold uppercase bg-slate-50/70">
                            <th className="py-2.5 px-3 text-left">Offer ID</th>
                            <th className="py-2.5 px-3 text-left">Quote Ref</th>
                            <th className="py-2.5 px-3 text-left">Item / Scope</th>
                            <th className="py-2.5 px-3 text-right">Requested Price</th>
                            <th className="py-2.5 px-3 text-center">Discount</th>
                            <th className="py-2.5 px-3 text-center">Review Status</th>
                            <th className="py-2.5 px-3 text-left">Submitted Date</th>
                            <th className="py-2.5 px-3 text-left">Justification / Notes</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {negotiationsList.map((neg) => {
                            let badgeVariant = 'warning';
                            let statusLabel = neg.status;
                            if (neg.status === 'APPROVAL_REQUIRED' || neg.status === 'PENDING') {
                              badgeVariant = 'warning';
                              statusLabel = 'UNDER REVIEW';
                            } else if (neg.status === 'APPROVED' || neg.status === 'ACCEPTED') {
                              badgeVariant = 'success';
                              statusLabel = 'APPROVED';
                            } else if (neg.status === 'REJECTED') {
                              badgeVariant = 'danger';
                              statusLabel = 'REJECTED';
                            }

                            return (
                              <tr key={neg.id || neg.negotiationId} className="hover:bg-slate-50/50">
                                <td className="py-3 px-3 font-mono font-bold text-[#a459a8]">{neg.id}</td>
                                <td className="py-3 px-3 font-semibold text-slate-800">{neg.quoteNumber || quoteData?.quotationId}</td>
                                <td className="py-3 px-3 text-slate-700 font-medium">{neg.productName}</td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                                  ₹{Number(neg.requestedPrice || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-bold text-emerald-600">
                                  {neg.discountPercent}%
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <Badge variant={badgeVariant} dot>{statusLabel}</Badge>
                                </td>
                                <td className="py-3 px-3 text-slate-500">
                                  {new Date(neg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={neg.message}>
                                  {neg.message || 'No notes attached'}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  <button
                                    onClick={() => setActiveTab('quote')}
                                    className="px-2 py-1 text-[11px] font-bold text-[#a459a8] hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors inline-flex items-center gap-1"
                                  >
                                    View Quote <ArrowRight className="w-3 h-3" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* 2. PRODUCT & BUNDLE REQUESTS SECTION */}
              {(requestsSubTab === 'all' || requestsSubTab === 'products') && (
                <div className="pt-4 space-y-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#a459a8]" />
                      Product & Bundle Inclusions ({productRequests.length})
                    </h3>
                  </div>

                  {productRequests.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No hardware or service requests submitted. Browse the Products & Services catalog to request item additions.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead>
                          <tr className="text-slate-500 font-semibold uppercase bg-slate-50/70">
                            <th className="py-2.5 px-3 text-left">Request ID</th>
                            <th className="py-2.5 px-3 text-left">Product</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Unit Price</th>
                            <th className="py-2.5 px-3 text-right">Est. Total Value</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-left">Linked Quotation</th>
                            <th className="py-2.5 px-3 text-left">Requested Date</th>
                            <th className="py-2.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {productRequests.map((req) => {
                            let badgeVariant = 'warning';
                            if (req.status === 'ACCEPTED' || req.status === 'CONFIRMED' || req.status === 'APPROVED') badgeVariant = 'success';
                            if (req.status === 'REJECTED' || req.status === 'CANCELLED') badgeVariant = 'danger';
                            if (req.status === 'QUOTATION_CREATED' || req.status === 'QUOTED') badgeVariant = 'info';

                            const linkedQuote = req.linkedQuotation || (req.quotations && req.quotations.length > 0 ? req.quotations[0] : null);
                            const totalEstValue = req.totalAmount || req.estimatedTotal || ((req.quantity || 1) * (req.unitPrice || 0));

                            return (
                              <tr key={req.id || req.requestId} className="hover:bg-slate-50/50">
                                <td className="py-3 px-3 font-mono font-bold text-[#a459a8]">{req.id}</td>
                                <td className="py-3 px-3">
                                  <p className="font-bold text-slate-800">{req.productName}</p>
                                  <p className="text-[10px] text-slate-400">{req.category}</p>
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-bold">{req.quantity}</td>
                                <td className="py-3 px-3 text-right font-mono text-slate-600">
                                  ₹{Number(req.unitPrice || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                                  ₹{Number(totalEstValue || 0).toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <Badge variant={badgeVariant} dot>{req.status}</Badge>
                                </td>
                                <td className="py-3 px-3">
                                  {linkedQuote ? (
                                    <div className="space-y-0.5">
                                      <span className="font-mono font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-[11px] block w-fit">
                                        #{linkedQuote.quoteNumber || linkedQuote.id}
                                      </span>
                                      <span className="text-[10px] text-slate-600 block">
                                        Amount: <span className="font-semibold text-slate-900">₹{Number(linkedQuote.totalAmount || linkedQuote.total || 0).toLocaleString('en-IN')}</span>
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">Quotation in progress</span>
                                  )}
                                </td>
                                <td className="py-3 px-3 text-slate-500">
                                  {new Date(req.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {req.status === 'PENDING' ? (
                                    <button
                                      onClick={() => handleCancelRequest(req.id || req.requestId)}
                                      className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  ) : linkedQuote ? (
                                    <button
                                      onClick={() => {
                                        if (linkedQuote.portalToken && linkedQuote.portalToken !== token) {
                                          navigate(`/customer-portal/${linkedQuote.portalToken}`);
                                        } else {
                                          setActiveTab('quote');
                                        }
                                      }}
                                      className="px-2.5 py-1 text-[11px] font-bold text-[#a459a8] hover:bg-purple-50 rounded-lg border border-purple-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                                    >
                                      View Quote <ArrowRight className="w-3 h-3" />
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
              )}

              {/* 3. CONFIRMED ORDERS & SHIPMENTS SECTION */}
              {(requestsSubTab === 'all' || requestsSubTab === 'orders') && (
                <div className="pt-4 space-y-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-[#a459a8]" />
                      Confirmed Orders & Delivery Tracking ({ordersList.length})
                    </h3>
                  </div>

                  {ordersList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No confirmed orders found. Once you accept a quotation, your order and warehouse delivery tracking will appear here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ordersList.map((ord) => {
                        let badgeVariant = 'warning';
                        if (ord.status === 'COMPLETED') badgeVariant = 'success';
                        if (ord.status === 'PARTIALLY_FULFILLED') badgeVariant = 'warning';

                        return (
                          <div key={ord.id || ord.orderId} className="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-mono font-bold text-sm text-[#a459a8]">{ord.orderNumber}</span>
                              <Badge variant={badgeVariant} dot>{ord.status}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500">Order Amount:</span>
                              <span className="font-mono font-bold text-slate-900">₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-500">Fulfillment Status:</span>
                              <span className="font-mono font-semibold text-purple-900">
                                {ord.totalFulfilled} fulfilled &bull; {ord.totalBackordered} backordered
                              </span>
                            </div>
                            <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-400 flex justify-between">
                              <span>Placed on {new Date(ord.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="text-emerald-700 font-bold">{ord.fulfillmentCount} Shipments Dispatched</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                          <th className="py-2 text-right">Net ({quoteData?.currency || 'INR'})</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(quoteData?.lineItems || []).map((item) => (
                          <React.Fragment key={item.id}>
                            <tr>
                              <td className="py-3 font-medium text-slate-800">
                                {item.name}
                                {String(item.id).includes('req') && (
                                  <span className="ml-2 px-1.5 py-0.2 bg-purple-100 text-purple-700 text-[9px] font-bold rounded">
                                    Added from Product Request
                                  </span>
                                )}
                              </td>
                              <td className="py-3 text-center font-mono">{item.qty}</td>
                              <td className="py-3 text-right font-mono">₹{Number(item.price || 0).toLocaleString('en-IN')}</td>
                              <td className="py-3 text-right font-mono text-emerald-600 font-semibold">{item.discount}%</td>
                              <td className="py-3 text-right font-mono font-bold text-slate-900">₹{Number(item.total || 0).toLocaleString('en-IN')}</td>
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
                      ₹{(quoteData?.lineItems || []).reduce((acc, curr) => acc + (curr.total || 0), 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Negotiation / Status History */}
                {quoteData?.negotiationHistory && quoteData.negotiationHistory.length > 0 && (
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
