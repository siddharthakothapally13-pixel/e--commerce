import React from 'react';
import { Star, ShoppingCart, Check, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart, cart } = useCart();
  const cartItem = cart.find(item => item.id === product.id);
  const isInCart = Boolean(cartItem);

  return (
    <div className="glass-panel group relative overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/30">
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-900/60">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

        {/* Featured / Category Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {Boolean(product.featured) && (
            <span className="badge badge-amber shadow-lg backdrop-blur-md flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-400" /> Featured
            </span>
          )}
          <span className="badge badge-primary shadow-lg backdrop-blur-md">
            {product.category}
          </span>
        </div>

        {/* Stock Badge */}
        <div className="absolute bottom-3 left-3">
          {product.stock > 0 ? (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-emerald-500/30">
              {product.stock} in stock
            </span>
          ) : (
            <span className="text-[11px] font-medium text-red-400 bg-red-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-red-500/30">
              Out of stock
            </span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <h3 className="font-heading font-bold text-lg text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="font-bold ml-1">{product.rating || 4.8}</span>
            </div>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">({product.reviews_count || 15} reviews)</span>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <span className="text-xl font-extrabold font-heading text-white">
              ${parseFloat(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock <= 0}
            className={`btn-primary py-2 px-3.5 text-xs ${
              isInCart
                ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/30'
                : ''
            } ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isInCart ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added ({cartItem.quantity})
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
