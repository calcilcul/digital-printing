import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

import { useCartStore } from '../../store/cartStore';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/animations/FadeIn';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Keranjang Belanja</h1>
          <p className="text-slate-500 mt-2">
            Anda memiliki {items.reduce((acc, item) => acc + item.quantity, 0)} produk di keranjang
          </p>
        </div>

        {items.length === 0 ? (
          <FadeIn className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-24 h-24 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Keranjang Anda Masih Kosong</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Sepertinya Anda belum menambahkan produk apapun. Yuk telusuri katalog kami dan temukan produk yang Anda butuhkan!
            </p>
            <Link to="/katalog">
              <Button size="lg" className="px-8">
                Mulai Belanja
              </Button>
            </Link>
          </FadeIn>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Cart Items List */}
            <div className="w-full lg:w-2/3 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <m.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.2 }}
                    className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center"
                  >
                    {/* Item Image */}
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                      <img 
                        src={item.image || 'https://placehold.co/200'} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-grow">
                      <Link to={`/produk/${item.productId}`}>
                        <h3 className="text-lg font-bold text-slate-900 hover:text-primary-600 transition-colors line-clamp-1 mb-1">
                          {item.name}
                        </h3>
                      </Link>
                      <div className="text-primary-600 font-bold mb-2">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                        {Object.entries(item.options || {}).map(([key, value]) => (
                          <span key={key}><span className="font-medium text-slate-700">{key}:</span> {value}</span>
                        ))}
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-4">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center font-semibold text-sm text-slate-900">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:flex-col sm:items-end">
                        <span className="font-bold text-slate-900 sm:hidden">
                          {formatPrice(item.subtotal)}
                        </span>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-red-400 hover:text-red-600 transition-colors flex items-center text-sm font-medium"
                        >
                          <Trash2 size={16} className="sm:mr-1" />
                          <span className="hidden sm:inline">Hapus</span>
                        </button>
                      </div>
                    </div>
                  </m.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary Sticky Card */}
            <div className="w-full lg:w-1/3">
              <FadeIn delay={0.2} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-24">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Ringkasan Belanja</h3>
                
                <div className="space-y-4 text-sm text-slate-600 mb-6 border-b border-slate-200 pb-6">
                  <div className="flex justify-between">
                    <span>Total Harga ({items.length} Barang)</span>
                    <span className="font-medium text-slate-900">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Desain</span>
                    <span className="font-medium text-slate-900">Gratis / Disesuaikan</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-base font-bold text-slate-900">Total Tagihan</span>
                  <span className="text-2xl font-bold text-primary-600">{formatPrice(getCartTotal())}</span>
                </div>

                <Button fullWidth size="lg" onClick={handleCheckout}>
                  Lanjut ke Checkout <ArrowRight size={18} className="ml-2" />
                </Button>
                
                <div className="mt-4 text-center">
                  <Link to="/katalog" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                    Lanjut Belanja
                  </Link>
                </div>
              </FadeIn>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
