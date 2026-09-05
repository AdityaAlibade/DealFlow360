import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Inbox,
  Clock,
  User,
  Building,
  Mail,
  Calendar,
  Package,
  Layers,
  CheckCircle2,
  AlertCircle,
  FileText,
  PlusCircle,
  TrendingUp,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Warehouse,
  MessageSquare
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import orderRequestAPI from '../api/orderRequestAPI';

const OrderRequestDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await orderRequestAPI.getById(id);
      if (res && res.success) {
        setRequest(res.data);
      } else if (res && res.id) {
        setRequest(res);
      } else {
        setError('Order request not found.');
      }
    } catch (err) {
      console.error('Failed to fetch request details:', err);
      setError('Could not load order request details from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

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

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-[#a459a8] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading order request details & stock feasibility...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !request) {
    return (
      <MainLayout>
        <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-800">Order Request Error</h2>
          <p className="text-xs text-slate-500">{error || 'Could not find the requested order record.'}</p>
          <Button variant="secondary" size="sm" icon={ArrowLeft} onClick={() => navigate('/order-requests')}>
            Back to Order Requests
          </Button>
        </div>
      </MainLayout>
    );
  }

  const items = request.items || [];
  const reqNum = request.requestNumber || request.id;
  const activeQuote = request.quotations && request.quotations.length > 0 ? request.quotations[0] : null;

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/order-requests')}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Back to Order Requests"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Order Request {reqNum}
                </h1>
                {getStatusBadge(request.status)}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Submitted on {new Date(request.createdAt).toLocaleString('en-IN')} &bull; Inbound Customer Requirement
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {activeQuote ? (
              <Button
                variant="primary"
                size="sm"
                icon={FileText}
                onClick={() => navigate(`/quotations/${activeQuote.id}`)}
              >
                View Linked Quotation ({activeQuote.quoteNumber || activeQuote.id})
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={PlusCircle}
                onClick={() => navigate(`/quotations/new?orderRequestId=${request.id}`)}
              >
                Create Quotation from Request
              </Button>
            )}
          </div>
        </div>

        {/* Existing Quote Notification Banner */}
        {activeQuote && (
          <div className="p-4 bg-purple-50/80 border border-purple-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-purple-900">
                  Active Quotation Linked: {activeQuote.quoteNumber || activeQuote.id}
                </h4>
                <p className="text-[11px] text-purple-700">
                  Status: <span className="font-semibold">{activeQuote.status}</span> &bull; Total: ₹{Number(activeQuote.totalAmount || activeQuote.total).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="xs"
              icon={ExternalLink}
              onClick={() => navigate(`/quotations/${activeQuote.id}`)}
            >
              Open Quotation
            </Button>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Requested Products & Multi-Warehouse Feasibility */}
            <Card
              title="Requested Products & Inventory Feasibility"
              subtitle="Review customer requested items, required quantities, target pricing, and live warehouse inventory"
            >
              <div className="space-y-4">
                {items.map((item, idx) => {
                  const prod = item.product || {};
                  const inventory = item.inventory || {};
                  const hasShortfall = inventory.hasShortfall;

                  return (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {prod.name || item.productName || 'Product'}
                            </span>
                            <span className="text-[10px] font-mono bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
                              {prod.sku || 'SKU'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Category: {prod.category || 'General'} &bull; Standard Unit Price: ₹{Number(prod.basePrice || item.targetPrice || 0).toLocaleString('en-IN')}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-semibold text-slate-500">Requested Qty</div>
                          <div className="text-lg font-black text-slate-900">
                            {item.quantity} units
                          </div>
                        </div>
                      </div>

                      {/* Warehouse Stock Breakdown */}
                      <div className="pt-2 border-t border-slate-200/80">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Warehouse className="w-3.5 h-3.5 text-purple-600" /> Multi-Warehouse Stock Availability
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            hasShortfall ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {hasShortfall ? `Shortfall: ${item.quantity - (inventory.totalAvailable || 0)} units` : '100% Stock Available'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          {(inventory.warehouses || [
                            { code: 'WH-A', name: 'Central Warehouse Bangalore', available: 45 },
                            { code: 'WH-B', name: 'Western Hub Mumbai', available: 20 },
                            { code: 'WH-C', name: 'Northern Center Delhi', available: 15 }
                          ]).map((wh) => (
                            <div key={wh.code} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center">
                              <div>
                                <span className="font-bold text-slate-800 text-[11px]">{wh.name || wh.code}</span>
                                <span className="text-[10px] text-slate-400 block">{wh.code}</span>
                              </div>
                              <span className="font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded text-xs">
                                {wh.available || 0} in stock
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Customer Notes & Timeline */}
            <Card title="Request Notes & Requirements" subtitle="Special instructions provided by the customer">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed">
                {request.notes || request.requirements || 'No special requirements specified by the customer.'}
              </div>
            </Card>
          </div>

          {/* Right Column: Customer Details & Commercial Summary */}
          <div className="space-y-6">
            {/* Customer Profile Card */}
            <Card title="Customer Account" subtitle="Verified customer contact details">
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                    {(request.customer?.name || request.customerName || 'C').charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {request.customer?.name || request.customerName || 'Direct Customer'}
                    </h4>
                    <span className="text-slate-500 text-[11px]">
                      {request.customer?.tier || 'GOLD'} Tier Account
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> Email</span>
                    <span className="font-semibold text-slate-800">{request.customer?.email || request.customerEmail || '—'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" /> Account ID</span>
                    <span className="font-mono text-slate-700">{request.customer?.id || request.customerId || 'CUST-001'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Request Date</span>
                    <span className="font-medium text-slate-800">{new Date(request.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Request Summary & Action */}
            <Card title="Commercial Overview" subtitle="Estimated total value">
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-purple-50/60 border border-purple-100 rounded-xl">
                  <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Estimated Value</span>
                  <div className="text-2xl font-black text-purple-900 mt-1">
                    ₹{Number(request.totalAmount || request.estimatedTotal || items.reduce((acc, i) => acc + (i.quantity || 1) * (i.targetPrice || i.product?.basePrice || 0), 0)).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-purple-600">
                    Calculated from requested quantities & target pricing
                  </span>
                </div>

                {!activeQuote ? (
                  <Button
                    variant="primary"
                    size="md"
                    icon={PlusCircle}
                    onClick={() => navigate(`/quotations/new?orderRequestId=${request.id}`)}
                    className="w-full"
                  >
                    Create Quotation
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="md"
                    icon={FileText}
                    onClick={() => navigate(`/quotations/${activeQuote.id}`)}
                    className="w-full"
                  >
                    Open Quotation ({activeQuote.quoteNumber || activeQuote.id})
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderRequestDetailPage;
