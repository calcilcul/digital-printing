import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Search, Clock, PenTool } from 'lucide-react';
import { m } from 'framer-motion';

import { useStaffStore } from '../../store/staffStore';
import { Badge } from '../../components/ui/Badge';
import { FadeIn } from '../../components/animations/FadeIn';
import { SlideUp } from '../../components/animations/SlideUp';
import { useEffect } from 'react';

export default function StaffVerificationList() {
  const { orders, fetchOrders } = useStaffStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Priority queue: Verifying and Reviewing orders, sorted by date
  const verificationQueue = useMemo(() => {
    return orders
      .filter(o => ['pending', 'verifying', 'reviewing'].includes(o.status)) // Wait, Golang uses 'pending' initially, but payment upload makes it 'paid' or wait, the status strings in Go are: 'pending', 'paid', 'processing', 'completed', 'cancelled'. 
      .filter(o => String(o.id).toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }, [orders, searchQuery]);

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return <Badge variant="warning">Menunggu Pembayaran</Badge>;
      case 'paid': return <Badge variant="primary">Perlu Diverifikasi</Badge>;
      case 'processing': return <Badge variant="primary">Diproses (Cetak)</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle2 size={16} className="text-blue-500" />;
      case 'processing': return <PenTool size={16} className="text-orange-500" />;
      case 'pending': return <Clock size={16} className="text-yellow-500" />;
      default: return null;
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Verifikasi Pesanan</h1>
          <p className="text-sm text-slate-500 mt-1">Daftar pesanan yang menunggu pengecekan pembayaran dan desain.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
            placeholder="Cari ID Pesanan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <SlideUp className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-sm text-slate-500">
                <th className="px-6 py-4 font-medium">ID Pesanan</th>
                <th className="px-6 py-4 font-medium">Waktu Masuk</th>
                <th className="px-6 py-4 font-medium">Tugas</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {verificationQueue.length > 0 ? (
                verificationQueue.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-500 gap-2">
                        <Clock size={14} />
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.status)}
                        {getStatusBadge(order.status)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/staff/verifikasi/${order.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg transition-colors"
                      >
                        Proses <ChevronRight size={16} className="ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Semua Selesai!</h3>
                    <p className="text-slate-500">Tidak ada antrean pesanan yang perlu diverifikasi saat ini.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SlideUp>

    </div>
  );
}
