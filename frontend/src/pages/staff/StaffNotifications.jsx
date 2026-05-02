import React from 'react';
import { Bell, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { SlideUp } from '../../components/animations/SlideUp';
import { FadeIn } from '../../components/animations/FadeIn';

export default function StaffNotifications() {
  const notifications = [
    { id: 1, type: 'warning', title: 'Stok Tinta Cyan Menipis', desc: 'Stok tersisa kurang dari 10%. Segera lapor ke Manager.', time: '10 menit yang lalu' },
    { id: 2, type: 'info', title: 'Pesanan Baru #ORD-005', desc: 'Pesanan masuk dari pelanggan "Budi Santoso".', time: '1 jam yang lalu' },
    { id: 3, type: 'success', title: 'Mesin Printer 1 Selesai Maintenance', desc: 'Mesin siap digunakan kembali.', time: '3 jam yang lalu' },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return <AlertCircle size={24} className="text-yellow-600" />;
      case 'success': return <CheckCircle2 size={24} className="text-green-600" />;
      default: return <Bell size={24} className="text-blue-600" />;
    }
  };

  const getBg = (type) => {
    switch(type) {
      case 'warning': return 'bg-yellow-100';
      case 'success': return 'bg-green-100';
      default: return 'bg-blue-100';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notifikasi</h1>
        <p className="text-sm text-slate-500 mt-1">Pembaruan aktivitas sistem dan peringatan operasional.</p>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif, idx) => (
            <SlideUp key={notif.id} delay={idx * 0.1}>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex gap-4 hover:border-primary-300 transition-colors cursor-pointer">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${getBg(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900">{notif.title}</h3>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> {notif.time}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{notif.desc}</p>
                </div>
              </div>
            </SlideUp>
          ))
        ) : (
          <FadeIn className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Tidak Ada Notifikasi Baru</h3>
            <p className="text-slate-500">Anda sudah membaca semua pemberitahuan.</p>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
