import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Send,
  Plus,
  Trash2,
  AlertTriangle,
  ExternalLink,
  ShoppingBag,
  CheckCircle,
  XCircle,
  MessageSquare,
  Sparkles,
  Check,
  X,
  Inbox,
  Lock
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import productAPI from '../api/productAPI';
import quotationAPI from '../api/quotationAPI';
import { useAuth } from '../contexts/AuthContext';

const QuotationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const currentRole = (user?.role || role || '').toLowerCase().trim();
  const isReadOnly = currentRole !== 'sales_rep';

  const [quotation, setQuotation] = useState(null);
  const [products, setProducts] = useState([]);
  const [availableUpsells, setAvailableUpsells] = useState([]);

  const [customerRequests, setCustomerRequests] = useState([]);
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [acceptDiscount, setAcceptDiscount] = useState(10);
  const [feedbackToast, setFeedbackToast] = useState(null);

  const fetchQuotationData = async () => {
    try {
      if (!id) return;
      const res = await quotationAPI.getById(id);
      if (res && (res.data || res.id)) {
        const qData = res.data || res;
        setQuotation(qData);
        if (qData.items && qData.items.length > 0) {
          setProducts(qData.items.map((it, idx) => ({
            id: it.id || idx + 1,
            name: it.product?.name || it.name || 'Product',
            qty: it.quantity || it.qty || 1,
            price: Number(it.unitPrice || it.price || 0),
            discount: Number(it.discountPct || it.discount || 0),
            limit: 15,
            status: (it.discountPct || it.discount) > 15 ? 'OVER' : 'OK',
            statusType: (it.discountPct || it.discount) > 15 ? 'danger' : 'success'
          })));
        }
      }
    } catch (err) {
      console.warn('Could not fetch live quotation data from API:', err);
    }
  };

  const fetchCustomerRequests = async () => {
    try {
      const res = await productAPI.getAllCustomerRequests();
      if (res && res.data) {
        setCustomerRequests(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch customer product requests', err);
    }
  };

  const fetchCatalogUpsells = async () => {
    try {
      const res = await productAPI.getAll();
      const catalog = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setAvailableUpsells(catalog.slice(0, 4));
    } catch (err) {
      console.warn('Failed to load upsell catalog', err);
    }
  };

  useEffect(() => {
    fetchQuotationData();
    fetchCustomerRequests();
    fetchCatalogUpsells();
  }, [id]);

  const handleAcceptCustomerRequest = async (req) => {
    try {
      const res = await productAPI.acceptCustomerRequest(req.id, {
        salesRepName: user?.name || quotation?.salesRep?.fullName || 'Sales Representative',
        salesResponse: `Approved and added to quotation proposal at ${acceptDiscount}% standard discount.`,
        discountPct: acceptDiscount
      });

      // Add to local quotation lines
      const newLine = {
        id: Date.now(),
        name: req.productName,
        qty: req.quantity,
        price: req.unitPrice,
        discount: acceptDiscount,
        limit: 10,
        status: acceptDiscount > 10 ? 'OVER' : 'OK',
        statusType: acceptDiscount > 10 ? 'danger' : 'success',
        isCustomerRequested: true
      };

      setProducts((prev) => [...prev, newLine]);
      setFeedbackToast({
        type: 'success',
        text: `Accepted request ${req.id}! ${req.quantity}x ${req.productName} added to quotation lines.`
      });
      fetchCustomerRequests();
      setTimeout(() => setFeedbackToast(null), 6000);
    } catch (err) {
      setFeedbackToast({
        type: 'danger',
        text: err.message || 'Failed to accept request'
      });
    }
  };

  const handleRejectCustomerRequest = async () => {
    if (!rejectModalReq) return;
    try {
      await productAPI.rejectCustomerRequest(rejectModalReq.id, {
        salesRepName: user?.name || quotation?.salesRep?.fullName || 'Sales Representative',
        reason: rejectReason || 'Product currently unavailable for this quotation package.'
      });

      setFeedbackToast({
        type: 'info',
        text: `Rejected customer request ${rejectModalReq.id}.`
      });
      setRejectModalReq(null);
      setRejectReason('');
      fetchCustomerRequests();
      setTimeout(() => setFeedbackToast(null), 5000);
    } catch (err) {
      setFeedbackToast({
        type: 'danger',
        text: err.message || 'Failed to reject request'
      });
    }
  };

  const handleAddUpsell = (item) => {
    const newItem = {
      id: Date.now(),
      name: item.name,
      qty: 1,
      price: Number(item.price || item.basePrice || 0),
      discount: 5,
      limit: 15,
      status: 'OK',
      statusType: 'success'
    };
    setProducts([...products, newItem]);
  };

  const handleRemoveProduct = (prodId) => {
    setProducts(products.filter((p) => p.id !== prodId));
  };

  // Calculations
  const subtotal = products.reduce((acc, p) => acc + p.qty * p.price, 0);
  const totalDiscount = products.reduce((acc, p) => acc + (p.qty * p.price * p.discount) / 100, 0);
  const tax = (subtotal - totalDiscount) * 0.18;
  const total = subtotal - totalDiscount + tax;
  const hasRisk = products.some((p) => p.discount > p.limit);

  const pendingRequests = customerRequests.filter((r) => r.status === 'PENDING');

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quotations')}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                Quotation Detail: <span className="text-[#a459a8]">{quotation?.id || id || 'Draft'}</span>
              </h1>
              <Badge variant="warning" dot>{quotation?.status || 'Draft'}</Badge>
              {pendingRequests.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-extrabold flex items-center gap-1 animate-pulse">
                  <ShoppingBag className="w-3 h-3 text-[#a459a8]" /> {pendingRequests.length} Customer Product Request(s)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Customer: {quotation?.customer?.companyName || quotation?.customer?.name || (typeof quotation?.customer === 'string' ? quotation.customer : 'Account')} &bull; Assigned Rep: {user?.name || quotation?.salesRep?.fullName || (typeof quotation?.salesRep === 'string' ? quotation.salesRep : 'Sales Representative')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={ExternalLink}
            onClick={() => navigate(quotation ? `/customer-portal/${quotation.id}` : '/quotations')}
          >
            View Customer Portal
          </Button>
          {!isReadOnly ? (
            <>
              <Button variant="secondary" size="sm" icon={Save}>
                Save Draft
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={Send}
                onClick={() => navigate('/approvals/Q-1042')}
              >
                Submit for Approval
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Read-Only Quotation View</span>
            </div>
          )}
        </div>
      </div>

      {/* Created From Order Request Banner */}
      {(quotation?.productRequest || quotation?.productRequestId) && (
        <div className="p-4 bg-purple-50/90 border-2 border-purple-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#a459a8] text-white rounded-xl shadow-sm">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                  Created From Order Request:
                </span>
                <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                  #{quotation.productRequest?.requestNumber || quotation.productRequestId}
                </span>
              </div>
              <p className="text-[11px] text-purple-700 mt-0.5">
                This commercial proposal is bound to customer requirement #{quotation.productRequest?.requestNumber || quotation.productRequestId}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/order-requests/${quotation.productRequestId || quotation.productRequest?.id}`)}
            className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
          >
            View Original Order Request <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {feedbackToast && (
        <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between shadow-sm ${
          feedbackToast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-blue-50 border-blue-200 text-blue-900'
        }`}>
          <span>{feedbackToast.text}</span>
          <button onClick={() => setFeedbackToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalReq && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Reject Customer Product Request</h3>
            <p className="text-xs text-slate-600">
              You are rejecting <span className="font-bold text-slate-800">{rejectModalReq.quantity}x {rejectModalReq.productName}</span> requested by <span className="font-semibold">{rejectModalReq.customerName}</span>.
            </p>
            <div>
              <label className="text-xs font-semibold text-slate-700">Rejection Reason / Customer Note:</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Product currently unavailable or incompatible with selected deployment plan..."
                className="w-full mt-1 p-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#a459a8]/30 focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setRejectModalReq(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" onClick={handleRejectCustomerRequest}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Product Requests Review Panel */}
      {customerRequests.length > 0 && (
        <Card
          title="Customer Product Requests"
          subtitle="Products selected and requested by customer through their secure portal"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold uppercase">
                  <th className="px-3 py-2.5 text-left">Req ID</th>
                  <th className="px-3 py-2.5 text-left">Customer</th>
                  <th className="px-3 py-2.5 text-left">Product Requested</th>
                  <th className="px-3 py-2.5 text-center">Qty</th>
                  <th className="px-3 py-2.5 text-left">Customer Note</th>
                  <th className="px-3 py-2.5 text-center">Status</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerRequests.map((req) => (
                  <tr key={req.id} className={req.status === 'PENDING' ? 'bg-purple-50/40 font-medium' : 'hover:bg-slate-50/50'}>
                    <td className="px-3 py-3 font-mono font-bold text-[#a459a8]">{req.id}</td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{req.customerName}</td>
                    <td className="px-3 py-3 font-bold text-slate-900">{req.productName}</td>
                    <td className="px-3 py-3 text-center font-mono font-bold">{req.quantity}</td>
                    <td className="px-3 py-3 text-slate-600 max-w-xs truncate" title={req.message}>{req.message}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge variant={req.status === 'ACCEPTED' ? 'success' : req.status === 'REJECTED' ? 'danger' : 'warning'} dot>
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {req.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleAcceptCustomerRequest(req)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1 transition-all"
                          >
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button
                            onClick={() => setRejectModalReq(req)}
                            className="px-2 py-1 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-lg font-bold text-[11px] border border-slate-200 transition-all"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">Reviewed by {req.reviewedBy || 'Sales'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Customer Info Card */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Customer</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-bold text-slate-800">
                {quotation?.customer?.companyName || quotation?.customer?.name || (typeof quotation?.customer === 'string' ? quotation.customer : 'Account')}
              </span>
              <Badge variant="gold">{quotation?.customer?.tier || quotation?.tier || 'STANDARD'} Tier</Badge>
            </div>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Contact Person</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {quotation?.customer?.name || quotation?.contactPerson || 'Procurement'}
            </p>
            <p className="text-slate-500 text-[11px]">{quotation?.customer?.email || quotation?.customerEmail || 'contact@client.com'}</p>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Portal Link</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">{quotation ? 'Token Active' : 'Not Generated'}</p>
            {quotation && (
              <a href={`/customer-portal/${quotation.id}`} target="_blank" rel="noreferrer" className="text-[#a459a8] font-bold text-[11px] hover:underline flex items-center gap-1">
                /customer-portal/{quotation.id} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Assigned Sales Rep</span>
            <p className="text-sm font-semibold text-slate-800 mt-1">
              {quotation?.salesRep?.fullName || quotation?.salesRep?.name || (typeof quotation?.salesRep === 'string' ? quotation.salesRep : user?.name || 'Sales Representative')}
            </p>
            <p className="text-slate-500 text-[11px]">Commercial Operations</p>
          </div>
        </div>
      </Card>

      {/* Main Grid: Products Table + Upsell Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Products Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Quotation Line Items"
            subtitle="Configure quantity, base price and discount margins"
            action={
              <Button size="sm" variant="outline" icon={Plus}>
                Add Custom Line
              </Button>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider">
                    <th className="px-3 py-2.5 text-left">Product</th>
                    <th className="px-3 py-2.5 text-center">Qty</th>
                    <th className="px-3 py-2.5 text-right">Price</th>
                    <th className="px-3 py-2.5 text-center">Discount %</th>
                    <th className="px-3 py-2.5 text-center">Limit</th>
                    <th className="px-3 py-2.5 text-center">Status</th>
                    <th className="px-3 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                        No line items in this quotation yet.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => {
                    const isOver = p.discount > p.limit;
                    return (
                      <tr key={p.id} className={isOver ? 'bg-red-50/40' : 'hover:bg-slate-50/50'}>
                        <td className="px-3 py-3 font-semibold text-slate-800">
                          {p.name}
                          {p.isCustomerRequested && (
                            <span className="ml-2 px-1.5 py-0.2 bg-purple-100 text-[#a459a8] rounded text-[9px] font-bold">
                              From Customer Request
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center font-mono font-medium">{p.qty}</td>
                        <td className="px-3 py-3 text-right font-mono font-medium">₹{Number(p.price).toLocaleString('en-IN')}</td>
                        <td className="px-3 py-3 text-center">
                          <span className={`font-mono font-bold ${isOver ? 'text-red-600' : 'text-slate-700'}`}>
                            {p.discount}%
                          </span>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-500 font-mono">{p.limit}%</td>
                        <td className="px-3 py-3 text-center">
                          {isOver ? (
                            <Badge variant="danger" className="text-[10px]">
                              ⚠️ OVER (+{p.discount - p.limit}pt)
                            </Badge>
                          ) : (
                            <Badge variant="success" className="text-[10px]">
                              ✅ OK
                            </Badge>
                          )}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            onClick={() => handleRemoveProduct(p.id)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
                </tbody>
              </table>
            </div>

            {hasRisk && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-bold">Approval Requirement Triggered:</span> Line item discount exceeds standard 10% limit. Requires Sales Manager sign-off.
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right 1 Column: Upsell Panel */}
        <div className="space-y-6">
          <Card
            title="Recommended Add-ons"
            subtitle="Catalog add-ons available for deal expansion"
          >
            <div className="space-y-3">
              {availableUpsells.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No catalog add-ons available.</p>
              ) : (
                availableUpsells.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 hover:bg-purple-50/40 border border-slate-200 rounded-xl transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="primary" className="text-[9px] py-0">{item.category || 'CATALOG'}</Badge>
                        <h4 className="text-xs font-bold text-slate-800 mt-1">{item.name}</h4>
                      </div>
                      <span className="text-xs font-bold text-slate-900">₹{Number(item.price || item.basePrice || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-emerald-600 font-semibold">SKU: {item.sku || 'N/A'}</span>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Plus}
                        onClick={() => handleAddUpsell(item)}
                        className="py-1 px-2 text-[11px] bg-[#a459a8]"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Summary Footer Card */}
      <Card title="Quotation Financial Summary">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Financial Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Gross Subtotal:</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-600 font-medium">
              <span>Total Discount Applied:</span>
              <span>-₹{totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">GST / Tax (18%):</span>
              <span className="font-semibold text-slate-800">₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="flex justify-between py-2 text-sm font-extrabold text-slate-900">
              <span>Net Payable Total:</span>
              <span className="text-base text-[#a459a8]">₹{total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
            </div>
          </div>

          {/* Center: Margin Analysis */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700">Calculated Deal Margin:</span>
              <span className="font-bold text-emerald-600 text-sm">
                {subtotal > 0 ? `${Math.max(0, Math.round(((subtotal - totalDiscount) / subtotal) * 100))}%` : '0%'}
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${subtotal > 0 ? Math.min(100, Math.max(0, Math.round(((subtotal - totalDiscount) / subtotal) * 100))) : 0}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">Target threshold is 25%. This quote is computed from live line item discount margins.</p>
          </div>

          {/* Right: Risk & Status */}
          <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#a459a8]">Approval Governance</span>
              <p className="text-xs font-semibold text-slate-800 mt-1">Status: {quotation?.status || 'Draft'}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Commercial discount governance governed by backend policy.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Send}
              onClick={() => navigate('/approvals')}
              className="mt-3 w-full bg-[#a459a8]"
            >
              View Approvals
            </Button>
          </div>
        </div>
      </Card>
    </MainLayout>
  );
};

export default QuotationDetailPage;
