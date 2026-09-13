import React, { useState } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, MapPin, ArrowRight, CheckCircle, ShieldCheck, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartCheckout({ onOrderCreated }) {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, isCartOpen, closeCart } = useCart();
  const { user, openAuthModal } = useAuth();

  const [shippingAddress, setShippingAddress] = useState('123 Innovation Way, Tech Park, CA 94025');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const shippingCost = subtotal > 200 || cart.length === 0 ? 0 : 15.0;
  const tax = subtotal * 0.08;
  const totalAmount = subtotal + shippingCost + tax;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (cart.length === 0) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('thiranex_token');
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart,
          shippingAddress,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to process order');
      }

      clearCart();
      closeCart();
      if (onOrderCreated) {
        onOrderCreated(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-white/10 h-full flex flex-col justify-between shadow-2xl overflow-y-auto">
        {/* Drawer Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-slate-900/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-white">Your Shopping Cart</h2>
              <p className="text-xs text-slate-400">{cart.length} unique item(s) selected</p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-6 flex-1 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
              {error}
            </div>
          )}

          {cart.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="text-slate-300 font-semibold">Your cart is currently empty</p>
              <p className="text-xs text-slate-500">Explore our catalog to add items to your cart.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-3.5 rounded-2xl bg-slate-950/60 border border-white/5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-xl bg-slate-900 border border-white/5"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-semibold text-sm text-white truncate">
                      {item.name}
                    </h4>
                    <span className="text-xs text-indigo-400 font-bold">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-semibold text-white px-2">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 flex items-center justify-center"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" /> Shipping & Fulfillment
              </h3>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="input-field text-xs py-2.5"
                  placeholder="Street Address, City, Zip"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="input-field text-xs py-2.5 bg-slate-950"
                >
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Apple Pay">Apple Pay / Google Pay</option>
                  <option value="UPI / Instant Pay">UPI / Instant Pay</option>
                </select>
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer & Checkout Button */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-slate-950/80 space-y-4">
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="text-white font-medium">
                  {shippingCost === 0 ? <span className="text-emerald-400">FREE</span> : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="text-white font-medium">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-white/10 text-sm font-bold text-white">
                <span>Total Amount</span>
                <span className="text-indigo-400 text-lg font-heading">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-sm font-semibold flex items-center justify-center gap-2 shadow-indigo-600/40"
            >
              {loading ? (
                'Processing Order...'
              ) : !user ? (
                <>
                  <ShieldCheck className="w-4 h-4" /> Sign In & Complete Order
                </>
              ) : (
                <>
                  Place Order Now <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
