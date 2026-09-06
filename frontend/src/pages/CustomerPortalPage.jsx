import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Send,
  Sparkles,
  AlertCircle,
  Clock,
  Check,
  ShoppingBag,
  ShoppingCart,
  FileText,
  ListOrdered,
  Search,
  Plus,
  Minus,
  XCircle,
  CheckCircle,
  Info,
  ArrowRight,
  LogOut,
  Trash2,
  PackagePlus,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  Save,
  Truck
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import customerPortalAPI from '../api/customerPortalAPI';

const CustomerPortalPage = () => {
  const { token: routeToken } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const token = routeToken || user?.portalToken || user?.email || user?.id || 'demo-token-123';

  // Active Tab: 'catalog' | 'cart' | 'requests' | 'profile'
  const [activeTab, setActiveTab] = useState('catalog');
  const [requestsSubTab, setRequestsSubTab] = useState('all'); // 'all' | 'products' | 'orders'

  const [products, setProducts] = useState([]);
  const [productRequests, setProductRequests] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Customer Profile State (Self-Editing)
  const [profileData, setProfileData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    billingAddress: '',
    shippingAddress: '',
    tier: 'BRONZE'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Cart State (Interactive Cart & Request Builder)
  const [cartItems, setCartItems] = useState([]);
  const [cartNotes, setCartNotes] = useState('');
  const [isSubmittingCart, setIsSubmittingCart] = useState(false);

  // Manual Item Adder Form State
  const [manualProduct, setManualProduct] = useState('');
  const [manualQty, setManualQty] = useState(1);
  const [manualTargetPrice, setManualTargetPrice] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Catalog filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [catalogQuantities, setCatalogQuantities] = useState({});
  const [catalogMessages, setCatalogMessages] = useState({});
  const [submittingRequestId, setSubmittingRequestId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const categories = ['All', 'Hardware', 'Services', 'Software & Cloud', 'Warranty & SLA', 'Accessories'];

  const refreshAllData = async () => {
    try {
      const [pRes, reqRes, profRes] = await Promise.all([
        customerPortalAPI.getProducts(token, { search: searchQuery, category: selectedCategory }),
        customerPortalAPI.getProductRequests(token),
        customerPortalAPI.getProfile(token).catch(() => null)
      ]);

      if (pRes) {
        const productList = Array.isArray(pRes.data) ? pRes.data : Array.isArray(pRes) ? pRes : [];
        setProducts(productList);
        const initialQty = {};
        productList.forEach((p) => {
          initialQty[p.id] = initialQty[p.id] || 1;
        });
        setCatalogQuantities((prev) => ({ ...initialQty, ...prev }));
      }

      if (reqRes) {
        if (reqRes.data && typeof reqRes.data === 'object' && !Array.isArray(reqRes.data)) {
          setProductRequests(reqRes.data.productRequests || []);
          setOrdersList(reqRes.data.orders || []);
        } else if (Array.isArray(reqRes.data)) {
          setProductRequests(reqRes.data);
        } else if (Array.isArray(reqRes)) {
          setProductRequests(reqRes);
        }
      }

      if (profRes?.data) {
        setProfileData({
          name: profRes.data.name || user?.fullName || '',
          companyName: profRes.data.companyName || user?.companyName || 'Enterprise Partner',
          email: profRes.data.email || user?.email || '',
          phone: profRes.data.phone || user?.phone || '',
          billingAddress: profRes.data.billingAddress || '',
          shippingAddress: profRes.data.shippingAddress || '',
          tier: profRes.data.tier || 'BRONZE'
        });
      }
    } catch (err) {
      setError(err.message || 'Error loading customer portal session.');
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
    if (!loading) {
      fetchCatalog();
    }
  }, [searchQuery, selectedCategory]);

  // Catalog Quantity Adjuster
  const handleCatalogQtyChange = (productId, delta) => {
    setCatalogQuantities((prev) => {
      const current = prev[productId] !== undefined ? prev[productId] : 1;
      const next = Math.max(1, Math.min(50, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  const handleDirectCatalogQtyChange = (productId, value) => {
    if (value === '') {
      setCatalogQuantities((prev) => ({ ...prev, [productId]: 1 }));
      return;
    }
    const parsed = parseInt(value, 10);
    const next = isNaN(parsed) ? 1 : Math.max(1, Math.min(50, parsed));
    setCatalogQuantities((prev) => ({ ...prev, [productId]: next }));
  };

  // -------------------------------------------------------------
  // CART OPERATIONS
  // -------------------------------------------------------------
  const addToCart = (product, quantity = 1, customTargetPrice = null, notes = '') => {
    const targetPrice = customTargetPrice !== null && customTargetPrice !== '' && Number(customTargetPrice) >= 0
      ? Number(customTargetPrice)
      : Number(product.basePrice ?? product.price ?? product.unitPrice ?? 0);

    setCartItems((prev) => {
      const existingIdx = prev.findIndex((item) => item.productId === product.id);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        if (notes) updated[existingIdx].notes = notes;
        if (customTargetPrice !== null) updated[existingIdx].targetPrice = targetPrice;
        return updated;
      } else {
        return [
          ...prev,
          {
            productId: product.id,
            sku: product.sku || `SKU-${product.id}`,
            name: product.name,
            category: product.category || 'General',
            unitPrice: Number(product.basePrice ?? product.price ?? 0),
            targetPrice,
            quantity,
            notes: notes || ''
          }
        ];
      }
    });

    setToastMessage({
      type: 'success',
      text: `Added ${quantity}x ${product.name} to Cart!`
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const updateCartItemQty = (productId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const updateCartItemNotes = (productId, notes) => {
    setCartItems((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, notes } : item))
    );
  };

  const updateCartItemTargetPrice = (productId, targetPrice) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId ? { ...item, targetPrice: Number(targetPrice) || 0 } : item
      )
    );
  };

  const removeCartItem = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setCartNotes('');
  };

  // Add Item Manually Handler
  const handleAddManualItem = (e) => {
    e.preventDefault();
    if (!manualProduct) {
      setError('Please select a product from the catalog to add.');
      return;
    }

    const selectedProd = products.find((p) => p.id === manualProduct || p.sku === manualProduct);
    if (!selectedProd) {
      setError('Selected product not found in catalog.');
      return;
    }

    const qty = Math.max(1, Number(manualQty) || 1);
    addToCart(selectedProd, qty, manualTargetPrice || null, manualNotes);

    // Reset manual form
    setManualProduct('');
    setManualQty(1);
    setManualTargetPrice('');
    setManualNotes('');
    setError(null);
  };

  // Cart Calculations
  const cartSubtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * (item.targetPrice || item.unitPrice || 0),
    0
  );
  const cartTax = Math.round(cartSubtotal * 0.18);
  const cartTotalWithTax = cartSubtotal + cartTax;
  const totalCartUnits = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Submit Cart Order Request
  const handleConfirmCartRequest = async () => {
    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items before submitting an order request.');
      return;
    }

    setIsSubmittingCart(true);
    setError(null);

    try {
      const requestPayload = {
        notes: cartNotes || `Order request with ${totalCartUnits} total items from Customer Cart.`,
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          targetPrice: item.targetPrice,
          notes: item.notes || null
        }))
      };

      const res = await customerPortalAPI.createProductRequest(token, requestPayload);

      setToastMessage({
        type: 'success',
        text: `Order request #${res.data?.requestNumber || 'submitted'} confirmed! Sent directly to your Sales Representative.`
      });

      // Clear Cart
      clearCart();

      // Refresh Data & Switch to Requests Tab
      await refreshAllData();
      setActiveTab('requests');
      setRequestsSubTab('products');

      setTimeout(() => setToastMessage(null), 6000);
    } catch (err) {
      setError(err.message || 'Failed to submit order request from cart.');
    } finally {
      setIsSubmittingCart(false);
    }
  };

  // Single Item Direct Request from Catalog
  const handleRequestProductDirect = async (product) => {
    const qty = catalogQuantities[product.id] !== undefined ? catalogQuantities[product.id] : 1;
    if (qty <= 0) {
      setError('Please select a quantity greater than 0 before submitting a request.');
      return;
    }
    setSubmittingRequestId(product.id);
    setError(null);
    try {
      const msg = catalogMessages[product.id] || `Please include ${qty}x ${product.name} in our active quotation proposal.`;

      await customerPortalAPI.createProductRequest(token, {
        productId: product.id,
        quantity: qty,
        message: msg
      });

      setToastMessage({
        type: 'success',
        text: `Product request for ${qty}x ${product.name} sent to your Sales Representative and added to My Requests!`
      });

      setCatalogMessages((prev) => ({ ...prev, [product.id]: '' }));
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

  // Profile Save Handler (Customer edits their own fields)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setError(null);
    try {
      const res = await customerPortalAPI.updateProfile(token, profileData);
      setToastMessage({
        type: 'success',
        text: 'Your company details and billing profile have been updated in PostgreSQL!'
      });
      if (res.data) {
        setProfileData((prev) => ({ ...prev, ...res.data }));
      }
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update company profile');
    } finally {
      setIsSavingProfile(false);
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Header (Isolated Customer Portal Layout) */}
      <header className="bg-white border-b border-slate-200 px-6 md:px-12 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm sticky top-0 z-30">
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
                Verified Account
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {profileData.companyName || 'Enterprise Buyer'} &bull; Contact: <span className="font-semibold text-slate-800">{profileData.name || user?.fullName || 'Procurement Officer'}</span>
            </p>
          </div>
        </div>

        {/* Portal Section Navigation Tabs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
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
              onClick={() => setActiveTab('cart')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
                activeTab === 'cart'
                  ? 'bg-[#a459a8] text-white shadow-sm'
                  : cartItems.length > 0
                  ? 'bg-purple-50 text-[#a459a8] border border-purple-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Order Cart</span>
              {cartItems.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold ${
                  activeTab === 'cart' ? 'bg-white text-[#a459a8]' : 'bg-[#a459a8] text-white'
                }`}>
                  {cartItems.length}
                </span>
              )}
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
              <span>My Requests & Orders</span>
              {(productRequests.length + ordersList.length) > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-[#a459a8] text-white rounded-full text-[9px] font-extrabold">
                  {productRequests.length + ordersList.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-[#a459a8] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>My Company Profile</span>
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
                    Enterprise Products & Services Catalog
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Browse eligible hardware, enterprise cloud platforms, and 24/7 SLA plans. Add items to your Order Cart to build a customized quote request.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('cart')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-[#a459a8] border border-purple-200 text-xs font-bold hover:bg-purple-100 transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>View Cart ({cartItems.length} items)</span>
                  </button>
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
                const qty = catalogQuantities[p.id] !== undefined ? catalogQuantities[p.id] : 1;
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
                          <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-base font-extrabold text-[#a459a8] font-mono">₹{productPrice.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] text-slate-400">{p.unit || 'unit'}</p>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.description}</p>
                    </div>

                    {/* Quantity & Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700">Select Quantity:</span>
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => handleCatalogQtyChange(p.id, -1)}
                            disabled={qty <= 1}
                            className="w-7 h-7 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center font-bold text-xs transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={qty}
                            onChange={(e) => handleDirectCatalogQtyChange(p.id, e.target.value)}
                            className="w-10 text-center text-xs font-bold font-mono text-slate-800 bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-[#a459a8] rounded"
                          />
                          <button
                            type="button"
                            onClick={() => handleCatalogQtyChange(p.id, 1)}
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
                          placeholder="Optional specifications / requirements for this item..."
                          value={catalogMessages[p.id] || ''}
                          onChange={(e) => setCatalogMessages({ ...catalogMessages, [p.id]: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-[11px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#a459a8]"
                        />
                      </div>

                      {/* Action Buttons: Add to Cart & Direct Request */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={ShoppingCart}
                          onClick={() => addToCart(p, qty, null, catalogMessages[p.id] || '')}
                          className="w-full py-2 text-xs font-bold border-[#a459a8] text-[#a459a8] hover:bg-purple-50"
                        >
                          Add to Cart
                        </Button>

                        <Button
                          variant="primary"
                          size="sm"
                          icon={Send}
                          disabled={isSubmitting || qty <= 0}
                          onClick={() => handleRequestProductDirect(p)}
                          className="w-full py-2 text-xs font-bold bg-[#a459a8] hover:bg-[#924b96] text-white"
                        >
                          {isSubmitting ? 'Requesting...' : `Request Direct`}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================
            TAB 2: ORDER CART & MANUAL ITEM ADDER
        =================================================== */}
        {activeTab === 'cart' && (
          <div className="space-y-6">
            {/* Header Banner */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#a459a8]" />
                  Interactive Order Request Cart
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Add items manually or from the catalog, specify custom quantities and target prices, then submit your order request for sales confirmation.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  icon={ShoppingBag}
                  onClick={() => setActiveTab('catalog')}
                >
                  Browse Catalog
                </Button>
                {cartItems.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={Trash2}
                    onClick={clearCart}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Clear Cart
                  </Button>
                )}
              </div>
            </div>

            {/* Manual Item Adder Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <PackagePlus className="w-4 h-4 text-[#a459a8]" />
                <h3 className="text-sm font-bold text-slate-900">Add Item Manually to Cart</h3>
                <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-semibold ml-auto">
                  Custom Specification
                </span>
              </div>

              <form onSubmit={handleAddManualItem} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* Product Selector */}
                <div className="md:col-span-4">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Select Product *</label>
                  <select
                    value={manualProduct}
                    onChange={(e) => {
                      setManualProduct(e.target.value);
                      const p = products.find((prod) => prod.id === e.target.value);
                      if (p) setManualTargetPrice(String(p.basePrice || p.price || ''));
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
                    required
                  >
                    <option value="">-- Choose from Master Catalog --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{Number(p.basePrice || p.price || 0).toLocaleString('en-IN')}) - {p.category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Quantity *</label>
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setManualQty((prev) => Math.max(1, prev - 1))}
                      className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={manualQty}
                      onChange={(e) => setManualQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-full text-center text-xs font-bold font-mono bg-transparent border-0 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setManualQty((prev) => prev + 1)}
                      className="w-6 h-6 rounded bg-white text-slate-700 hover:bg-slate-200 flex items-center justify-center font-bold text-xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Target Price */}
                <div className="md:col-span-3">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Target Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Standard base price"
                    value={manualTargetPrice}
                    onChange={(e) => setManualTargetPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8] font-mono"
                  />
                </div>

                {/* Submit Add */}
                <div className="md:col-span-3">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Plus}
                    className="w-full py-2 text-xs font-bold bg-[#a459a8] hover:bg-[#924b96]"
                  >
                    Add to Cart
                  </Button>
                </div>

                {/* Line Item Notes */}
                <div className="md:col-span-12 pt-1">
                  <input
                    type="text"
                    placeholder="Optional item specifications (e.g. 32GB RAM upgrade, onsite SLA, delivery window)..."
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full px-3 py-1.5 text-[11px] border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
                  />
                </div>
              </form>
            </div>

            {/* Cart Table & Checkout Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cart Line Items (2 Cols) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      Cart Line Items ({cartItems.length})
                    </h3>
                    <span className="text-xs text-slate-500">
                      Total Units: <span className="font-bold text-slate-800">{totalCartUnits}</span>
                    </span>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="py-12 text-center space-y-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">Your Cart is Currently Empty</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Add items using the manual form above or browse our catalog to assemble your customized enterprise quote request.
                      </p>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={ShoppingBag}
                        onClick={() => setActiveTab('catalog')}
                        className="mt-2 bg-[#a459a8] hover:bg-[#924b96]"
                      >
                        Explore Products Catalog
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {cartItems.map((item, idx) => {
                        const lineTotal = item.quantity * (item.targetPrice || item.unitPrice || 0);
                        return (
                          <div
                            key={item.productId || idx}
                            className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#a459a8]/40 transition-all space-y-3"
                          >
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="primary" className="text-[9px]">{item.category}</Badge>
                                  <span className="text-xs font-mono font-bold text-slate-400">{item.sku}</span>
                                </div>
                                <h4 className="text-sm font-bold text-slate-900 mt-1">{item.name}</h4>
                              </div>

                              <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                                <span className="text-base font-extrabold text-[#a459a8] font-mono">
                                  ₹{lineTotal.toLocaleString('en-IN')}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  (₹{Number(item.targetPrice || item.unitPrice).toLocaleString('en-IN')} / unit)
                                </span>
                              </div>
                            </div>

                            {/* Quantity & Target Price & Remove */}
                            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                              {/* Quantity Stepper */}
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-slate-600">Qty:</span>
                                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => updateCartItemQty(item.productId, -1)}
                                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="w-8 text-center font-mono font-bold text-xs text-slate-800">
                                    {item.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => updateCartItemQty(item.productId, 1)}
                                    className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Custom Target Price Input */}
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-semibold text-slate-600">Target ₹:</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={item.targetPrice}
                                  onChange={(e) => updateCartItemTargetPrice(item.productId, e.target.value)}
                                  className="w-24 px-2 py-1 text-xs border border-slate-200 rounded bg-white font-mono focus:outline-none focus:border-[#a459a8]"
                                />
                              </div>

                              {/* Remove Item */}
                              <button
                                type="button"
                                onClick={() => removeCartItem(item.productId)}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors inline-flex items-center gap-1 text-[11px] font-semibold ml-auto"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Remove
                              </button>
                            </div>

                            {/* Line Note */}
                            <div>
                              <input
                                type="text"
                                placeholder="Add specific delivery or configuration notes for this item..."
                                value={item.notes || ''}
                                onChange={(e) => updateCartItemNotes(item.productId, e.target.value)}
                                className="w-full px-2.5 py-1 text-[11px] border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#a459a8]"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Cart Summary & Confirm Button (1 Col) */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#a459a8]" />
                    Order Request Summary
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Items Count:</span>
                      <span className="font-mono font-bold text-slate-800">{cartItems.length} items ({totalCartUnits} units)</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Estimated Subtotal:</span>
                      <span className="font-mono font-bold text-slate-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Estimated GST (18%):</span>
                      <span className="font-mono font-bold text-slate-700">₹{cartTax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="font-bold text-slate-900 uppercase">Estimated Total:</span>
                      <span className="text-lg font-extrabold text-[#a459a8] font-mono">
                        ₹{cartTotalWithTax.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* General Order Notes */}
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      General Request Notes / Delivery Instructions:
                    </label>
                    <textarea
                      rows={3}
                      value={cartNotes}
                      onChange={(e) => setCartNotes(e.target.value)}
                      placeholder="Specify company PO reference, required delivery timelines, or payment term preferences..."
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
                    />
                  </div>

                  {/* Primary Confirm & Submit Button */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      icon={Send}
                      disabled={cartItems.length === 0 || isSubmittingCart}
                      onClick={handleConfirmCartRequest}
                      className="w-full py-2.5 text-xs font-bold bg-[#a459a8] hover:bg-[#924b96] shadow-md shadow-[#a459a8]/20"
                    >
                      {isSubmittingCart ? 'Submitting Order Request...' : 'Confirm & Submit Order Request'}
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center mt-2">
                      Submitting creates a live Order Request in PostgreSQL routed to your assigned Sales Rep.
                    </p>
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-purple-900 font-bold">
                    <Sparkles className="w-4 h-4 text-[#a459a8]" />
                    <span>How Order Requests Work</span>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    Once submitted, your Sales Representative receives the itemized list, reviews margin limits, applies enterprise volume discounts, and generates a formal Quotation Proposal for your review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            TAB 3: MY REQUESTS & CONFIRMED ORDERS
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
                    Track the live review status of your order requests and confirmed orders.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={ShoppingCart}
                    onClick={() => setActiveTab('cart')}
                    className="bg-[#a459a8] hover:bg-[#924b96]"
                  >
                    Open Cart ({cartItems.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    icon={ShoppingBag}
                    onClick={() => setActiveTab('catalog')}
                  >
                    Browse Catalog
                  </Button>
                </div>
              </div>

              {/* Sub-Tabs: All | Product Requests | Orders */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setRequestsSubTab('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    requestsSubTab === 'all'
                      ? 'bg-[#a459a8] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Activity ({productRequests.length + ordersList.length})
                </button>

                <button
                  onClick={() => setRequestsSubTab('products')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    requestsSubTab === 'products'
                      ? 'bg-[#a459a8] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>Order Requests</span>
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

              {/* 1. PRODUCT & BUNDLE REQUESTS SECTION */}
              {(requestsSubTab === 'all' || requestsSubTab === 'products') && (
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#a459a8]" />
                      Submitted Order Requests ({productRequests.length})
                    </h3>
                  </div>

                  {productRequests.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No order requests submitted yet. Use the Order Cart or browse the Catalog to create requests.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-xs">
                        <thead>
                          <tr className="text-slate-500 font-semibold uppercase bg-slate-50/70">
                            <th className="py-2.5 px-3 text-left">Request ID</th>
                            <th className="py-2.5 px-3 text-left">Product / Scope</th>
                            <th className="py-2.5 px-3 text-center">Qty</th>
                            <th className="py-2.5 px-3 text-right">Unit Price</th>
                            <th className="py-2.5 px-3 text-right">Est. Total Value</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                            <th className="py-2.5 px-3 text-left">Sales Representative</th>
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
                                <td className="py-3 px-3 text-slate-700 font-medium">
                                  {req.assignedSalesRep?.name || req.assignedSalesRep?.fullName || 'Assigned Sales Rep'}
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
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">&bull; In Review</span>
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

              {/* 2. CONFIRMED ORDERS & SHIPMENTS SECTION */}
              {(requestsSubTab === 'all' || requestsSubTab === 'orders') && (
                <div className="pt-4 space-y-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#a459a8]" />
                      Confirmed Orders & Delivery Tracking ({ordersList.length})
                    </h3>
                  </div>

                  {ordersList.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No confirmed orders found. Once your quotation requests are approved, your orders and warehouse delivery tracking will appear here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {ordersList.map((ord) => {
                        let badgeVariant = 'warning';
                        if (ord.status === 'COMPLETED' || ord.status === 'FULFILLED') badgeVariant = 'success';
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
                              <span className="text-emerald-700 font-bold">{ord.fulfillmentCount || 1} Shipments Dispatched</span>
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
            TAB 4: MY COMPANY PROFILE & SELF-EDITING (NEW)
        =================================================== */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                    <Building className="w-5 h-5 text-[#a459a8]" />
                    Enterprise Account & Profile Settings
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage and update your company details, primary procurement contacts, billing information, and default delivery addresses.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={profileData.tier === 'GOLD' ? 'warning' : profileData.tier === 'SILVER' ? 'primary' : 'secondary'}>
                    Customer Tier: {profileData.tier}
                  </Badge>
                </div>
              </div>

              {/* Profile Edit Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Primary Contact Person *
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" /> Enterprise Company Name *
                    </label>
                    <input
                      type="text"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" /> Procurement Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-100 text-slate-500 font-mono cursor-not-allowed"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Email is your unique portal login identifier.</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+91 98200 12345"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> Corporate Billing Address
                    </label>
                    <textarea
                      rows={2}
                      value={profileData.billingAddress}
                      onChange={(e) => setProfileData({ ...profileData, billingAddress: e.target.value })}
                      placeholder="e.g. 42 Cyber City, Magarpatta, Pune, MH 411028"
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-slate-400" /> Default Warehouse Shipping Address
                    </label>
                    <textarea
                      rows={2}
                      value={profileData.shippingAddress}
                      onChange={(e) => setProfileData({ ...profileData, shippingAddress: e.target.value })}
                      placeholder="e.g. Warehouse Bay 4, Logistics Park, Bengaluru, KA 560100"
                      className="w-full p-2.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#a459a8]"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    icon={Save}
                    disabled={isSavingProfile}
                    className="py-2.5 px-6 font-bold bg-[#a459a8] hover:bg-[#924b96] text-white shadow-md shadow-[#a459a8]/20"
                  >
                    {isSavingProfile ? 'Saving Changes...' : 'Save Profile Changes'}
                  </Button>
                </div>
              </form>
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
