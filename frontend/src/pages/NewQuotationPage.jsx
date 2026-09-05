import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Percent,
  Calculator,
  User,
  Package,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Inbox,
  ExternalLink,
  Info,
  RefreshCw
} from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import quotationAPI from '../api/quotationAPI';
import orderRequestAPI from '../api/orderRequestAPI';
import productAPI from '../api/productAPI';

const NewQuotationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const orderRequestId = searchParams.get('orderRequestId') || searchParams.get('requestId') || location.state?.orderRequestId;

  // Real Database Lists
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Order Request State
  const [sourceOrderRequest, setSourceOrderRequest] = useState(null);
  const [existingQuoteWarning, setExistingQuoteWarning] = useState(null);
  const [availableRequests, setAvailableRequests] = useState([]);
  const [loadingRequest, setLoadingRequest] = useState(false);

  // Quote Header State
  const [quoteNumber] = useState(`Q-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Line Items State
  const [items, setItems] = useState([]);

  // Form handling & UX state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // Selected customer object from real DB list
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // 1. Fetch Real Customers & Real Products from PostgreSQL
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        setLoadingInitial(true);
        const [custRes, prodRes] = await Promise.all([
          quotationAPI.getCustomers(),
          productAPI.getAll()
        ]);

        let loadedCustomers = [];
        let loadedProducts = [];

        if (custRes && custRes.data) {
          loadedCustomers = custRes.data;
          setCustomers(custRes.data);
        }

        if (prodRes && prodRes.data) {
          loadedProducts = prodRes.data;
          setProducts(prodRes.data);
        }

        // Set default item if none and not from request
        if (!orderRequestId && loadedProducts.length > 0 && items.length === 0) {
          const first = loadedProducts[0];
          setItems([
            {
              id: 1,
              productId: first.id,
              name: first.name,
              sku: first.sku,
              qty: 1,
              price: Number(first.basePrice || 0),
              standardCost: Number(first.standardCost || 0),
              discount: 0,
              allowedLimit: 15,
              taxRate: 18
            }
          ]);
        }
      } catch (err) {
        console.warn('Failed to fetch real customers or products:', err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadMasterData();
  }, [orderRequestId]);

  // 2. Fetch Available Order Requests if no request is selected
  useEffect(() => {
    const loadAvailableRequests = async () => {
      try {
        const res = await orderRequestAPI.getAll({ status: 'PENDING,UNDER_REVIEW' });
        if (res && res.data) {
          setAvailableRequests(res.data);
        }
      } catch (err) {
        console.error('Failed to load active order requests:', err);
      }
    };
    if (!orderRequestId) {
      loadAvailableRequests();
    }
  }, [orderRequestId]);

  // 3. Fetch Order Request Details if orderRequestId is supplied
  useEffect(() => {
    if (!orderRequestId) return;

    const loadOrderRequest = async () => {
      try {
        setLoadingRequest(true);
        const res = await orderRequestAPI.getById(orderRequestId);
        if (res && res.success && res.data) {
          const req = res.data;
          setSourceOrderRequest(req);

          // Check if active quote already exists
          if (req.quotations && req.quotations.length > 0) {
            setExistingQuoteWarning(req.quotations[0]);
          }

          // Pre-fill customer
          if (req.customerId) {
            setSelectedCustomerId(req.customerId);
          } else if (req.customer?.id) {
            setSelectedCustomerId(req.customer.id);
          }
          setCustomerName(req.customer?.name || req.customerName || 'Customer Account');
          setCustomerEmail(req.customer?.email || req.customerEmail || '');
          setNotes(`Created from Order Request #${req.requestNumber || req.id}. ${req.notes || ''}`);

          // Pre-fill line items from request
          if (req.items && req.items.length > 0) {
            const mappedItems = req.items.map((item, index) => {
              return {
                id: index + 1,
                productId: item.productId || item.product?.id,
                name: item.product?.name || item.productName || 'Product',
                sku: item.product?.sku || 'SKU',
                qty: item.quantity || 1,
                price: Number(item.targetPrice || item.product?.basePrice || 0),
                standardCost: Number(item.product?.standardCost || 0),
                discount: 0,
                allowedLimit: 15,
                taxRate: 18
              };
            });
            setItems(mappedItems);
          }
        }
      } catch (err) {
        console.error('Failed to load order request for quotation:', err);
        setSubmitError('Could not load original Order Request details.');
      } finally {
        setLoadingRequest(false);
      }
    };

    loadOrderRequest();
  }, [orderRequestId]);

  // Line item change handlers
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const item = { ...updated[index] };

    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      if (prod) {
        item.productId = prod.id;
        item.name = prod.name;
        item.sku = prod.sku;
        item.price = Number(prod.basePrice || 0);
        item.standardCost = Number(prod.standardCost || 0);
        item.taxRate = 18;
        item.allowedLimit = selectedCustomer ? Math.min(15, selectedCustomer.maxDiscount || 15) : 15;
      }
    } else if (field === 'qty') {
      item.qty = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === 'price') {
      item.price = Math.max(0, parseFloat(value) || 0);
    } else if (field === 'discount') {
      item.discount = Math.min(100, Math.max(0, parseFloat(value) || 0));
    }

    updated[index] = item;
    setItems(updated);
  };

  const handleAddItem = () => {
    const defaultProd = products[0] || { id: 'custom', name: 'Custom Product', sku: 'SKU-001', basePrice: 1000, standardCost: 700 };
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    setItems([
      ...items,
      {
        id: nextId,
        productId: defaultProd.id,
        name: defaultProd.name,
        sku: defaultProd.sku,
        qty: 1,
        price: Number(defaultProd.basePrice || 0),
        standardCost: Number(defaultProd.standardCost || 0),
        discount: 0,
        allowedLimit: selectedCustomer ? Math.min(15, selectedCustomer.maxDiscount || 15) : 15,
        taxRate: 18
      }
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      setSubmitError('Quotation must contain at least one line item.');
      return;
    }
    setItems(items.filter((_, i) => i !== index));
    setSubmitError('');
  };

  // Calculations
  const calculateLineMetrics = (item) => {
    const gross = (item.qty || 1) * (item.price || 0);
    const discountAmount = gross * ((item.discount || 0) / 100);
    const net = gross - discountAmount;
    const tax = net * ((item.taxRate || 18) / 100);
    const total = net + tax;
    const cost = (item.qty || 1) * (item.standardCost || 0);
    const profit = net - cost;
    const marginPercent = net > 0 ? (profit / net) * 100 : 0;
    const isOverLimit = (item.discount || 0) > (item.allowedLimit || 15);

    return { gross, discountAmount, net, tax, total, marginPercent, isOverLimit };
  };

  const subtotalGross = items.reduce((acc, it) => acc + (it.qty || 1) * (it.price || 0), 0);
  const totalDiscountAmount = items.reduce((acc, it) => acc + ((it.qty || 1) * (it.price || 0) * ((it.discount || 0) / 100)), 0);
  const netSubtotal = subtotalGross - totalDiscountAmount;
  const totalTaxAmount = items.reduce((acc, it) => {
    const net = (it.qty || 1) * (it.price || 0) * (1 - (it.discount || 0) / 100);
    return acc + net * ((it.taxRate || 18) / 100);
  }, 0);
  const grandTotal = netSubtotal + totalTaxAmount;
  const totalCost = items.reduce((acc, it) => acc + (it.qty || 1) * (it.standardCost || 0), 0);
  const blendedMargin = netSubtotal > 0 ? ((netSubtotal - totalCost) / netSubtotal) * 100 : 0;
  const anyOverLimit = items.some((it) => (it.discount || 0) > (it.allowedLimit || 15));

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!selectedCustomerId) {
      newErrors.customer = 'Please select a customer account.';
    }
    if (items.length === 0) {
      newErrors.items = 'At least one quotation product line is required.';
    }
    items.forEach((it, idx) => {
      if (!it.qty || it.qty <= 0) {
        newErrors[`qty_${idx}`] = 'Quantity must be > 0';
      }
      if (it.price < 0) {
        newErrors[`price_${idx}`] = 'Price must be non-negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        quoteNumber,
        productRequestId: sourceOrderRequest?.id || orderRequestId || undefined,
        customerId: selectedCustomerId,
        customerName: customerName || selectedCustomer?.name,
        customerEmail: customerEmail || selectedCustomer?.email,
        paymentTerms,
        validUntil,
        notes,
        subtotal: netSubtotal,
        totalDiscount: totalDiscountAmount,
        taxAmount: totalTaxAmount,
        totalAmount: grandTotal,
        blendedMargin: blendedMargin.toFixed(1),
        status: anyOverLimit ? 'PENDING_APPROVAL' : 'DRAFT',
        items: items.map((it) => {
          const metrics = calculateLineMetrics(it);
          return {
            productId: it.productId,
            name: it.name,
            sku: it.sku,
            quantity: Number(it.qty || 1),
            qty: Number(it.qty || 1),
            unitPrice: Number(it.price || 0),
            price: Number(it.price || 0),
            discountPercent: Number(it.discount || 0),
            discount: Number(it.discount || 0),
            taxRate: Number(it.taxRate || 18),
            netPrice: metrics.net,
            marginPercent: metrics.marginPercent.toFixed(1),
            isOverLimit: metrics.isOverLimit
          };
        })
      };

      const res = await quotationAPI.create(payload);

      if (res && res.alreadyExists && res.data) {
        setSubmitError(`An active quotation (${res.data.quoteNumber || res.data.id}) already exists for this Order Request.`);
        setTimeout(() => {
          navigate(`/quotations/${res.data.id}`);
        }, 2000);
        return;
      }

      setSubmitSuccess(
        `Quotation ${quoteNumber} created successfully in PostgreSQL! ${
          anyOverLimit ? 'Discount limits exceeded: Routed for Sales Manager Approval.' : 'Saved as Draft.'
        }`
      );

      setTimeout(() => {
        navigate('/quotations');
      }, 1600);
    } catch (err) {
      console.error('[Quotation Submit Error]', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to create quotation.';
      setSubmitError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(sourceOrderRequest ? `/order-requests/${sourceOrderRequest.id}` : '/order-requests')}
              className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Quotation</h1>
                <Badge variant="primary">{quoteNumber}</Badge>
                {anyOverLimit && (
                  <Badge variant="warning" dot>Approval Required</Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                CPQ Quote Governance Engine &bull; Automated pricing limits & margin analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/order-requests')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Save}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving Quote...' : 'Save Quotation'}
            </Button>
          </div>
        </div>

        {/* PROMINENT ORDER REQUEST RELATIONSHIP BANNER */}
        {sourceOrderRequest ? (
          <div className="p-4 bg-purple-50/90 border-2 border-purple-300/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#a459a8] text-white rounded-xl shadow-sm">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-purple-900">
                    Created From Order Request:
                  </span>
                  <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-md">
                    #{sourceOrderRequest.requestNumber || sourceOrderRequest.id}
                  </span>
                </div>
                <p className="text-[11px] text-purple-700 mt-0.5">
                  Customer: <span className="font-bold text-purple-900">{sourceOrderRequest.customer?.name || sourceOrderRequest.customerName}</span> &bull; {sourceOrderRequest.items?.length || 0} requested items automatically imported
                </p>
              </div>
            </div>
            <Link
              to={`/order-requests/${sourceOrderRequest.id}`}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 hover:underline"
            >
              View Original Request <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  Select an Inbound Order Request to Link
                </span>
                <p className="text-[11px] text-amber-700">
                  Standard CPQ workflow requires every quotation to originate from a Customer Order Request.
                </p>
              </div>
            </div>
            {availableRequests.length > 0 ? (
              <select
                onChange={(e) => {
                  if (e.target.value) navigate(`/quotations/new?orderRequestId=${e.target.value}`);
                }}
                className="text-xs bg-white border border-amber-300 rounded-xl px-3 py-2 font-semibold text-slate-800 focus:outline-none"
                defaultValue=""
              >
                <option value="" disabled>Link to Pending Request...</option>
                {availableRequests.map((r) => (
                  <option key={r.id} value={r.id}>
                    #{r.requestNumber || r.id} - {r.customer?.name || r.customerName}
                  </option>
                ))}
              </select>
            ) : (
              <Button
                variant="secondary"
                size="xs"
                icon={Inbox}
                onClick={() => navigate('/order-requests')}
              >
                Go to Order Requests
              </Button>
            )}
          </div>
        )}

        {/* Existing Quote Duplicate Warning */}
        {existingQuoteWarning && (
          <div className="p-4 bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-between gap-3 text-amber-900">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Active Quotation Already Exists: </span>
                <span>An active quotation #{existingQuoteWarning.quoteNumber || existingQuoteWarning.id} is already linked to this Order Request.</span>
              </div>
            </div>
            <Button
              variant="primary"
              size="xs"
              onClick={() => navigate(`/quotations/${existingQuoteWarning.id}`)}
            >
              Open Active Quote
            </Button>
          </div>
        )}

        {/* Success / Error Alerts */}
        {submitSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-semibold animate-in fade-in slide-in-from-top-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{submitSuccess}</span>
          </div>
        )}

        {submitError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-800 text-xs font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Two-Column Grid: Form Left, Summary Right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Left Section: Header Info & Line Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Configuration Card */}
            <Card title="Quotation Header & Customer" subtitle="Assign customer account and commercial terms">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Selector */}
                <div>
                  <Select
                    label="Customer Account"
                    required
                    name="customer"
                    value={selectedCustomerId}
                    onChange={(e) => {
                      setSelectedCustomerId(e.target.value);
                      const c = customers.find((cust) => cust.id === e.target.value);
                      if (c) {
                        setCustomerName(c.name);
                        setCustomerEmail(c.email);
                      }
                    }}
                    error={errors.customer}
                    placeholder={loadingInitial ? 'Loading customer accounts...' : 'Select Customer Account'}
                    options={customers.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.tier || 'STANDARD'} Tier - Max ${c.maxDiscount || 15}% Disc)`
                    }))}
                  />
                  {selectedCustomer && (
                    <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-800">{selectedCustomer.name}</span>
                        <span className="text-slate-400 ml-1.5">({selectedCustomer.email})</span>
                      </div>
                      <Badge variant={selectedCustomer.tier === 'GOLD' ? 'gold' : selectedCustomer.tier === 'SILVER' ? 'silver' : 'bronze'}>
                        {selectedCustomer.tier || 'STANDARD'} TIER
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Valid Until Date */}
                <div>
                  <Input
                    label="Valid Until (Expiry)"
                    type="date"
                    name="validUntil"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <Select
                    label="Payment Terms"
                    name="paymentTerms"
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    options={[
                      { value: 'Due on Receipt', label: 'Due on Receipt' },
                      { value: 'Net 15', label: 'Net 15 Days' },
                      { value: 'Net 30', label: 'Net 30 Days' },
                      { value: 'Net 60', label: 'Net 60 Days' }
                    ]}
                  />
                </div>

                {/* Internal Notes / Customer Reference */}
                <div>
                  <Input
                    label="Customer PO / Reference"
                    placeholder="e.g. PO-8921 / Enterprise Rollout"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Quotation Line Items Table */}
            <Card
              title="Quotation Products & Services"
              subtitle="Configure item quantities, unit prices, discounts, and real-time margin compliance"
              action={
                <Button variant="primary" size="sm" icon={Plus} onClick={handleAddItem}>
                  Add Product Line
                </Button>
              }
            >
              {errors.items && (
                <p className="text-xs text-red-500 font-medium mb-3">{errors.items}</p>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Product / Service</th>
                      <th className="py-2.5 px-2 w-20 text-center">Qty</th>
                      <th className="py-2.5 px-2 w-28 text-right">Unit Price</th>
                      <th className="py-2.5 px-2 w-28 text-center">Discount %</th>
                      <th className="py-2.5 px-2 w-28 text-right">Net Price</th>
                      <th className="py-2.5 px-2 w-24 text-center">Margin</th>
                      <th className="py-2.5 px-2 w-12 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, idx) => {
                      const metrics = calculateLineMetrics(item);
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Product Selection */}
                          <td className="py-3 px-3">
                            <select
                              value={item.productId}
                              onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                              className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#a459a8]"
                            >
                              {products.map((prod) => (
                                <option key={prod.id} value={prod.id}>
                                  {prod.name} ({prod.sku}) - ₹{Number(prod.basePrice || 0).toLocaleString('en-IN')}
                                </option>
                              ))}
                            </select>
                            <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                              SKU: {item.sku} &bull; Tax: {item.taxRate}%
                            </span>
                          </td>

                          {/* Quantity */}
                          <td className="py-3 px-2">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                              className="w-full text-center text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#a459a8]"
                            />
                            {errors[`qty_${idx}`] && (
                              <span className="text-[10px] text-red-500 block">{errors[`qty_${idx}`]}</span>
                            )}
                          </td>

                          {/* Unit Price */}
                          <td className="py-3 px-2">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1.5 text-slate-400 text-xs">₹</span>
                              <input
                                type="number"
                                min="0"
                                step="100"
                                value={item.price}
                                onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                                className="w-full text-right text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg pl-6 pr-2 py-1.5 focus:outline-none focus:border-[#a459a8]"
                              />
                            </div>
                          </td>

                          {/* Discount % with Limit Warning */}
                          <td className="py-3 px-2">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.5"
                                value={item.discount}
                                onChange={(e) => handleItemChange(idx, 'discount', e.target.value)}
                                className={`w-full text-center text-xs font-bold rounded-lg px-2 py-1.5 border focus:outline-none ${
                                  metrics.isOverLimit
                                    ? 'bg-red-50 border-red-300 text-red-700 focus:border-red-500'
                                    : 'bg-white border-slate-300 text-slate-800 focus:border-[#a459a8]'
                                }`}
                              />
                              <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">%</span>
                            </div>
                            <span className={`text-[10px] block mt-1 text-center font-medium ${
                              metrics.isOverLimit ? 'text-red-600 font-bold' : 'text-slate-400'
                            }`}>
                              Limit: {item.allowedLimit}%
                              {metrics.isOverLimit && ' ⚠️ Exceeded'}
                            </span>
                          </td>

                          {/* Net Price */}
                          <td className="py-3 px-2 text-right">
                            <span className="font-bold text-slate-900 text-xs">
                              ₹{metrics.net.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                            </span>
                            {metrics.discountAmount > 0 && (
                              <span className="text-[10px] text-emerald-600 block">
                                -₹{metrics.discountAmount.toLocaleString('en-IN')}
                              </span>
                            )}
                          </td>

                          {/* Margin % */}
                          <td className="py-3 px-2 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              metrics.marginPercent >= 25
                                ? 'bg-emerald-50 text-emerald-700'
                                : metrics.marginPercent >= 15
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {metrics.marginPercent.toFixed(1)}%
                            </span>
                          </td>

                          {/* Delete Item */}
                          <td className="py-3 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add line item quick footer button */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-[#a459a8] font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Another Product Line
                </button>
                <span className="text-xs text-slate-400">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in quotation
                </span>
              </div>
            </Card>
          </div>

          {/* Right Section: Commercial Summary & Governance Card */}
          <div className="space-y-6">
            <Card title="Commercial Summary" subtitle="Total pricing breakdown and tax calculation">
              <div className="space-y-3.5 text-xs">
                {/* Gross Subtotal */}
                <div className="flex justify-between items-center text-slate-600">
                  <span>Gross Subtotal</span>
                  <span className="font-semibold text-slate-800">
                    ₹{subtotalGross.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Total Discount */}
                <div className="flex justify-between items-center text-slate-600">
                  <span className="flex items-center gap-1">
                    Total Discounts
                  </span>
                  <span className="font-semibold text-emerald-600">
                    -₹{totalDiscountAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Net Subtotal */}
                <div className="flex justify-between items-center text-slate-700 pt-2 border-t border-slate-100">
                  <span className="font-medium">Net Price</span>
                  <span className="font-bold text-slate-900">
                    ₹{netSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Tax */}
                <div className="flex justify-between items-center text-slate-600">
                  <span>Estimated Tax (GST 18%)</span>
                  <span className="font-semibold text-slate-800">
                    +₹{totalTaxAmount.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-center pt-3 border-t-2 border-slate-200">
                  <span className="text-sm font-bold text-slate-900">Grand Total</span>
                  <span className="text-lg font-black text-[#a459a8]">
                    ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </Card>

            {/* Margin & Governance Risk Card */}
            <Card title="CPQ Deal Governance" subtitle="Automated discount threshold & margin audit">
              <div className="space-y-4 text-xs">
                {/* Blended Margin */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 block">Blended Deal Margin</span>
                    <span className="text-[11px] text-slate-500">Gross revenue vs standard product cost</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-black ${
                      blendedMargin >= 25 ? 'text-emerald-600' : blendedMargin >= 15 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {blendedMargin.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Governance Status */}
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                  anyOverLimit
                    ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}>
                  {anyOverLimit ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <span className="font-bold block">
                      {anyOverLimit ? 'Manager Approval Required' : 'Pre-Approved / Normal Governance'}
                    </span>
                    <p className="text-[11px] mt-0.5 leading-relaxed text-slate-600">
                      {anyOverLimit
                        ? 'One or more items exceed self-approval discount limits. Upon saving, this deal will be queued for Sales Manager sign-off.'
                        : 'All line item discounts are within allowed customer tier limits. This quotation can be dispatched directly.'}
                    </p>
                  </div>
                </div>

                {/* Save Button */}
                <Button
                  variant="primary"
                  size="md"
                  icon={Save}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? 'Creating Quotation...' : 'Create & Save Quotation'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewQuotationPage;
