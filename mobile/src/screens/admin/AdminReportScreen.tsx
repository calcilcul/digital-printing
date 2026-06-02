import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Animated, Platform, TextInput } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BarChart2, TrendingUp, Package, Calendar, ShoppingBag, Calculator, CheckCircle, Info, AlertCircle, AlertTriangle } from 'lucide-react-native';

import { useAdminStore } from '../../store/adminStore';

type PeriodType = 'today' | 'week' | 'month' | 'last_month' | 'custom';

// ===================================================
// HELPER FUNCTIONS
// ===================================================

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n ?? 0);

const formatShort = (n: number): string => {
  if (!n) return 'Rp 0';
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)}M`;
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${Math.round(n / 1_000)}rb`;
  return `Rp ${n}`;
};

const getPeriodLabel = (period: PeriodType, start?: string, end?: string): string => {
  const now = new Date();
  const fmt = (d: Date) => new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(d);

  switch (period) {
    case 'today':
      return `Hari ini, ${fmt(now)}`;
    case 'week': {
      const mon = new Date(now);
      mon.setDate(now.getDate() - now.getDay() + 1);
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      return `${fmt(mon)} — ${fmt(sun)}`;
    }
    case 'month':
      return new Intl.DateTimeFormat('id-ID', {
        month: 'long', year: 'numeric'
      }).format(now);
    case 'last_month': {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return new Intl.DateTimeFormat('id-ID', {
        month: 'long', year: 'numeric'
      }).format(lm);
    }
    case 'custom':
      if (start && end) return `${start} s.d. ${end}`;
      return 'Pilih Tanggal';
    default: return '';
  }
};

const filterByPeriod = (orders: any[], period: PeriodType, customStartStr?: string, customEndStr?: string) => {
  const now = new Date();
  return orders.filter(order => {
    const created = new Date(order.created_at);
    switch (period) {
      case 'today':
        return created.toDateString() === now.toDateString();
      case 'week': {
        const monday = new Date(now);
        monday.setDate(now.getDate() - now.getDay() + 1);
        monday.setHours(0, 0, 0, 0);
        return created >= monday;
      }
      case 'month':
        return created.getMonth() === now.getMonth() &&
               created.getFullYear() === now.getFullYear();
      case 'last_month': {
        const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return created.getMonth() === lm.getMonth() &&
               created.getFullYear() === lm.getFullYear();
      }
      case 'custom':
        if (!customStartStr || !customEndStr) return true;
        const customStart = new Date(customStartStr);
        const customEnd = new Date(customEndStr);
        customEnd.setHours(23, 59, 59, 999);
        return created >= customStart && created <= customEnd;
      default: return true;
    }
  });
};

const PERIOD_OPTIONS = [
  { key: 'today', label: 'Hari Ini' },
  { key: 'week', label: 'Minggu Ini' },
  { key: 'month', label: 'Bulan Ini' },
  { key: 'last_month', label: 'Bulan Lalu' },
  { key: 'custom', label: 'Pilih Tanggal' },
];

const STATUS_STATS = [
  { status: 'waiting_payment', label: 'Menunggu Bayar', color: '#D3D1C7', textColor: '#444441' },
  { status: 'payment_verification', label: 'Verifikasi Bayar', color: '#FAEEDA', textColor: '#633806' },
  { status: 'design_review', label: 'Review Desain', color: '#E6F1FB', textColor: '#0C447C' },
  { status: 'printing', label: 'Dicetak', color: '#1A56E8', textColor: '#FFFFFF' },
  { status: 'ready', label: 'Siap Ambil', color: '#EAF3DE', textColor: '#27500A' },
  { status: 'completed', label: 'Selesai', color: '#27500A', textColor: '#FFFFFF' },
  { status: 'cancelled', label: 'Dibatalkan', color: '#FCEBEB', textColor: '#791F1F' },
];

// ===================================================
// COMPONENTS
// ===================================================

const SkeletonBox = ({ width, height, style }: any) => {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 0.4, duration: 800, useNativeDriver: Platform.OS !== 'web' }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[{ width, height, backgroundColor: '#E8E8E8', borderRadius: 8, opacity }, style]} />
  );
};

const SectionCard = ({ title, children, headerRight }: any) => (
  <View style={{ backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16, borderWidth: 0.5, borderColor: '#EEEEEE' }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#222' }}>{title}</Text>
      {headerRight}
    </View>
    {children}
  </View>
);

// ===================================================
// MAIN SCREEN
// ===================================================

export default function AdminReportScreen() {
  const navigation = useNavigation<any>();
  const { 
    revenueData, fetchRevenueReport, 
    topProducts, fetchTopProducts, 
    orders, fetchOrders,
    materials, fetchMaterials,
    reportsLoading 
  } = useAdminStore();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [sortBy, setSortBy] = useState<'quantity' | 'revenue'>('quantity');
  const [error, setError] = useState(false);

  const loadData = useCallback(async (period: PeriodType, start?: string, end?: string) => {
    setError(false);
    try {
      let params: any = undefined;
      if (period === 'custom') {
        if (!start || !end) return; // Wait until both are provided
        params = { start_date: start, end_date: end };
      } else {
        params = { period };
      }

      await Promise.all([
        fetchRevenueReport(params),
        fetchTopProducts(params),
        fetchOrders(),
        fetchMaterials()
      ]);
    } catch (err) {
      setError(true);
    }
  }, [fetchRevenueReport, fetchTopProducts, fetchOrders, fetchMaterials]);

  useFocusEffect(
    useCallback(() => {
      loadData(selectedPeriod, customStart, customEnd);
    }, [loadData, selectedPeriod]) // Only auto-load when preset period changes
  );

  const handleRefresh = () => {
    loadData(selectedPeriod, customStart, customEnd);
  };

  const handlePeriodChange = (key: PeriodType) => {
    setSelectedPeriod(key);
  };

  const applyCustomDate = () => {
    if (customStart && customEnd) {
      loadData('custom', customStart, customEnd);
    }
  };

  // 1. REVENUE CALCULATIONS
  // Note: Only calculate total revenue from completed orders! (From backend it should already do this, but PRD asks to make sure we show label)
  const totalRevenue = useMemo(() => {
    if (!revenueData || !Array.isArray(revenueData)) return 0;
    return revenueData.reduce((acc, curr) => acc + (curr.total_revenue || 0), 0);
  }, [revenueData]);

  const totalOrders = useMemo(() => {
    if (!revenueData || !Array.isArray(revenueData)) return 0;
    return revenueData.reduce((acc, curr) => acc + (curr.total_orders || 0), 0);
  }, [revenueData]);

  // 2. ORDERS CALCULATIONS
  const periodOrders = useMemo(() => {
    return filterByPeriod(orders || [], selectedPeriod, customStart, customEnd);
  }, [orders, selectedPeriod, customStart, customEnd]);

  const completedOrders = useMemo(() => {
    return periodOrders.filter(o => o.status === 'completed' || o.status === 'ready').length;
  }, [periodOrders]);

  const completionRate = useMemo(() => {
    return periodOrders.length > 0 ? Math.round((completedOrders / periodOrders.length) * 100) : 0;
  }, [completedOrders, periodOrders]);

  // 3. CHART CALCULATIONS
  const chartData = useMemo(() => {
    if (!revenueData || !Array.isArray(revenueData)) return [];
    return revenueData.map((item, index) => {
      const dateLabel = item.date ? item.date.substring(5, 10).replace('-', '/') : `T-${index+1}`;
      return { label: dateLabel, value: item.total_revenue || 0 };
    });
  }, [revenueData]);
  const maxRevenueChart = Math.max(...chartData.map(d => d.value), 0);

  // 4. LOW STOCK WARNING
  const lowStockMaterials = useMemo(() => {
    if (!materials) return [];
    return materials.filter(m => m.stock < 50);
  }, [materials]);

  // 5. QUICK INSIGHTS
  const insights = useMemo(() => {
    const list = [];
    if (topProducts && topProducts.length > 0) {
      list.push({
        icon: 'trophy',
        text: `Produk terlaris: ${topProducts[0].product_name} (${topProducts[0].total_sold} unit)`,
        color: '#633806'
      });
    }

    list.push({
      icon: completionRate >= 70 ? 'check-circle' : 'alert-circle',
      text: `Tingkat penyelesaian: ${completionRate}% (${completedOrders} dari ${periodOrders.length} pesanan)`,
      color: completionRate >= 70 ? '#27500A' : '#633806'
    });

    const pendingCount = periodOrders.filter(o => ['payment_verification', 'design_review'].includes(o.status)).length;
    if (pendingCount > 0) {
      list.push({ icon: 'clock', text: `${pendingCount} pesanan membutuhkan tindakan segera`, color: '#0C447C' });
    }

    const cancelledCount = periodOrders.filter(o => o.status === 'cancelled').length;
    const cancelRate = periodOrders.length > 0 ? Math.round((cancelledCount / periodOrders.length) * 100) : 0;
    if (cancelledCount > 0) {
      list.push({
        icon: cancelRate > 20 ? 'x-circle' : 'info',
        text: `${cancelledCount} pesanan dibatalkan (${cancelRate}% dari total)`,
        color: cancelRate > 20 ? '#791F1F' : '#444441'
      });
    }

    const criticalCount = lowStockMaterials.filter(m => m.stock < 10).length;
    if (criticalCount > 0) {
      list.push({ icon: 'alert-triangle', text: `${criticalCount} material kritis — segera restok`, color: '#791F1F' });
    }

    return list;
  }, [topProducts, periodOrders, completedOrders, completionRate, lowStockMaterials]);


  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F4F4F4', justifyContent: 'center', alignItems: 'center' }}>
        <AlertCircle size={48} color="#D3D1C7" />
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#444', marginTop: 16, textAlign: 'center' }}>
          Gagal memuat laporan
        </Text>
        <Text style={{ fontSize: 13, color: '#888', marginTop: 8, textAlign: 'center' }}>
          Periksa koneksi internet Anda dan coba lagi.
        </Text>
        <TouchableOpacity onPress={handleRefresh} style={{ marginTop: 20, backgroundColor: '#1A56E8', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '500' }}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#F4F4F4' }}
      refreshControl={<RefreshControl refreshing={reportsLoading} onRefresh={handleRefresh} colors={['#1A56E8']} tintColor="#1A56E8" />}
    >
      {/* Header biru */}
      <View style={{ backgroundColor: '#1A56E8', padding: 20, paddingBottom: 35 }}>
        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '600' }}>Laporan Bisnis</Text>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 4 }}>
          {getPeriodLabel(selectedPeriod, customStart, customEnd)}
        </Text>
      </View>

      {/* Filter chips */}
      <View style={{ marginTop: -20, marginHorizontal: 16, marginBottom: 12 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {PERIOD_OPTIONS.map(p => (
            <TouchableOpacity
              key={p.key}
              onPress={() => handlePeriodChange(p.key as PeriodType)}
              style={{
                backgroundColor: selectedPeriod === p.key ? '#1A56E8' : '#FFFFFF',
                borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
                borderWidth: selectedPeriod === p.key ? 0 : 0.5, borderColor: '#D3D1C7',
                elevation: selectedPeriod === p.key ? 2 : 0, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
              }}
            >
              <Text style={{ color: selectedPeriod === p.key ? '#FFFFFF' : '#666666', fontWeight: selectedPeriod === p.key ? '600' : '400', fontSize: 13 }}>
                {p.key === 'custom' ? <Calendar size={12} color={selectedPeriod === 'custom' ? '#fff' : '#666'} /> : null} {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Custom Date Picker Fields */}
      {selectedPeriod === 'custom' && (
        <View style={{ marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', padding: 12, borderRadius: 12, borderWidth: 0.5, borderColor: '#EEE', flexDirection: 'row', alignItems: 'center' }}>
          <TextInput
            style={{ flex: 1, backgroundColor: '#F0F2F5', padding: 8, borderRadius: 6, fontSize: 12 }}
            placeholder="YYYY-MM-DD"
            value={customStart}
            onChangeText={setCustomStart}
          />
          <Text style={{ marginHorizontal: 8, color: '#888' }}>-</Text>
          <TextInput
            style={{ flex: 1, backgroundColor: '#F0F2F5', padding: 8, borderRadius: 6, fontSize: 12 }}
            placeholder="YYYY-MM-DD"
            value={customEnd}
            onChangeText={setCustomEnd}
          />
          <TouchableOpacity onPress={applyCustomDate} style={{ marginLeft: 12, backgroundColor: '#1A56E8', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Terapkan</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* WARNING STOK MATERIAL */}
      {!reportsLoading && lowStockMaterials.length > 0 && (
        <View style={{ backgroundColor: '#FCEBEB', marginHorizontal: 16, borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#A32D2D', marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <AlertTriangle size={16} color="#A32D2D" />
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#791F1F' }}>Peringatan Stok Material</Text>
          </View>
          {lowStockMaterials.map(m => (
            <View key={m.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, color: '#A32D2D' }}>{m.name}</Text>
              <Text style={{ fontSize: 12, fontWeight: '500', color: m.stock < 10 ? '#791F1F' : '#BA7517' }}>
                {m.stock} {m.unit} tersisa {m.stock < 10 ? '⚠️ KRITIS' : ''}
              </Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => navigation.navigate('MaterialManagement')} style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 12, color: '#A32D2D', textDecorationLine: 'underline' }}>Kelola stok material →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* REVENUE CARDS */}
      <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
          <View style={{ flex: 1, backgroundColor: '#1A56E8', borderRadius: 12, padding: 16, elevation: 2 }}>
            <TrendingUp color="#fff" size={24} style={{ marginBottom: 12 }} />
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginBottom: 4 }}>Total Pendapatan</Text>
            {reportsLoading ? <SkeletonBox width={100} height={24} /> : (
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{formatRupiah(totalRevenue)}</Text>
            )}
            <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 4 }}>Dari pesanan selesai</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#EAF3DE', borderRadius: 12, padding: 16, elevation: 2 }}>
            <ShoppingBag color="#27500A" size={24} style={{ marginBottom: 12 }} />
            <Text style={{ color: '#55723E', fontSize: 12, marginBottom: 4 }}>Total Pesanan</Text>
            {reportsLoading ? <SkeletonBox width={60} height={24} /> : (
              <Text style={{ color: '#27500A', fontSize: 20, fontWeight: '700' }}>{totalOrders}</Text>
            )}
            <Text style={{ color: '#55723E', fontSize: 10, marginTop: 4 }}>Semua status</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, backgroundColor: '#E6F1FB', borderRadius: 12, padding: 16, elevation: 2 }}>
            <Calculator color="#0C447C" size={20} style={{ marginBottom: 12 }} />
            <Text style={{ color: '#4A7CAE', fontSize: 11, marginBottom: 4 }}>Rata-rata Per Pesanan</Text>
            {reportsLoading ? <SkeletonBox width={80} height={20} /> : (
              <Text style={{ color: '#0C447C', fontSize: 16, fontWeight: '700' }}>
                {completedOrders === 0 ? 'Rp 0' : formatRupiah(totalRevenue / completedOrders)}
              </Text>
            )}
            <Text style={{ color: '#4A7CAE', fontSize: 10, marginTop: 4 }}>Dari pesanan selesai</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: '#FAEEDA', borderRadius: 12, padding: 16, elevation: 2 }}>
            <CheckCircle color="#633806" size={20} style={{ marginBottom: 12 }} />
            <Text style={{ color: '#896439', fontSize: 11, marginBottom: 4 }}>Tingkat Penyelesaian</Text>
            {reportsLoading ? <SkeletonBox width={60} height={20} /> : (
              <Text style={{ color: '#633806', fontSize: 16, fontWeight: '700' }}>{completionRate}%</Text>
            )}
            <Text style={{ color: '#896439', fontSize: 10, marginTop: 4 }}>{completedOrders} dari {periodOrders.length}</Text>
          </View>
        </View>
      </View>

      {/* GRAFIK PENDAPATAN */}
      <SectionCard title="Grafik Pendapatan">
        {reportsLoading ? (
          <SkeletonBox width="100%" height={120} />
        ) : chartData.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <Calendar color="#cbd5e1" size={32} />
            <Text style={{ color: '#888', marginTop: 8, fontSize: 13 }}>Tidak ada data pendapatan.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8, paddingHorizontal: 4 }}>
              {chartData.map((item, i) => (
                <View key={i} style={{ alignItems: 'center', width: 36 }}>
                  <Text style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>{formatShort(item.value)}</Text>
                  <View style={{ width: 28, height: Math.max((item.value / (maxRevenueChart || 1)) * 80, 4), backgroundColor: '#1A56E8', borderRadius: 4 }} />
                  <Text style={{ fontSize: 9, color: '#888', marginTop: 4, textAlign: 'center' }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </SectionCard>

      {/* STATUS PESANAN */}
      <View style={{ marginHorizontal: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#222', marginBottom: 10 }}>Status Pesanan</Text>
        {reportsLoading ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <SkeletonBox width={100} height={80} />
            <SkeletonBox width={100} height={80} />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {STATUS_STATS.map(stat => {
              const count = periodOrders.filter(o => o.status === stat.status).length;
              return (
                <TouchableOpacity 
                  key={stat.status}
                  onPress={() => navigation.navigate('AdminOrders', { status: stat.status })}
                  style={{ backgroundColor: stat.color, width: 110, height: 80, borderRadius: 12, padding: 12, justifyContent: 'space-between' }}
                >
                  <Text style={{ fontSize: 24, fontWeight: '700', color: stat.textColor }}>{count}</Text>
                  <Text style={{ fontSize: 11, fontWeight: '500', color: stat.textColor }}>{stat.label}</Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        )}
      </View>

      {/* PRODUK TERLARIS */}
      <SectionCard 
        title="Produk Terlaris" 
        headerRight={
          <View style={{ flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 6, p: 2 }}>
            <TouchableOpacity onPress={() => setSortBy('quantity')} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: sortBy === 'quantity' ? '#1A56E8' : 'transparent', borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: sortBy === 'quantity' ? '#fff' : '#666' }}>Terlaris</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortBy('revenue')} style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: sortBy === 'revenue' ? '#1A56E8' : 'transparent', borderRadius: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: sortBy === 'revenue' ? '#fff' : '#666' }}>Revenue</Text>
            </TouchableOpacity>
          </View>
        }
      >
        {reportsLoading ? (
          <View style={{ gap: 12 }}>
            <SkeletonBox width="100%" height={40} />
            <SkeletonBox width="100%" height={40} />
          </View>
        ) : topProducts.length === 0 ? (
          <View style={{ alignItems: 'center', padding: 20 }}>
            <BarChart2 color="#cbd5e1" size={32} />
            <Text style={{ color: '#888', marginTop: 8, fontSize: 13 }}>Belum ada data penjualan pada periode ini.</Text>
          </View>
        ) : (
          <View>
            {[...topProducts]
              .sort((a, b) => sortBy === 'quantity' ? b.total_sold - a.total_sold : b.total_revenue - a.total_revenue)
              .slice(0, 10).map((product, index, array) => (
              <View key={product.product_id || index} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#F0F2F5', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: index < 3 ? '#fff' : '#666' }}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: '#222', marginBottom: 2 }} numberOfLines={1}>{product.product_name}</Text>
                  <View style={{ height: 3, backgroundColor: '#F0F2F5', borderRadius: 2, marginTop: 4, width: '100%' }}>
                    <View style={{ width: `${sortBy === 'quantity' ? (product.total_sold / (array[0]?.total_sold || 1)) * 100 : (product.total_revenue / (array[0]?.total_revenue || 1)) * 100}%`, height: '100%', backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#1A56E8', borderRadius: 2 }} />
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', marginLeft: 12, minWidth: 70 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#1A56E8' }}>
                    {sortBy === 'quantity' ? `${product.total_sold} unit` : formatShort(product.total_revenue)}
                  </Text>
                  <Text style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                    {sortBy === 'quantity' ? formatShort(product.total_revenue) : `${product.total_sold} unit`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      {/* QUICK INSIGHTS */}
      <SectionCard title="Ringkasan Cepat">
        {reportsLoading ? (
          <View style={{ gap: 8 }}>
            <SkeletonBox width="90%" height={20} />
            <SkeletonBox width="70%" height={20} />
          </View>
        ) : insights.length === 0 ? (
          <Text style={{ fontSize: 13, color: '#888', fontStyle: 'italic' }}>Tidak ada insight untuk saat ini.</Text>
        ) : (
          <View>
            {insights.map((insight, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <Info size={16} color={insight.color} style={{ marginTop: 1 }} />
                <Text style={{ fontSize: 13, color: insight.color, flex: 1, lineHeight: 18, fontWeight: '500' }}>
                  {insight.text}
                </Text>
              </View>
            ))}
          </View>
        )}
      </SectionCard>
      
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}
