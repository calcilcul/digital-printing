import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Search, ChevronRight, AlertCircle, Package } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { useCountdown } from '../../hooks/useCountdown';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/animations/FadeIn';

// Component for Timer
const OrderTimer = ({ expiresAt, startedAt, isPending }) => {
  const { isExpired, formattedTime, calculateProgress, timeLeft } = useCountdown(expiresAt);
  
  if (!isPending) return null;
  
  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-600 text-sm font-medium">
        <AlertCircle size={16} /> Waktu Pembayaran Habis
      </div>
    );
  }

  const progress = calculateProgress(startedAt, expiresAt, timeLeft);

  return (
    <div className="flex flex-col gap-1 w-full max-w-[200px]">
      <div className="flex justify-between items-center text-sm font-medium text-orange-600">
        <span className="flex items-center gap-1"><Clock size={14} /> Bayar dalam:</span>
        <span className="font-mono">{formattedTime}</span>
      </div>
      <div className="w-full bg-orange-100 rounded-full h-1.5 overflow-hidden">
        <div 
          className="bg-orange-500 h-1.5 rounded-full transition-all duration-1000 ease-linear" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function OrderListPage() {
  const { orders, fetchOrders } = useOrderStore();
  const { user } = useAuthStore();
  const [activeFilter, setActiveFilter] = useState('all');

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // If user is not logged in, we might still show orders (if they ordered as guest and it's in their local storage)
  // For production, we would filter by user.id
  // const userOrders = orders.filter(o => o.customerId === (user?.id || 'guest'));
  const userOrders = orders; // Show all from local storage for demo

  const filters = [
    { id: 'all', label: 'Semua' },
    { id: 'pending', label: 'Menunggu Pembayaran' },
    { id: 'processing', label: 'Diproses' },
    { id: 'completed', label: 'Selesai' },
    { id: 'cancelled', label: 'Dibatalkan' }
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'waiting_payment':
      case 'pending': return <Badge variant="warning">Menunggu Pembayaran</Badge>;
      case 'paid': return <Badge variant="primary">Menunggu Verifikasi</Badge>;
      case 'verifying': return <Badge variant="primary">Menunggu Verifikasi</Badge>;
      case 'reviewing': return <Badge variant="warning">Review Desain</Badge>;
      case 'printing':
      case 'processing':
      case 'production': return <Badge variant="primary">Dalam Produksi</Badge>;
      case 'ready': return <Badge variant="success">Siap Diambil</Badge>;
      case 'completed': return <Badge variant="success">Selesai</Badge>;
      case 'cancelled': 
      case 'expired': return <Badge variant="danger">Dibatalkan/Expired</Badge>;
      case 'rejected': return <Badge variant="danger">Ditolak</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredOrders = userOrders.filter(order => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'pending') return ['pending', 'waiting_payment', 'paid'].includes(order.status);
    if (activeFilter === 'processing') return ['verifying', 'reviewing', 'processing', 'printing', 'production'].includes(order.status);
    if (activeFilter === 'completed') return ['completed', 'ready'].includes(order.status);
    if (activeFilter === 'cancelled') return ['cancelled', 'expired', 'rejected'].includes(order.status);
    return true;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pesanan Saya</h1>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-primary-300'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <FadeIn className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Pesanan</h3>
            <p className="text-slate-500 mb-6">Anda belum memiliki pesanan dengan status ini.</p>
            <Link to="/katalog">
              <Button>Mulai Belanja</Button>
            </Link>
          </FadeIn>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredOrders.map((order) => (
                <m.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">{formatDate(order.created_at || order.createdAt)}</div>
                      <div className="font-bold text-slate-900">{order.order_code || order.id}</div>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      {getStatusBadge(order.status)}
                      <OrderTimer 
                        expiresAt={order.timerExpiresAt} 
                        startedAt={order.timerStartedAt} 
                        isPending={['waiting_payment', 'pending'].includes(order.status)} 
                      />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    {(order.items || []).slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex gap-4 mb-4 last:mb-0">
                        <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          <img src={item.image || 'https://placehold.co/100x100?text=Produk'} alt={item.product_name || item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900 line-clamp-1">{item.product_name || item.name}</h4>
                          <p className="text-sm text-slate-500">{item.quantity} x {formatPrice(item.unit_price || item.price || 0)}</p>
                        </div>
                      </div>
                    ))}
                    {(order.items || []).length > 2 && (
                      <p className="text-sm text-slate-500 mt-2 italic">+ {order.items.length - 2} produk lainnya</p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-slate-100 px-6 py-4 flex justify-between items-center">
                    <div>
                      <div className="text-xs text-slate-500 mb-0.5">Total Belanja</div>
                      <div className="font-bold text-slate-900">{formatPrice(order.total_price || order.total || 0)}</div>
                    </div>
                    <div className="flex gap-3">
                      {order.status === 'pending' && (
                        <Link to={`/pesanan/${order.id}`}>
                          <Button size="sm">Upload Bukti Bayar</Button>
                        </Link>
                      )}
                      <Link to={`/pesanan/${order.id}`}>
                        <Button variant={order.status === 'pending' ? 'outline' : 'primary'} size="sm">
                          Lihat Detail <ChevronRight size={16} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </m.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
