import React from 'react';
import { ShoppingBag, Search, User, ShieldCheck, LogOut, Package, LayoutDashboard, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ activeTab, setActiveTab, searchQuery, setSearchQuery }) {
  const { user, isAdmin, openAuthModal, logout } = useAuth();
  const { totalCount, openCart } = useCart();

  return (
    <header className="glass-nav sticky top-0 z-40 w-full transition-all">
      <div className="container flex items-center justify-between h-20 px-4">
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('catalog')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent font-heading">
              THIRANEX
            </span>
            <span className="block text-[10px] uppercase tracking-widest text-indigo-400 font-semibold -mt-1">
              Store & Tracking
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'catalog'
                ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Store className="w-4 h-4" />
            Store Catalog
          </button>

          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tracking'
                ? 'bg-indigo-600/90 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            Order Tracking
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'admin'
                  ? 'bg-pink-600/90 text-white shadow-lg shadow-pink-600/30'
                  : 'text-pink-400 hover:text-pink-300 hover:bg-pink-500/10'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Search Bar & Actions */}
        <div className="flex items-center gap-3">
          {activeTab === 'catalog' && (
            <div className="relative hidden lg:block w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-9 py-2 text-sm bg-slate-900/80 border-white/10 focus:border-indigo-500"
              />
            </div>
          )}

          {/* Cart Button */}
          <button
            onClick={openCart}
            className="relative p-2.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-indigo-500/50 text-slate-200 hover:text-white transition-all shadow-md group"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform text-indigo-400" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg border border-slate-900 animate-bounce">
                {totalCount}
              </span>
            )}
          </button>

          {/* User Auth Section */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                  {user.name}
                  {user.role === 'admin' && (
                    <span className="badge badge-admin text-[9px] py-0 px-1.5">Admin</span>
                  )}
                </span>
                <span className="text-[11px] text-slate-400">{user.email}</span>
              </div>
              <button
                onClick={logout}
                className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="btn-primary text-sm py-2 px-4 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Login / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
