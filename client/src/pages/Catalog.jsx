import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Catalog({ searchQuery }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortOption, searchQuery]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/products/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error('Failed to fetch categories', e);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (sortOption) params.append('sort', sortOption);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden glass-panel p-8 sm:p-12 border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-950">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="badge badge-primary flex items-center gap-1.5 w-max">
            <Sparkles className="w-3.5 h-3.5" /> Premium Store Collection 2026
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-white tracking-tight">
            Discover Next-Gen Products & Gear.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Browse high-quality electronics, sleek wearables, and modern office essentials with live order status tracking and instant checkout.
          </p>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 border border-white/5 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="input-field py-2 text-xs w-44 bg-slate-900 border-white/10"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
          <p className="text-sm font-medium">Loading catalog products...</p>
        </div>
      ) : error ? (
        <div className="glass-panel p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <p className="text-red-400 font-medium">{error}</p>
          <button onClick={fetchProducts} className="btn-secondary text-xs">
            Retry Connection
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel p-12 text-center space-y-3">
          <p className="text-slate-300 font-bold text-lg">No products found</p>
          <p className="text-slate-400 text-xs">Try clearing search keywords or selecting another category.</p>
          <button onClick={() => { setSelectedCategory('All'); }} className="btn-primary text-xs mt-2">
            View All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
