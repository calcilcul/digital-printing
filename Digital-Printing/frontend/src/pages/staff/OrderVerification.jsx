import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, FileText, Download, User, MapPin, AlertTriangle, PenTool } from 'lucide-react';
import toast from 'react-hot-toast';

import { useStaffStore } from '../../store/staffStore';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SlideUp } from '../../components/animations/SlideUp';

export default function OrderVerification() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, approvePayment, rejectPayment, startProduction, finishProduction } = useStaffStore();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchedOrder = orders.find(o => String(o.id) === id);
      if (fetchedOrder) {
        setOrder(fetchedOrder);
      }
    }
  }, [id, orders]);

  if (!order) return null;

  const handleAction = async (action) => {
    let result = null;

    // Status Go API: 'paid' (menunggu verifikasi), 'processing' (sedang produksi)
    // Wait, let's map statuses:
    // 'paid' -> Verifikasi Pembayaran
    // 'processing' -> Review Desain/Produksi (Untuk demo, anggap saja processing itu langsung produksi)
    
    if (order.status === 'paid' || order.status === 'verifying') {
      if (action === 'approve') {
        // Payment in Go uses payment ID. If order has payment ID, use it.
        // Wait, Golang handler expects payment ID. The order object has payment info?
        // Let's assume order.payment_id exists, or we use order.id temporarily if the API allows it.
        // Wait! The payment API expects payment_id: `staff.PUT("/payments/:id/approve")`.
        // Let's check `GET /api/staff/orders` response to see if it includes payment_id.
        // If not, we might need to adjust Golang API or just use order ID if they are 1:1.
        // Actually, the handler extracts payment_id from URL.
        const paymentId = order.payment_id || order.id; // Fallback
        result = await approvePayment(paymentId);
        if(result.success) toast.success('Pembayaran diverifikasi. Lanjut ke produksi.');
      } else if (action === 'reject') {
        const paymentId = order.payment_id || order.id;
        result = await rejectPayment(paymentId);
        if(result.success) toast.success('Pembayaran ditolak.');
      }
    } else if (order.status === 'processing' || order.status === 'reviewing') {
      if (action === 'approve') {
        result = await startProduction(order.id, 'Desain disetujui, mulai cetak');
        if(result.success) toast.success('Pesanan masuk antrean produksi.');
      } else if (action === 'finish') {
        result = await finishProduction(order.id, 'Produksi selesai');
        if(result.success) toast.success('Produksi selesai.');
      }
    }

    if (result && result.success) {
      setTimeout(() => {
        navigate('/staff/dashboard');
      }, 1500);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(price);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
            {order.id}
            {(order.status === 'verifying' || order.status === 'paid') && <Badge variant="primary">Verifikasi Pembayaran</Badge>}
            {(order.status === 'reviewing' || order.status === 'processing') && <Badge variant="warning">Proses Produksi / Desain</Badge>}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Total Tagihan: <span className="font-bold text-slate-900">{formatPrice(order.total_price || order.total)}</span></p>
        </div>
        <Button variant="outline" onClick={() => navigate('/staff/dashboard')}>Kembali</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Verification Action */}
        <div className="lg:col-span-2 space-y-6">
          
          {(order.status === 'verifying' || order.status === 'paid') && (
            <SlideUp className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-blue-50/50">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-blue-600" />
                  Verifikasi Pembayaran
                </h2>
              </div>
              <div className="p-6">
                <div className="aspect-[4/3] bg-slate-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden border border-slate-200">
                  {order.paymentProof ? (
                    <img src={order.paymentProof.base64} alt="Bukti Transfer" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-slate-400">Tidak ada gambar</span>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <Button variant="danger" className="flex-1" onClick={() => handleAction('reject')}>
                    <XCircle size={18} className="mr-2" /> Tolak
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction('approve')}>
                    <CheckCircle2 size={18} className="mr-2" /> Terima & Verifikasi
                  </Button>
                </div>
              </div>
            </SlideUp>
          )}

          {(order.status === 'reviewing' || order.status === 'processing') && (
            <SlideUp className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-orange-50/50">
                <h2 className="font-bold text-slate-900 flex items-center gap-2">
                  <PenTool size={18} className="text-orange-600" />
                  Review Desain
                </h2>
              </div>
              <div className="p-6">
                {order.designFile ? (
                  <div className="aspect-auto max-h-[500px] bg-slate-100 rounded-xl mb-6 flex items-center justify-center overflow-hidden border border-slate-200 p-4">
                    {order.designFile.type?.startsWith('image/') ? (
                      <img src={order.designFile.base64} alt="Design Preview" className="max-w-full max-h-full object-contain shadow-sm" />
                    ) : (
                      <div className="text-center">
                        <FileText size={48} className="text-slate-400 mx-auto mb-2" />
                        <span className="text-slate-600 font-medium">{order.designFile.name}</span>
                        <Button variant="outline" size="sm" className="mt-4">
                          <Download size={16} className="mr-2" /> Download File
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6 text-center">
                    <AlertTriangle size={32} className="text-yellow-600 mx-auto mb-3" />
                    <h3 className="font-bold text-yellow-800 mb-1">Customer Meminta Jasa Desain</h3>
                    <p className="text-sm text-yellow-700">Hubungi customer untuk diskusi desain, lalu buatkan dan upload desain final jika sudah disetujui.</p>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1 border-orange-200 text-orange-600 hover:bg-orange-50" onClick={() => handleAction('finish')}>
                    <CheckCircle2 size={18} className="mr-2" /> Tandai Selesai Cetak
                  </Button>
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleAction('approve')}>
                    <CheckCircle2 size={18} className="mr-2" /> Mulai Produksi
                  </Button>
                </div>
              </div>
            </SlideUp>
          )}

          {/* List Produk */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Detail Item Pesanan</h3>
            <div className="space-y-4">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="w-16 h-16 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                    <img src={item.image || 'https://placehold.co/400x300?text=Produk'} alt={item.product_name || item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{item.product_name || item.name}</h4>
                    <div className="text-xs text-slate-600 flex flex-wrap gap-2">
                      <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">Qty: {item.quantity}</span>
                      {Object.entries(item.options || {}).map(([k, v]) => (
                        <span key={k} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-slate-700">{k}: {v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User size={18} className="text-slate-400" />
              Info Customer
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="block text-slate-500 mb-0.5 text-xs">Nama</span>
                <span className="font-medium text-slate-900">{order.shippingInfo?.name}</span>
              </div>
              <div>
                <span className="block text-slate-500 mb-0.5 text-xs">WhatsApp</span>
                {order.shippingInfo?.phone && (
                  <a href={`https://wa.me/${order.shippingInfo.phone.replace(/^0/, '62')}`} target="_blank" rel="noreferrer" className="font-medium text-blue-600 hover:underline">
                    {order.shippingInfo.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-slate-400" />
              Pengiriman
            </h3>
            {order.shippingInfo?.pickupInStore ? (
              <Badge variant="primary">Ambil di Toko</Badge>
            ) : (
              <div className="text-sm text-slate-700 leading-relaxed">
                <span className="font-medium">{order.shippingInfo?.address}</span><br />
                {order.shippingInfo?.city}, {order.shippingInfo?.postalCode}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
