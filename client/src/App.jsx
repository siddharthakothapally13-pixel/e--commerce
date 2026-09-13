import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import Catalog from './pages/Catalog';
import CartCheckout from './pages/CartCheckout';
import OrderTracking from './pages/OrderTracking';
import AdminDashboard from './pages/AdminDashboard';

function MainApp() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'tracking', 'admin'
  const [searchQuery, setSearchQuery] = useState('');
  const [trackedOrderNumber, setTrackedOrderNumber] = useState(null);

  const handleOrderCreated = (newOrder) => {
    setTrackedOrderNumber(newOrder.order_number);
    setActiveTab('tracking');
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 container pt-6 px-4">
        {activeTab === 'catalog' && (
          <Catalog searchQuery={searchQuery} />
        )}

        {activeTab === 'tracking' && (
          <OrderTracking selectedOrderNumber={trackedOrderNumber} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Shopping Cart Drawer / Checkout Overlay */}
      <CartCheckout onOrderCreated={handleOrderCreated} />

      {/* Auth Modal Overlay */}
      <AuthModal />

      {/* Global Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 bg-slate-950/60 backdrop-blur-md">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-heading">THIRANEX STORE</span>
            <span>• E-Commerce Web Application</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setActiveTab('catalog')} className="hover:text-slate-300">Catalog</button>
            <button onClick={() => setActiveTab('tracking')} className="hover:text-slate-300">Tracking</button>
            <button onClick={() => setActiveTab('admin')} className="hover:text-slate-300">Admin Portal</button>
          </div>
          <div>
            <span>© 2026 Thiranex Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
