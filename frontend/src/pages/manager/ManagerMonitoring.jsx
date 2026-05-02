import React from 'react';
import { useOrderStore } from '../../store/orderStore';
import { Badge } from '../../components/ui/Badge';
import { SlideUp } from '../../components/animations/SlideUp';

export default function ManagerMonitoring() {
  const { orders } = useOrderStore();

  const columns = [
    { id: 'verifying', title: 'Verifikasi', color: 'border-t-blue-500 bg-blue-50/30' },
    { id: 'reviewing', title: 'Review Desain', color: 'border-t-orange-500 bg-orange-50/30' },
    { id: 'production', title: 'Produksi', color: 'border-t-purple-500 bg-purple-50/30' },
    { id: 'completed', title: 'Selesai', color: 'border-t-green-500 bg-green-50/30' },
  ];

  return (
    <div className="space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Monitoring Pesanan</h1>
        <p className="text-sm text-slate-500 mt-1">Kanban board pemantauan status pesanan secara *real-time*.</p>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-max">
          {columns.map((col, idx) => (
            <div key={col.id} className={`w-80 flex flex-col rounded-xl border-t-4 border-slate-200 shadow-sm ${col.color}`}>
              <div className="p-4 border-b border-slate-200/50 flex justify-between items-center bg-white/50 rounded-t-lg">
                <h3 className="font-bold text-slate-900">{col.title}</h3>
                <Badge>{orders.filter(o => o.status === col.id).length}</Badge>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {orders.filter(o => o.status === col.id).map((order) => (
                  <SlideUp key={order.id}>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-purple-300 transition-colors cursor-pointer">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500">{order.id}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mb-2">
                        {order.items[0]?.name} {order.items.length > 1 ? `+${order.items.length - 1}` : ''}
                      </h4>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs text-slate-500">{order.shippingInfo?.name}</span>
                        <span className="font-bold text-sm text-purple-600">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.total)}
                        </span>
                      </div>
                    </div>
                  </SlideUp>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
