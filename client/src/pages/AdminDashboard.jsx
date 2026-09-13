import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Plus, Trash2, Edit3, ShieldAlert, CheckCircle, RefreshCw, DollarSign, ShoppingBag, Truck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { user, isAdmin, openAuthModal } = useAuth();
  const [adminTab, setAdminTab] = useState('products'); // 'products' or 'orders'
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Product Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [image, setImage] = useState('');
  const [stock, setStock] = useState('15');
  const [featured, setFeatured] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('thiranex_token');

      // Fetch products
      const prodRes = await fetch('/api/products');
      const prodData = await prodRes.json();
      setProducts(prodData);

      // Fetch orders
      const orderRes = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }
    } catch (err) {
      setError('Failed to fetch admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Electronics');
    setImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80');
    setStock('15');
    setFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(prod.price.toString());
    setCategory(prod.category);
    setImage(prod.image);
    setStock(prod.stock.toString());
    setFeatured(Boolean(prod.featured));
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('thiranex_token');
      const payload = {
        name,
        description,
        price: parseFloat(price),
        category,
        image,
        stock: parseInt(stock),
        featured
      };

      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save product');
      }

      setIsModalOpen(false);
      fetchAdminData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const token = localStorage.getItem('thiranex_token');
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('thiranex_token');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="glass-panel p-12 max-w-lg mx-auto text-center space-y-4 my-12 animate-fade-in border-pink-500/20">
        <div className="w-16 h-16 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-400 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold font-heading text-white">Administrator Access Required</h2>
        <p className="text-xs text-slate-400">
          You must be logged in with an administrator role to access the management portal.
        </p>
        <div className="pt-2">
          <button onClick={openAuthModal} className="btn-primary">
            Sign In as Admin
          </button>
        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-panel p-6 border-pink-500/20">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-pink-600/20 border border-pink-500/30 text-pink-400">
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-heading text-white">Admin Management Portal</h1>
            <p className="text-xs text-slate-400">Product inventory control & real-time order processing</p>
          </div>
        </div>

        <button onClick={handleOpenAddModal} className="btn-primary text-xs flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-white">${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Orders</span>
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-white">{orders.length}</p>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Catalog Products</span>
            <Package className="w-4 h-4 text-pink-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-white">{products.length}</p>
        </div>

        <div className="glass-panel p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Shipments</span>
            <Truck className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold font-heading text-white">
            {orders.filter((o) => o.status === 'Placed' || o.status === 'Processing').length}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-4">
        <button
          onClick={() => setAdminTab('products')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            adminTab === 'products' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Product Management ({products.length})
        </button>
        <button
          onClick={() => setAdminTab('orders')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            adminTab === 'orders' ? 'text-pink-400 border-b-2 border-pink-500' : 'text-slate-400 hover:text-white'
          }`}
        >
          Order Fulfillment ({orders.length})
        </button>
      </div>

      {/* Product Management Table */}
      {adminTab === 'products' && (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Item</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover bg-slate-900" />
                      <div>
                        <span className="font-semibold text-white block">{prod.name}</span>
                        <span className="text-[11px] text-slate-500 line-clamp-1">{prod.description}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="badge badge-primary text-[10px]">{prod.category}</span>
                    </td>
                    <td className="p-4 font-bold text-white">${parseFloat(prod.price).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`font-semibold ${prod.stock > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {prod.stock} units
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Fulfillment Table */}
      {adminTab === 'orders' && (
        <div className="glass-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-white/10">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Fulfillment Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold text-indigo-300">{ord.order_number}</td>
                    <td className="p-4">
                      <span className="font-semibold text-white block">{ord.user?.name || 'Customer'}</span>
                      <span className="text-[11px] text-slate-500">{ord.user?.email}</span>
                    </td>
                    <td className="p-4 font-bold text-white">${parseFloat(ord.total_amount).toFixed(2)}</td>
                    <td className="p-4">
                      <select
                        value={ord.status}
                        onChange={(e) => handleStatusUpdate(ord.id, e.target.value)}
                        className="input-field py-1.5 px-3 text-xs w-36 bg-slate-950 border-white/10"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-400">{new Date(ord.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md p-6 relative border-pink-500/30">
            <h3 className="text-xl font-bold font-heading text-white mb-4">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h3>
            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Stock Qty</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="input-field text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="input-field text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-pink-500"
                />
                <label htmlFor="featured-check" className="text-xs text-slate-300">
                  Feature in Hero / Top Section
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1 text-xs"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 text-xs">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
