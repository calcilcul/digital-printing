import React from 'react';
import { 
  TrendingUp, 
  Users, 
  Package, 
  DollarSign, 
  ArrowUpRight,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

import { useAdminStore } from '../../store/adminStore';
import { FadeIn } from '../../components/animations/FadeIn';

export default function ManagerDashboard() {
  const { reports, fetchReports, isLoading } = useAdminStore();
  const [periodFilter, setPeriodFilter] = React.useState('Bulan Ini');
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);

  React.useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Aggregate revenue from backend data, or fallback if empty
  const totalRevenue = Array.isArray(reports.revenue) 
    ? reports.revenue.reduce((acc, row) => acc + (parseFloat(row.total_revenue) || 0), 0)
    : 0;

  // Use the API top products or fallback to default
  const topProducts = Array.isArray(reports.topProducts) && reports.topProducts.length > 0
    ? reports.topProducts.map(p => ({
        name: p.product_name,
        sales: p.total_quantity,
        revenue: `Rp ${new Intl.NumberFormat('id-ID').format(p.total_revenue)}`,
        img: 'https://images.unsplash.com/photo-1598516086749-3467eaebdb76?q=80&w=200&auto=format&fit=crop'
      }))
    : [
        { name: 'Banner Outdoor Korea', sales: 145, revenue: 'Rp 4.500.000', img: 'https://images.unsplash.com/photo-1598516086749-3467eaebdb76?q=80&w=200&auto=format&fit=crop' },
        { name: 'Sticker Vinyl Transparan', sales: 98, revenue: 'Rp 2.100.000', img: 'https://images.unsplash.com/photo-1582216584252-c3639e7825d0?q=80&w=200&auto=format&fit=crop' },
      ];

  const activeOrders = 12; // Static or we could fetch orders count if we wanted
  
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
  };

  const statCards = [
    { title: 'Total Omzet (Bulan Ini)', value: formatPrice(totalRevenue), icon: DollarSign, trend: '+12.5%', color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { title: 'Pesanan Aktif', value: activeOrders, icon: Package, trend: '+5.2%', color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
    { title: 'Total Pelanggan', value: '1,248', icon: Users, trend: '+2.1%', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
    { title: 'Pertumbuhan', value: '+15.3%', icon: TrendingUp, trend: '+1.2%', color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-600' },
  ];

  // Mock data for simple bar chart visualization
  const chartData = [45, 52, 38, 65, 48, 75, 68];
  const maxChart = Math.max(...chartData);

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Omzet & Kinerja</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan performa bisnis Anda.</p>
        </div>
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="text-sm font-medium text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-colors"
          >
            <Calendar size={16} className="text-purple-500" />
            {periodFilter}
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </button>

          <AnimatePresence>
            {isFilterOpen && (
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-10"
              >
                {['Hari Ini', 'Minggu Ini', 'Bulan Ini', 'Tahun Ini'].map((period) => (
                  <button
                    key={period}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      periodFilter === period ? 'bg-purple-50 text-purple-700 font-medium' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setPeriodFilter(period);
                      setIsFilterOpen(false);
                    }}
                  >
                    {period}
                  </button>
                ))}
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <FadeIn key={idx} delay={idx * 0.1}>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.text}`}>
                  <stat.icon size={20} />
                </div>
                <div className="flex items-center text-emerald-600 text-sm font-medium bg-emerald-50 px-2 py-1 rounded-md">
                  <ArrowUpRight size={14} className="mr-1" />
                  {stat.trend}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900 leading-tight mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-500">{stat.title}</div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Area */}
        <FadeIn delay={0.4} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Grafik Penjualan (7 Hari Terakhir)</h2>
          
          <div className="h-64 flex items-end gap-2 sm:gap-6 pt-4 border-b border-slate-100">
            {chartData.map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex justify-center h-full items-end">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-2 rounded pointer-events-none">
                    {val} Order
                  </div>
                  <m.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(val / maxChart) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                    className="w-full bg-purple-100 group-hover:bg-purple-200 rounded-t-lg transition-colors relative overflow-hidden"
                  >
                    <div className="absolute bottom-0 w-full bg-purple-500 transition-all duration-300 group-hover:bg-purple-600 h-full"></div>
                  </m.div>
                </div>
                <span className="text-xs font-medium text-slate-400">H-{6-idx}</span>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* Top Products List */}
        <FadeIn delay={0.5} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Produk Terlaris</h2>
          <div className="space-y-6">
            {topProducts.map((prod, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                  <img src={prod.img} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate mb-0.5">{prod.name}</h4>
                  <p className="text-xs text-slate-500">{prod.sales} Terjual</p>
                </div>
                <div className="font-bold text-sm text-purple-600 shrink-0">
                  {prod.revenue}
                </div>
              </div>
            ))}
          </div>
        </FadeIn>

      </div>
    </div>
  );
}
