import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { m } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useWishlistStore } from '../store/wishlistStore';
import toast from 'react-hot-toast';

export function ProductCard({ product }) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isLiked = isInWishlist(product.id);

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleAddToCart = (e) => {
    e.preventDefault(); // Prevent navigating to detail page if click happens inside link
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      options: {
        Material: Object.values(product.specs || {})[0] || 'Standar'
      }
    });
    toast.success('Berhasil ditambahkan ke keranjang!');
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    toggleItem(product);
  };

  return (
    <m.div 
      whileHover={{ y: -5 }}
      className="glass-card group flex flex-col h-full rounded-xl overflow-hidden bg-white/70"
    >
      {/* Image Container */}
      <Link to={`/produk/${product.id}`} className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img 
          src={product.images[0] || 'https://placehold.co/400x300?text=No+Image'} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://placehold.co/400x300?text=Image+Not+Found';
          }}
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.badges?.map(badge => (
            <Badge 
              key={badge} 
              variant={badge.toLowerCase() === 'promo' ? 'danger' : 'primary'}
            >
              {badge}
            </Badge>
          ))}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-1 text-sm text-slate-500 font-medium">
          {product.category}
        </div>
        <Link to={`/produk/${product.id}`}>
          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-auto">
          <div className="text-xl font-bold text-primary-600 mb-1">
            {formatPrice(product.price)}
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-slate-500">
              {Object.values(product.specs || {})[0] || 'Custom Detail'}
            </span>
            {product.stock > 10 ? (
              <span className="text-xs text-green-600 font-medium">Stok tersedia</span>
            ) : (
              <span className="text-xs text-orange-600 font-medium">Stok terbatas</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 relative z-20">
            <Button className="flex-1" size="sm" onClick={handleAddToCart}>
              <ShoppingCart size={16} className="mr-2" />
              Keranjang
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className={`px-3 transition-colors ${isLiked ? 'text-rose-500 border-rose-200 bg-rose-50 hover:bg-rose-100 hover:text-rose-600' : ''}`}
              onClick={handleToggleWishlist}
              aria-label="Add to wishlist"
            >
              <Heart size={16} className={isLiked ? "fill-rose-500" : ""} />
            </Button>
          </div>
        </div>
      </div>
    </m.div>
  );
}
