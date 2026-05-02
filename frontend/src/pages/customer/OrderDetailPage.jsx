import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Clock, CheckCircle2, AlertCircle, FileText, Download, X, UploadCloud, Check } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { useOrderStore } from '../../store/orderStore';
import { useCountdown } from '../../hooks/useCountdown';
import { useFileUpload } from '../../hooks/useFileUpload';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/animations/FadeIn';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { getOrderById, updateOrder, updateOrderStatus } = useOrderStore();
  const [order, setOrder] = useState(null);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);

  const { 
    isUploading: isUploadingPayment, 
    uploadProgress: progressPayment, 
    fileData: paymentFile, 
    handleUpload: uploadPaymentFile, 
    clearFile: clearPaymentFile 
  } = useFileUpload('payment');

  const { 
    isUploading: isUploadingDesign, 
    uploadProgress: progressDesign, 
    fileData: designFile, 
    handleUpload: uploadDesignFile, 
    clearFile: clearDesignFile 
  } = useFileUpload('design');

  useEffect(() => {
    if (!id) return;
    // Cek dari store dulu (kalau sudah di-fetch sebelumnya)
    const found = getOrderById(id);
    if (found) {
      setOrder(found);
    } else {
      // Kalau belum ada, fetch ulang
      import('../../store/orderStore').then(({ useOrderStore }) => {
        useOrderStore.getState().fetchOrders().then(() => {
          setOrder(useOrderStore.getState().getOrderById(id));
        });
      });
    }
  }, [id, getOrderById]);

  // Normalize field names from backend
  const orderTotal = order?.total_price || order?.total || 0;
  const orderCreatedAt = order?.created_at || order?.createdAt || new Date().toISOString();
  const orderItems = order?.items || [];

  // Handle Order Timer
  const { isExpired, formattedTime, calculateProgress, timeLeft } = useCountdown(order?.timerExpiresAt);
  const progress = calculateProgress(order?.timerStartedAt, order?.timerExpiresAt, timeLeft);

  useEffect(() => {
    if (order?.status === 'pending' && isExpired) {
      updateOrderStatus(id, 'expired');
      setOrder(prev => ({...prev, status: 'expired'}));
    }
  }, [isExpired, order?.status, id, updateOrderStatus]);

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const steps = [
    { id: 1, label: 'Pesanan Dibuat', status: true },
    { id: 2, label: 'Pembayaran', status: ['paid','verifying','reviewing','printing','processing','production','ready','completed'].includes(order.status) },
    { id: 3, label: 'Produksi', status: ['printing','processing','production','ready','completed'].includes(order.status) },
    { id: 4, label: 'Selesai', status: ['ready','completed'].includes(order.status) },
  ];

  const handlePaymentSubmit = () => {
    if (!paymentFile) return;
    updateOrder(id, { 
      paymentProof: paymentFile, 
      status: 'verifying',
      timerExpiresAt: null // Stop timer
    });
    setOrder(prev => ({...prev, paymentProof: paymentFile, status: 'verifying', timerExpiresAt: null}));
    setIsPaymentModalOpen(false);
    toast.success('Bukti pembayaran berhasil diupload!');
  };

  const handleDesignSubmit = () => {
    if (!designFile) return;
    updateOrder(id, { 
      designFile: designFile,
      status: 'reviewing'
    });
    setOrder(prev => ({...prev, designFile: designFile, status: 'reviewing'}));
    setIsDesignModalOpen(false);
    toast.success('File desain revisi berhasil diupload!');
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              {order.id}
              {order.status === 'pending' && <Badge variant="warning">Menunggu Pembayaran</Badge>}
              {order.status === 'verifying' && <Badge variant="primary">Menunggu Verifikasi</Badge>}
              {order.status === 'reviewing' && <Badge variant="warning">Menunggu Review Desain</Badge>}
              {order.status === 'production' && <Badge variant="primary">Dalam Produksi</Badge>}
              {order.status === 'completed' && <Badge variant="success">Selesai</Badge>}
              {['expired', 'cancelled', 'rejected'].includes(order.status) && <Badge variant="danger">Dibatalkan/Ditolak</Badge>}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Tanggal Order: {formatDate(orderCreatedAt)}</p>
          </div>
        </div>

        {/* Status Alerts */}
        {order.status === 'pending' && !isExpired && (
          <FadeIn className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-orange-800 mb-2 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Selesaikan pembayaran dalam
              </h3>
              <div className="text-3xl font-mono font-bold text-orange-600 mb-3">{formattedTime}</div>
              <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-sm text-orange-700">Transfer tepat <strong>{formatPrice(orderTotal)}</strong> ke BCA 1234 5678 90 a/n Jaya Mandiri.</p>
            </div>
            <Button size="lg" className="shrink-0 shadow-lg shadow-orange-500/20" onClick={() => setIsPaymentModalOpen(true)}>
              Upload Bukti Bayar
            </Button>
          </FadeIn>
        )}

        {order.status === 'rejected' && (
          <FadeIn className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" /> Pembayaran Ditolak
              </h3>
              <p className="text-sm text-red-700">Bukti transfer tidak valid atau dana belum masuk. Silakan upload ulang bukti yang benar.</p>
            </div>
            <Button variant="danger" onClick={() => setIsPaymentModalOpen(true)}>
              Upload Ulang
            </Button>
          </FadeIn>
        )}

        {/* Progress Tracker */}
        {['pending', 'paid', 'verifying', 'reviewing', 'processing', 'production', 'completed'].includes(order.status) && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8 overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="relative flex justify-between">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0 rounded-full"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 z-0 rounded-full transition-all duration-1000"
                  style={{ width: `${((steps.filter(s => s.status).length - 1) / (steps.length - 1)) * 100}%` }}
                ></div>
                
                {steps.map((step, idx) => {
                  const isCurrent = order.status === 'pending' && step.id === 2 ? true :
                                    order.status === 'verifying' && step.id === 2 ? true :
                                    order.status === 'reviewing' && step.id === 3 ? true :
                                    order.status === 'production' && step.id === 4 ? true :
                                    order.status === 'completed' && step.id === 5 ? true : false;
                  
                  return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                        step.status 
                          ? 'bg-primary-600 text-white border-4 border-white shadow-sm' 
                          : isCurrent
                            ? 'bg-white border-4 border-primary-200 text-primary-600'
                            : 'bg-slate-200 text-slate-500 border-4 border-white'
                      }`}>
                        {step.status ? <CheckCircle2 size={16} /> : step.id}
                      </div>
                      <span className={`mt-3 text-xs font-medium text-center ${step.status || isCurrent ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Detail Produk */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Detail Produk</h2>
          <div className="space-y-6">
            {orderItems.length > 0 ? orderItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 sm:gap-6 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-100 shrink-0 border border-slate-200 overflow-hidden">
                  <img src={item.image || 'https://placehold.co/400x300?text=Produk'} alt={item.product_name || item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 leading-tight">{item.product_name || item.name}</h3>
                    <div className="font-bold text-slate-900">{formatPrice(item.subtotal || (item.price * item.quantity) || 0)}</div>
                  </div>
                  <div className="text-sm text-slate-500 mb-2">{item.quantity} x {formatPrice(item.unit_price || item.price || 0)}</div>
                  <div className="text-xs text-slate-500 bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">
                    {Object.entries(item.options || {}).map(([k, v]) => (
                      <span key={k} className="mr-3 last:mr-0"><strong>{k}:</strong> {v}</span>
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center text-slate-500 text-sm py-8">Tidak ada item dalam pesanan ini.</div>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 flex justify-between items-center">
            <span className="font-bold text-slate-900">Total Tagihan</span>
            <span className="text-2xl font-bold text-primary-600">{formatPrice(orderTotal)}</span>
          </div>
        </div>

        {/* File & Pengiriman Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* File Desain & Bukti */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-900">File Desain</h2>
                {order.status === 'reviewing' && (
                  <Button size="sm" variant="outline" onClick={() => setIsDesignModalOpen(true)}>Upload Revisi</Button>
                )}
              </div>
              
              {order.designFile ? (
                <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center border border-slate-200 shrink-0">
                    {order.designFile.type?.startsWith('image/') ? (
                      <img src={order.designFile.base64} alt="Design" className="w-full h-full object-cover rounded" />
                    ) : (
                      <FileText className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="font-medium text-slate-900 text-sm truncate">{order.designFile.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">Versi {order.designFile.version || 1} • {formatDate(order.designFile.uploadedAt)}</div>
                  </div>
                  <Download size={18} className="text-slate-400 shrink-0" />
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                  Customer meminta desain dibuatkan.
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Bukti Pembayaran</h2>
              {order.paymentProof ? (
                <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl bg-slate-50">
                  <div className="w-12 h-12 bg-white rounded flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden">
                    <img src={order.paymentProof.base64} alt="Proof" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium text-slate-900 text-sm truncate">{order.paymentProof.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{formatDate(order.paymentProof.uploadedAt)}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic p-4 bg-slate-50 rounded-xl text-center border border-slate-100">
                  Belum ada bukti pembayaran
                </div>
              )}
            </div>
          </div>

          {/* Informasi Pengiriman */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Informasi Pengiriman</h2>
            <div className="space-y-4 text-sm">
              <div>
                <div className="text-slate-500 mb-1">Nama Penerima</div>
                <div className="font-medium text-slate-900">{order.shippingInfo?.name || '-'}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">No. HP / WhatsApp</div>
                <div className="font-medium text-slate-900">{order.shippingInfo?.phone || '-'}</div>
              </div>
              <div>
                <div className="text-slate-500 mb-1">Alamat Pengiriman</div>
                {order.shippingInfo?.pickupInStore ? (
                  <Badge variant="primary" className="mt-1">Ambil di Toko</Badge>
                ) : (
                  <div className="font-medium text-slate-900 leading-relaxed">
                    {order.shippingInfo?.address}<br/>
                    {order.shippingInfo?.city}, {order.shippingInfo?.postalCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* MODALS */}
      
      {/* 1. Modal Upload Bukti Bayar */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Upload Bukti Pembayaran</h3>
                <button onClick={() => { setIsPaymentModalOpen(false); clearPaymentFile(); }} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-sm text-blue-800">
                  Total tagihan: <strong>{formatPrice(order.total)}</strong><br/>
                  Transfer ke: BCA 1234 5678 90 a/n Jaya Mandiri
                </div>

                {!paymentFile ? (
                  <div 
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-primary-400 transition-colors cursor-pointer relative"
                  >
                    <input type="file" onChange={(e) => uploadPaymentFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/jpeg, image/png" />
                    <UploadCloud size={32} className="text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900 mb-1">Pilih atau seret foto bukti transfer</p>
                    <p className="text-xs text-slate-500">JPG, PNG (Max 5MB)</p>
                    
                    {isUploadingPayment && (
                      <div className="mt-4">
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${progressPayment}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="aspect-auto max-h-48 overflow-hidden rounded-lg border border-slate-200">
                      <img src={paymentFile.base64} alt="Preview" className="w-full h-full object-contain bg-slate-50" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium truncate pr-4">{paymentFile.name}</span>
                      <button onClick={clearPaymentFile} className="text-sm text-red-500 font-medium whitespace-nowrap">Hapus</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => { setIsPaymentModalOpen(false); clearPaymentFile(); }}>Batal</Button>
                <Button onClick={handlePaymentSubmit} disabled={!paymentFile}>Kirim Bukti</Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal Upload Revisi Desain */}
      <AnimatePresence>
        {isDesignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900">Upload Revisi Desain</h3>
                <button onClick={() => { setIsDesignModalOpen(false); clearDesignFile(); }} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                {!designFile ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-primary-400 transition-colors cursor-pointer relative">
                    <input type="file" onChange={(e) => uploadDesignFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.ai,.cdr,.png,.jpg" />
                    <UploadCloud size={32} className="text-slate-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900 mb-1">Pilih atau seret file revisi desain</p>
                    <p className="text-xs text-slate-500">PDF, AI, CDR, PNG, JPG (Max 50MB)</p>
                    
                    {isUploadingDesign && (
                      <div className="mt-4">
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${progressDesign}%` }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4 border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center gap-3">
                    <Check size={24} className="text-green-500" />
                    <div className="flex-grow min-w-0">
                      <div className="font-medium text-sm truncate">{designFile.name}</div>
                      <div className="text-xs text-slate-500">Siap diupload</div>
                    </div>
                    <button onClick={clearDesignFile} className="text-slate-400 hover:text-red-500"><X size={18} /></button>
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => { setIsDesignModalOpen(false); clearDesignFile(); }}>Batal</Button>
                <Button onClick={handleDesignSubmit} disabled={!designFile}>Upload Desain</Button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
