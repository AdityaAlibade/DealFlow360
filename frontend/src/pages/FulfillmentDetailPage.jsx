import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Building2,
  Truck,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import { fulfillmentAPI } from '../api/fulfillmentAPI';
import { useAuth } from '../contexts/AuthContext';

const FulfillmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const currentRole = (user?.role || role || '').toLowerCase().trim();
  const isReadOnly = currentRole === 'sales_rep' || currentRole === 'admin';

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Dispatch Modal State
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedFulfillment, setSelectedFulfillment] = useState(null);
  const [carrier, setCarrier] = useState('BlueDart Express');
  const [trackingNumber, setTrackingNumber] = useState('');

  // Allocation Modal State
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [allocations, setAllocations] = useState([]);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fulfillmentAPI.getOrderSummary(id);
      if (res?.data) {
        setSummary(res.data);
      } else {
        setError('Order not found or no summary available.');
      }
    } catch (err) {
      console.error('Failed to load order fulfillment summary:', err);
      setError('Failed to load order fulfillment details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const loadWarehousesForAllocation = async () => {
    try {
      const res = await fulfillmentAPI.getWarehouses();
      if (res?.data) {
        setWarehouses(res.data);
        // Prepare default allocation row for each order item
        const initial = (summary?.order?.items || []).map((item) => ({
          productId: item.productId,
          productName: item.product?.name,
          totalQty: item.quantity,
          splits: (res.data || []).map((w) => ({
            warehouseId: w.id,
            warehouseName: w.name,
            warehouseCode: w.code,
            quantity: 0
          }))
        }));
        setAllocations(initial);
        setAllocateModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to load warehouses for allocation:', err);
    }
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFulfillment) return;

    try {
      setActionLoading(true);
      await fulfillmentAPI.dispatchFulfillment(selectedFulfillment.id, {
        carrier: carrier || 'BlueDart Logistics',
        trackingNumber: trackingNumber || `TRK-IN-${Math.floor(100000 + Math.random() * 900000)}`
      });
      setDispatchModalOpen(false);
      fetchOrderDetails();
    } catch (err) {
      console.error('Dispatch failed:', err);
      alert('Failed to dispatch fulfillment shipment.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeliver = async (fulfillmentId) => {
    try {
      setActionLoading(true);
      await fulfillmentAPI.deliverFulfillment(fulfillmentId);
      fetchOrderDetails();
    } catch (err) {
      console.error('Delivery failed:', err);
      alert('Failed to mark shipment as delivered.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFulfillBackorder = async (backorderId) => {
    try {
      setActionLoading(true);
      // Auto-fulfill from first available warehouse or BOM-1
      const defaultWh = summary?.warehouses?.[0]?.id || warehouses[0]?.id;
      await fulfillmentAPI.fulfillBackorder(backorderId, { defaultWarehouseId: defaultWh });
      fetchOrderDetails();
    } catch (err) {
      console.error('Backorder fulfillment failed:', err);
      alert('Failed to fulfill backorder. Check if warehouse has sufficient stock.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualAllocationSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      // Flatten split inputs into allocation list
      const formatted = [];
      allocations.forEach((itemAlloc) => {
        itemAlloc.splits.forEach((s) => {
          if (parseInt(s.quantity, 10) > 0) {
            formatted.push({
              productId: itemAlloc.productId,
              warehouseId: s.warehouseId,
              quantity: parseInt(s.quantity, 10)
            });
          }
        });
      });

      if (formatted.length === 0) {
        alert('Please specify at least one warehouse quantity allocation.');
        return;
      }

      await fulfillmentAPI.allocateOrder(summary.order.id, formatted);
      setAllocateModalOpen(false);
      fetchOrderDetails();
    } catch (err) {
      console.error('Allocation failed:', err);
      alert('Failed to allocate order to warehouses.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-24 text-center">
          <RefreshCw className="w-8 h-8 text-[#a459a8] animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading multi-warehouse fulfillment details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !summary?.order) {
    return (
      <MainLayout>
        <div className="py-16 text-center space-y-4">
          <p className="text-sm text-red-600 font-semibold">{error || 'Order not found'}</p>
          <Button variant="secondary" onClick={() => navigate('/warehouses')} icon={ArrowLeft}>
            Back to Warehouses
          </Button>
        </div>
      </MainLayout>
    );
  }

  const { order, progress, fulfillments = [], backorders = [], invoices = [] } = summary;

  return (
    <MainLayout>
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/warehouses')}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            title="Back to Warehouses"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Order <span className="text-[#a459a8]">{order.orderNumber}</span>
              </h1>
              <Badge variant={order.status === 'DELIVERED' || order.status === 'FULFILLED' ? 'success' : 'primary'}>
                {order.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Customer: <span className="font-semibold text-slate-700">{order.customer?.name}</span> ({order.customer?.city || 'India'})
              {order.quotation && (
                <> &bull; Quotation Ref: <span className="font-mono text-[#a459a8] font-bold">{order.quotation.quotationNumber}</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" size="sm" icon={RefreshCw} onClick={fetchOrderDetails}>
            Refresh
          </Button>
          {!isReadOnly ? (
            fulfillments.length === 0 && (
              <Button variant="primary" size="sm" icon={Sparkles} onClick={loadWarehousesForAllocation}>
                Allocate to Warehouses
              </Button>
            )
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Read-Only Logistics</span>
            </div>
          )}
        </div>
      </div>

      {/* Order Progress Summary Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs text-slate-400 font-semibold uppercase">Total Ordered</span>
              <p className="text-xl font-extrabold text-slate-800 font-mono mt-0.5">{progress.orderedQty} Units</p>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl border border-purple-100">
              <span className="text-xs text-[#a459a8] font-semibold uppercase">Allocated</span>
              <p className="text-xl font-extrabold text-[#a459a8] font-mono mt-0.5">{progress.allocatedQty} Units</p>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span className="text-xs text-blue-600 font-semibold uppercase">Dispatched</span>
              <p className="text-xl font-extrabold text-blue-700 font-mono mt-0.5">{progress.dispatchedQty} Units</p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-xs text-emerald-600 font-semibold uppercase">Delivered</span>
              <p className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">{progress.deliveredQty} Units</p>
            </div>
          </div>

          <div className="p-4 bg-slate-900 text-white rounded-xl min-w-[200px] text-right">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total Order Value</span>
            <p className="text-xl font-extrabold text-purple-300 font-mono mt-0.5">{formatCurrency(order.totalAmount)}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">GST Included (18%)</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Overall Fulfillment Progress</span>
            <span>{progress.fulfillmentPercentage}% Complete</span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(progress.deliveredQty / (progress.orderedQty || 1)) * 100}%` }}
              title={`Delivered: ${progress.deliveredQty} units`}
            />
            <div
              className="bg-sky-500 h-full transition-all duration-500"
              style={{ width: `${((progress.dispatchedQty - progress.deliveredQty) / (progress.orderedQty || 1)) * 100}%` }}
              title={`In Transit: ${progress.dispatchedQty - progress.deliveredQty} units`}
            />
            <div
              className="bg-[#a459a8] h-full transition-all duration-500"
              style={{ width: `${((progress.allocatedQty - progress.dispatchedQty) / (progress.orderedQty || 1)) * 100}%` }}
              title={`Allocated: ${progress.allocatedQty - progress.dispatchedQty} units`}
            />
          </div>
        </div>
      </div>

      {/* Warehouse Shipment Split Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#a459a8]" />
            Independent Regional Warehouse Shipments ({fulfillments.length})
          </h2>
          <span className="text-xs text-slate-500">Each shipment is independently dispatched, tracked, and invoiced</span>
        </div>

        {fulfillments.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <Package className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">No warehouse shipments allocated yet.</p>
            <Button variant="primary" size="sm" icon={Sparkles} onClick={loadWarehousesForAllocation}>
              Auto-Allocate Order Across Hubs
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {fulfillments.map((f, index) => {
              const fUnits = (f.items || []).reduce((s, i) => s + i.quantity, 0);
              const isAllocated = f.status === 'ALLOCATED';
              const isDispatched = f.status === 'DISPATCHED';
              const isDelivered = f.status === 'DELIVERED';

              // Find associated invoice
              const matchingInvoice = invoices.find((inv) => inv.warehouseId === f.warehouseId || inv.fulfillmentId === f.id);

              return (
                <div
                  key={f.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4 hover:border-purple-200 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Warehouse Card Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-purple-100 text-[#a459a8] font-bold text-xs flex items-center justify-center">
                            #{index + 1}
                          </span>
                          <h3 className="font-bold text-slate-900 text-base">{f.warehouse?.name}</h3>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Hub Code: <span className="font-bold text-slate-600">{f.warehouse?.code}</span> &bull; {f.warehouse?.city}
                        </p>
                      </div>
                      <Badge variant={isDelivered ? 'success' : isDispatched ? 'info' : 'primary'}>
                        {f.status}
                      </Badge>
                    </div>

                    {/* Allocated Items List */}
                    <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Allocated Line Items</span>
                      {(f.items || []).map((fi) => (
                        <div key={fi.id} className="flex justify-between items-center text-xs">
                          <span className="font-semibold text-slate-800">{fi.product?.name || 'Product'}</span>
                          <span className="font-mono font-bold text-purple-700 bg-purple-100/60 px-2 py-0.5 rounded">
                            {fi.quantity} Units
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Tracking Information */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fulfillment ID:</span>
                        <span className="font-mono text-slate-700">{f.fulfillmentNumber || f.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Logistics Carrier:</span>
                        <span className="font-semibold text-slate-800">{f.carrier || 'Pending Dispatch'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tracking Number:</span>
                        <span className="font-mono font-bold text-[#a459a8]">{f.trackingNumber || 'Not assigned'}</span>
                      </div>
                    </div>

                    {/* Associated Invoice Badge */}
                    {matchingInvoice && (
                      <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <div>
                            <span className="font-semibold text-emerald-900 font-mono">{matchingInvoice.invoiceNumber}</span>
                            <span className="text-emerald-700 text-[11px] block">{formatCurrency(matchingInvoice.totalAmount)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/invoices`)}
                          className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline text-[11px]"
                        >
                          View Invoice <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-700">{fUnits} Units Allocated</span>
                    <div className="flex items-center gap-2">
                      {!isReadOnly && isAllocated && (
                        <Button
                          size="xs"
                          variant="primary"
                          icon={Truck}
                          disabled={actionLoading}
                          onClick={() => {
                            setSelectedFulfillment(f);
                            setTrackingNumber(`TRK-${f.warehouse?.code || 'IN'}-${Math.floor(100000 + Math.random() * 900000)}`);
                            setDispatchModalOpen(true);
                          }}
                        >
                          Dispatch Shipment
                        </Button>
                      )}

                      {!isReadOnly && isDispatched && (
                        <Button
                          size="xs"
                          variant="success"
                          icon={CheckCircle2}
                          disabled={actionLoading}
                          onClick={() => handleDeliver(f.id)}
                        >
                          Mark as Delivered
                        </Button>
                      )}

                      {isDelivered && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Delivered & Reconciled
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Linked Backorders Section (If Any) */}
      {backorders.length > 0 && (
        <Card className="bg-amber-50/60 border-amber-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-700" />
                <h3 className="text-sm font-bold text-amber-900">Active Order Backorders ({backorders.length})</h3>
              </div>
              <span className="text-xs text-amber-700">Units awaiting warehouse stock replenishment</span>
            </div>

            <div className="divide-y divide-amber-200/60">
              {backorders.map((bo) => (
                <div key={bo.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-900">{bo.backorderNumber}</span>
                      <Badge variant={bo.status === 'FULFILLED' ? 'success' : 'warning'}>{bo.status}</Badge>
                    </div>
                    <div className="text-xs text-amber-800 mt-1">
                      Backordered Items: {bo.totalBackordered} Units
                      {(bo.items || []).map((bi) => (
                        <span key={bi.id} className="ml-2 font-mono font-bold">
                          ({bi.product?.name}: {bi.quantity} units)
                        </span>
                      ))}
                    </div>
                  </div>

                  {bo.status !== 'FULFILLED' && bo.status !== 'CANCELLED' && (
                    <Button
                      size="xs"
                      variant="primary"
                      icon={Sparkles}
                      disabled={actionLoading}
                      onClick={() => handleFulfillBackorder(bo.id)}
                    >
                      Fulfill Backorder from Stock
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Dispatch Shipment Modal */}
      <Modal
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        title={`Dispatch Shipment: ${selectedFulfillment?.warehouse?.name}`}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDispatchModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleDispatchSubmit} disabled={actionLoading}>
              {actionLoading ? 'Dispatching...' : 'Confirm Dispatch & Deduct Stock'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleDispatchSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 text-slate-600">
            <p>
              <strong>Fulfillment ID:</strong> {selectedFulfillment?.fulfillmentNumber}
            </p>
            <p>
              <strong>Warehouse Hub:</strong> {selectedFulfillment?.warehouse?.name} ({selectedFulfillment?.warehouse?.city})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Logistics Carrier
            </label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#a459a8] bg-white"
            >
              <option value="BlueDart Express">BlueDart Express (Air)</option>
              <option value="Delhivery Surface">Delhivery Surface Logistics</option>
              <option value="DTDC Express Cargo">DTDC Express Cargo</option>
              <option value="Gati KWE Logistics">Gati KWE Logistics</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Waybill / Tracking Number
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#a459a8]"
              placeholder="e.g. TRK-IN-889412"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Manual Warehouse Split Allocation Modal */}
      <Modal
        isOpen={allocateModalOpen}
        onClose={() => setAllocateModalOpen(false)}
        title="Multi-Warehouse Order Allocation"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAllocateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleManualAllocationSubmit} disabled={actionLoading}>
              {actionLoading ? 'Allocating...' : 'Confirm Multi-Warehouse Split'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleManualAllocationSubmit} className="space-y-4">
          <p className="text-xs text-slate-500">
            Specify how many units of each product should be fulfilled from each regional warehouse hub. Any unallocated balance will automatically be placed into the Backorder Queue.
          </p>

          {allocations.map((itemAlloc, itemIdx) => (
            <div key={itemAlloc.productId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-sm font-bold text-slate-800">
                <span>{itemAlloc.productName}</span>
                <span className="font-mono text-[#a459a8]">Ordered: {itemAlloc.totalQty} Units</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {itemAlloc.splits.map((split, sIdx) => (
                  <div key={split.warehouseId} className="bg-white p-2.5 rounded-lg border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {split.warehouseName} ({split.warehouseCode})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={itemAlloc.totalQty}
                      value={split.quantity}
                      onChange={(e) => {
                        const updated = [...allocations];
                        updated[itemIdx].splits[sIdx].quantity = e.target.value;
                        setAllocations(updated);
                      }}
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-slate-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </form>
      </Modal>
    </MainLayout>
  );
};

export default FulfillmentDetailPage;
