import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  CreditCard, 
  PenTool, 
  Printer, 
  CheckCircle2, 
  Clock,
  Activity
} from 'lucide-react';
import { m } from 'framer-motion';

import { useStaffStore } from '../../store/staffStore';
import { Badge } from '../../components/ui/Badge';
import { FadeIn } from '../../components/animations/FadeIn';
import { useEffect } from 'react';

export default function StaffDashboard() {
  const { orders, fetchOrders } = useStaffStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = useMemo(() => {
    return {
      verifying: orders.filter(o => o.status === 'verifying').length,
      reviewing: orders.filter(o => o.status === 'reviewing').length,
      production: orders.filter(o => o.status === 'production').length,
      completed: orders.filter(o => o.status === 'completed').length,
    };
  }, [orders]);

  // Recent activities mock
  const recentActivities = [
    { id: 1, action: 'Pesanan #ORD-001 diverifikasi', time: '10 menit yang lalu' },
    { id: 2, action: 'Desain #ORD-002 disetujui', time: '30 menit yang lalu' },
    { id: 3, action: 'Pesanan #ORD-003 masuk produksi', time: '1 jam yang lalu' },
  ];

  const statCards = [
    { title: 'Menunggu Verifikasi', value: stats.verifying, icon: CreditCard, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'Review Desain', value: stats.reviewing, icon: PenTool, color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
    { title: 'Antrean Produksi', value: stats.production, icon: Printer, color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
    { title: 'Selesai (Hari ini)', value: stats.completed, icon: CheckCircle2, color: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-600' },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'verifying': return <Badge variant="primary">Verifikasi Pembayaran</Badge>;
      case 'reviewing': return <Badge variant="warning">Review Desain</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) + ' ' + 
           date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Staff</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan antrean tugas hari ini.</p>
        </div>
        <div className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2">
          <Clock size={16} className="text-primary-500" />
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <FadeIn key={idx} delay={idx * 0.1}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.text}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <div className="text-3xl font-bold text-slate-900 leading-none mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500">{stat.title}</div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      {/* Recent Activity */}
      <FadeIn delay={0.4} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
          <Activity size={18} className="text-slate-500" />
          <h2 className="text-lg font-bold text-slate-900">Aktivitas Terkini</h2>
        </div>
        
        <div className="divide-y divide-slate-100">
          {recentActivities.map((act) => (
            <div key={act.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <span className="text-sm font-medium text-slate-700">{act.action}</span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={12} /> {act.time}
              </span>
            </div>
          ))}
        </div>
      </FadeIn>

    </div>
  );
}
