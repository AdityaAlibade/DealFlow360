import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Package,
  Building2,
  AlertCircle,
  PlusCircle,
  RefreshCw,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import { fulfillmentAPI } from '../api/fulfillmentAPI';

const FulfillmentPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'backorders'
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [backorders, setBackorders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Restock Modal State
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [restockQuantity, setRestockQuantity] = useState(10);
  const [restockSubmitting, setRestockSubmitting] = useState(false);

  // Backorder Fulfill State
  const [fulfillingBackorderId, setFulfillingBackorderId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, whRes, boRes] = await Promise.all([
        fulfillmentAPI.getOrders(),
        fulfillmentAPI.getWarehouses(),
        fulfillmentAPI.getBackorders()
      ]);

      if (ordersRes?.data) setOrders(ordersRes.data);
      if (whRes?.data) setWarehouses(whRes.data);
      if (boRes?.data) setBackorders(boRes.data);
    } catch (err) {
      console.error('Failed to load fulfillment data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedWarehouseId || !selectedProductId || restockQuantity <= 0) return;

    try {
      setRestockSubmitting(true);
      await fulfillmentAPI.restockWarehouse(selectedWarehouseId, {
        productId: selectedProductId,
        quantity: parseInt(restockQuantity, 10),
        reason: 'Manual Inventory Restock'
      });
      setRestockModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to restock warehouse:', err);
      alert('Failed to restock warehouse stock.');
    } finally {
      setRestockSubmitting(false);
    }
  };

  const handleQuickFulfillBackorder = async (backorder) => {
    try {
      setFulfillingBackorderId(backorder.id);
      // Auto-assign to first warehouse with stock or BOM-1
      const defaultWh = warehouses[0]?.id;
      const allocation = (backorder.items || []).map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        warehouseId: defaultWh
      }));

      await fulfillmentAPI.fulfillBackorder(backorder.id, { allocations: allocation });
      fetchData();
    } catch (err) {
      console.error('Failed to fulfill backorder:', err);
      alert('Failed to fulfill backorder. Check warehouse stock availability.');
    } finally {
      setFulfillingBackorderId(null);
    }
  };

  // Flatten all inventory items across warehouses
  const allStockRows = warehouses.flatMap((wh) =>
    (wh.stockLevels || []).map((sl) => ({
      warehouseId: wh.id,
      warehouseCode: wh.code,
      warehouseName: wh.name,
      city: wh.city,
      productId: sl.productId,
      productName: sl.product?.name || 'Product',
      sku: sl.product?.sku || 'SKU',
      inStock: sl.inStock,
      reserved: sl.reserved,
      available: sl.available,
      incoming: sl.incoming || 0,
      backordered: sl.backordered || 0
    }))
  );

  // Metrics
  const totalWarehouses = warehouses.length;
  const totalAvailableStock = allStockRows.reduce((sum, r) => sum + r.available, 0);
  const activeOrdersCount = orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
  const activeBackordersCount = backorders.filter((b) => b.status === 'BACKORDERED' || b.status === 'PENDING').length;

  const getOrderStatusVariant = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'FULFILLED':
        return 'success';
      case 'DISPATCHED':
      case 'PARTIALLY_DISPATCHED':
        return 'info';
      case 'PARTIALLY_FULFILLED':
      case 'ALLOCATED':
        return 'primary';
      case 'BACKORDERED':
        return 'warning';
      case 'CANCELLED':
        return 'danger';
      default:
        return 'default';
    }
  };

  return (
    <MainLayout>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Multi-Warehouse Fulfillment</h1>
            <span className="bg-[#a459a8]/10 text-[#a459a8] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#a459a8]/20">
              Multi-Depot & Backorder Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time Indian regional logistics hubs, split shipment allocation, automated invoice generation, and backorder resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleRefresh}
            className={refreshing ? 'animate-spin' : ''}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => setRestockModalOpen(true)}
          >
            Restock Warehouse
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-purple-50 text-[#a459a8] rounded-xl border border-purple-100">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Warehouses</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalWarehouses} Regional Hubs</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Available Stock</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{totalAvailableStock} Units</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Orders in Pipeline</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{activeOrdersCount} Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Backorder Queue</p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{activeBackordersCount} Pending</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-[#a459a8] text-[#a459a8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          Customer Orders & Splits ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'inventory'
              ? 'border-[#a459a8] text-[#a459a8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Warehouse Inventories ({allStockRows.length})
        </button>

        <button
          onClick={() => setActiveTab('backorders')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'backorders'
              ? 'border-[#a459a8] text-[#a459a8]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Backorder Queue ({backorders.length})
        </button>
      </div>

      {/* Tab 1: Customer Orders */}
      {activeTab === 'orders' && (
        <Card
          title="Customer Orders & Warehouse Allocation Status"
          subtitle="Click on any order to view detailed multi-depot parcel splits, shipment tracking, and invoices"
        >
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading order fulfillment records...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No customer orders available.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-slate-50/75">
                    <th className="py-3 px-4 font-semibold">Order Ref</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Ordered Qty</th>
                    <th className="py-3 px-4 font-semibold">Warehouse Allocation Split</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((order) => {
                    const totalQty = (order.items || []).reduce((sum, item) => sum + item.quantity, 0);
                    const fulfillments = order.fulfillments || [];
                    const orderBackorders = order.backorders || [];

                    return (
                      <tr
                        key={order.id}
                        onClick={() => navigate(`/warehouses/${order.orderNumber}`)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#a459a8] flex items-center gap-1.5 group-hover:underline">
                          {order.orderNumber}
                          <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">{order.customer?.name || 'Customer'}</div>
                          <div className="text-xs text-slate-400">{order.customer?.city || 'India'}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                          {totalQty} Units
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5 items-center">
                            {fulfillments.length === 0 && orderBackorders.length === 0 && (
                              <span className="text-xs text-slate-400 italic">Pending Allocation</span>
                            )}
                            {fulfillments.map((f) => {
                              const units = (f.items || []).reduce((s, i) => s + i.quantity, 0);
                              return (
                                <span
                                  key={f.id}
                                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-[#a459a8] border border-purple-200"
                                >
                                  <Building2 className="w-3 h-3" />
                                  {f.warehouse?.code || 'WH'}: {units} units ({f.status})
                                </span>
                              );
                            })}
                            {orderBackorders.map((b) => (
                              <span
                                key={b.id}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200"
                              >
                                <Clock className="w-3 h-3" />
                                Backorder: {b.totalBackordered} units ({b.status})
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge variant={getOrderStatusVariant(order.status)}>
                            {order.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button size="xs" variant="secondary">
                            View Breakdown
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 2: Warehouse Inventories */}
      {activeTab === 'inventory' && (
        <Card
          title="Real-Time Warehouse Stock Availability"
          subtitle="Multi-depot stock on hand, reservations for pending orders, and restock levels"
        >
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading warehouse inventories...</div>
          ) : allStockRows.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No warehouse stock configured.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-slate-50/75">
                    <th className="py-3 px-4 font-semibold">Warehouse Hub</th>
                    <th className="py-3 px-4 font-semibold">Product Item</th>
                    <th className="py-3 px-4 font-semibold">In Stock</th>
                    <th className="py-3 px-4 font-semibold">Reserved</th>
                    <th className="py-3 px-4 font-semibold">Available for Orders</th>
                    <th className="py-3 px-4 font-semibold">Incoming</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allStockRows.map((stock, idx) => (
                    <tr key={`${stock.warehouseId}-${stock.productId}-${idx}`} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-[#a459a8]" />
                          {stock.warehouseName}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">Code: {stock.warehouseCode} &bull; {stock.city}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{stock.productName}</div>
                        <div className="text-xs text-slate-400 font-mono">SKU: {stock.sku}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {stock.inStock}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-amber-600">
                        {stock.reserved}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-mono font-bold px-2.5 py-1 rounded-md text-xs border ${
                          stock.available > 0
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                          {stock.available} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {stock.incoming}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="xs"
                          variant="secondary"
                          onClick={() => {
                            setSelectedWarehouseId(stock.warehouseId);
                            setSelectedProductId(stock.productId);
                            setRestockQuantity(10);
                            setRestockModalOpen(true);
                          }}
                        >
                          + Restock
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab 3: Backorder Queue */}
      {activeTab === 'backorders' && (
        <Card
          title="Active Backorder Resolution Queue"
          subtitle="Orders awaiting factory restocking. 1-click allocation automatically satisfies customer backorders when inventory arrives"
        >
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading backorder queue...</div>
          ) : backorders.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">No active backorders in queue. All orders are fully allocated.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase bg-slate-50/75">
                    <th className="py-3 px-4 font-semibold">Backorder Ref</th>
                    <th className="py-3 px-4 font-semibold">Parent Order</th>
                    <th className="py-3 px-4 font-semibold">Customer</th>
                    <th className="py-3 px-4 font-semibold">Backordered Items & Quantity</th>
                    <th className="py-3 px-4 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backorders.map((bo) => (
                    <tr key={bo.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                        {bo.backorderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => navigate(`/warehouses/${bo.order?.orderNumber || bo.orderId}`)}
                          className="font-mono font-bold text-[#a459a8] hover:underline flex items-center gap-1"
                        >
                          {bo.order?.orderNumber || 'Order'} <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {bo.order?.customer?.name || 'Customer'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          {(bo.items || []).map((item) => (
                            <div key={item.id} className="text-xs font-semibold text-slate-700">
                              {item.product?.name || 'Product'}: <span className="font-mono text-amber-700 font-bold">{item.quantity} units</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={bo.status === 'FULFILLED' ? 'success' : 'warning'}>
                          {bo.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {bo.status !== 'FULFILLED' && bo.status !== 'CANCELLED' ? (
                          <Button
                            size="xs"
                            variant="primary"
                            icon={Sparkles}
                            disabled={fulfillingBackorderId === bo.id}
                            onClick={() => handleQuickFulfillBackorder(bo)}
                          >
                            {fulfillingBackorderId === bo.id ? 'Allocating...' : 'Fulfill Backorder'}
                          </Button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-semibold">Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Restock Modal */}
      <Modal
        isOpen={restockModalOpen}
        onClose={() => setRestockModalOpen(false)}
        title="Restock Warehouse Inventory"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRestockModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleRestockSubmit}
              disabled={restockSubmitting || !selectedWarehouseId || !selectedProductId || restockQuantity <= 0}
            >
              {restockSubmitting ? 'Restocking...' : 'Confirm Restock'}
            </Button>
          </>
        }
      >
        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Destination Warehouse
            </label>
            <select
              value={selectedWarehouseId}
              onChange={(e) => setSelectedWarehouseId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#a459a8] bg-white"
              required
            >
              <option value="">-- Choose Warehouse --</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code} &bull; {w.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Product to Restock
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#a459a8] bg-white"
              required
            >
              <option value="">-- Choose Product --</option>
              {allStockRows
                .filter((v, i, a) => a.findIndex((t) => t.productId === v.productId) === i)
                .map((p) => (
                  <option key={p.productId} value={p.productId}>
                    {p.productName} ({p.sku})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Units to Add to Stock
            </label>
            <input
              type="number"
              min="1"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#a459a8]"
              placeholder="e.g. 20"
              required
            />
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
};

export default FulfillmentPage;
