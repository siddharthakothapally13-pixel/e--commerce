import React, { useState, useEffect } from 'react';
import { Package, Search, Clock, CheckCircle2, Truck, Box, MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function OrderTracking({ selectedOrderNumber }) {
  const { user, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState(selectedOrderNumber || '');
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const statusSteps = ['Placed', 'Processing', 'Shipped', 'Delivered'];

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  useEffect(() => {
    if (selectedOrderNumber) {
      setSearchQuery(selectedOrderNumber);
      handleSearchOrder(selectedOrderNumber);
    }
  }, [selectedOrderNumber]);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('thiranex_token');
      const res = await fetch('/api/orders/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        if (data.length > 0 && !activeOrder) {
          setActiveOrder(data[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchOrder = async (ordNum) => {
    const query = ordNum || searchQuery;
    if (!query) return;

    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('thiranex_token');
      const res = await fetch(`/api/orders/${query.trim()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Order not found');
      }

      const orderData = await res.json();
      setActiveOrder(orderData);
    } catch (err) {
      setError(err.message);
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto pb-16">
      {/* Header & Search */}
      <div className="glass-panel p-8 text-center space-y-4 border-indigo-500/20">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center">
          <Package className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-white">Order Tracking & Fulfillment</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Enter your order tracking number (e.g., <span className="text-indigo-400 font-mono">ORD-664638</span>) to view real-time shipping and delivery updates.
        </p>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchOrder();
          }}
          className="flex max-w-md mx-auto gap-2 mt-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Order # (ORD-XXXXXX)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 text-xs py-3 font-mono"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary text-xs px-5">
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>
      </div>

      {/* User Session Warning */}
      {!user && (
        <div className="glass-panel p-4 flex items-center justify-between bg-amber-950/20 border-amber-500/30">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-amber-200">
              Sign in to view your complete order history and save tracking details.
            </span>
          </div>
          <button onClick={openAuthModal} className="btn-secondary text-xs py-1.5 px-3">
            Sign In
          </button>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-panel p-6 text-center text-red-400 text-xs font-medium space-y-2">
          <p>{error}</p>
          <p className="text-slate-500">Please check your order number or log in to view your account orders.</p>
        </div>
      )}

      {/* User Orders List Tabs if Logged In */}
      {user && orders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Recent Orders</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {orders.map((ord) => (
              <button
                key={ord.id}
                onClick={() => setActiveOrder(ord)}
                className={`p-3.5 rounded-xl border text-left min-w-[200px] transition-all ${
                  activeOrder?.id === ord.id
                    ? 'border-indigo-500 bg-indigo-600/10 text-white'
                    : 'border-white/5 bg-slate-900/60 text-slate-400 hover:border-white/10'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono text-xs font-bold text-indigo-300">{ord.order_number}</span>
                  <span className={`badge ${
                    ord.status === 'Delivered' ? 'badge-success' : 'badge-amber'
                  } text-[9px] py-0 px-1.5`}>
                    {ord.status}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 block">
                  {new Date(ord.created_at).toLocaleDateString()} • ${parseFloat(ord.total_amount).toFixed(2)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Order Detailed View */}
      {activeOrder && (
        <div className="glass-panel p-6 sm:p-8 space-y-8 animate-fade-in border-indigo-500/30">
          {/* Order Info Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold font-heading text-white">Order {activeOrder.order_number}</h2>
                <span className={`badge ${
                  activeOrder.status === 'Delivered'
                    ? 'badge-success'
                    : activeOrder.status === 'Shipped'
                    ? 'badge-primary'
                    : 'badge-amber'
                }`}>
                  {activeOrder.status}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Placed on {new Date(activeOrder.created_at).toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Total Amount Paid</span>
              <span className="text-2xl font-extrabold font-heading text-indigo-400">
                ${parseFloat(activeOrder.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Visual Order Progress Bar */}
          <div className="space-y-4 py-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fulfillment Progress</h3>
            <div className="relative flex items-center justify-between max-w-3xl mx-auto px-4">
              {/* Progress Line */}
              <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
                  style={{
                    width: `${(getStepIndex(activeOrder.status) / (statusSteps.length - 1)) * 100}%`
                  }}
                />
              </div>

              {/* Status Nodes */}
              {statusSteps.map((step, idx) => {
                const currentIdx = getStepIndex(activeOrder.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 ring-4 ring-slate-950'
                          : 'bg-slate-800 text-slate-500 ring-4 ring-slate-950'
                      }`}
                    >
                      {idx === 0 && <Box className="w-4 h-4" />}
                      {idx === 1 && <Clock className="w-4 h-4" />}
                      {idx === 2 && <Truck className="w-4 h-4" />}
                      {idx === 3 && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        isCurrent ? 'text-indigo-400 font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Details & Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
            {/* Delivery Address */}
            <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Shipping Destination
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {activeOrder.shipping_address}
              </p>
            </div>

            {/* Payment Info */}
            <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Details</span>
              <p className="text-xs text-slate-200 font-medium">{activeOrder.payment_method}</p>
              <span className="text-[11px] text-emerald-400 font-semibold block">✓ Payment Confirmed</span>
            </div>

            {/* Estimated Delivery */}
            <div className="space-y-2 bg-slate-950/40 p-4 rounded-xl border border-white/5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Delivery</span>
              <p className="text-xs text-indigo-300 font-semibold">
                {activeOrder.status === 'Delivered'
                  ? 'Delivered to recipient'
                  : 'Expected in 2-3 business days'}
              </p>
            </div>
          </div>

          {/* Items Summary Table */}
          <div className="space-y-3 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Order Items</h3>
            <div className="space-y-2">
              {activeOrder.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-white/5"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.product_name}</h4>
                    <span className="text-xs text-slate-400">
                      Qty: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-indigo-300 font-heading">
                    ${(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
