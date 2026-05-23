import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useStaffStore } from '../../store/staffStore';
import { useAuthStore } from '../../store/authStore';
import { LayoutDashboard, Clock, Printer, PackageCheck, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react-native';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  payment_verification: { label: 'Verifikasi Bayar',   bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  paid:                 { label: 'Lunas / Desain',     bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  design_review:        { label: 'Review Desain',      bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  printing:             { label: 'Sedang Dicetak',     bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
  ready:                { label: 'Siap Diambil',       bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  completed:            { label: 'Selesai',            bg: '#F9FAFB', text: '#374151', border: '#E5E7EB' },
  cancelled:            { label: 'Dibatalkan',         bg: '#FFF1F2', text: '#BE123C', border: '#FECDD3' },
};

const ACTIONABLE = ['payment_verification', 'paid', 'design_review', 'printing'];

export default function StaffDashboardScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { orders, isLoading, fetchOrders } = useStaffStore();
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    if (isFocused) fetchOrders();
  }, [isFocused]);

  const stats = {
    waitingVerification: orders.filter((o) => o.status === 'payment_verification').length,
    printing: orders.filter((o) => o.status === 'printing').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    total: orders.length,
  };

  const recentOrders = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
  const initials = (user?.name || 'ST').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const StatCard = ({ icon, value, label, sublabel, bgColor, textColor, borderColor }: any) => (
    <View style={{ width: '50%', padding: 4 }}>
      <View style={{ backgroundColor: bgColor, borderColor, borderWidth: 1, borderRadius: 20, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          {icon}
        </View>
        <Text style={{ fontSize: 28, fontWeight: '900', color: textColor, marginBottom: 2 }}>{value}</Text>
        <Text style={{ fontSize: 11, fontWeight: '700', color: textColor }}>{label}</Text>
        <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{sublabel}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
      {/* HEADER */}
      <View style={{ backgroundColor: '#1E40AF', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{initials}</Text>
            </View>
            <View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Selamat datang kembali,</Text>
              <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>{user?.name || 'Staf Percetakan'} 👋</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={signOut}
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Keluar</Text>
          </TouchableOpacity>
        </View>

        {/* Summary pill */}
        <View style={{ marginTop: 16, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LayoutDashboard size={16} color="rgba(255,255,255,0.8)" />
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' }}>Total Pesanan Aktif</Text>
          </View>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>{stats.total}</Text>
        </View>
      </View>

      {isLoading && orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#1E40AF" />
          <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 12 }}>Memuat data real-time...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOrders} colors={['#1E40AF']} />}
        >
          {/* STAT CARDS */}
          <Text style={{ fontWeight: '800', color: '#1F2937', fontSize: 14, marginBottom: 10, marginLeft: 4 }}>📊 Statistik Real-time</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
            <StatCard
              icon={<AlertCircle size={16} color="#C2410C" />}
              value={stats.waitingVerification}
              label="Verifikasi Bayar"
              sublabel="Perlu konfirmasi"
              bgColor="#FFF7ED" textColor="#C2410C" borderColor="#FED7AA"
            />
            <StatCard
              icon={<Printer size={16} color="#065F46" />}
              value={stats.printing}
              label="Sedang Dicetak"
              sublabel="Antrean mesin"
              bgColor="#ECFDF5" textColor="#065F46" borderColor="#A7F3D0"
            />
            <StatCard
              icon={<PackageCheck size={16} color="#15803D" />}
              value={stats.ready}
              label="Siap Diambil"
              sublabel="Menunggu customer"
              bgColor="#F0FDF4" textColor="#15803D" borderColor="#BBF7D0"
            />
            <StatCard
              icon={<CheckCircle2 size={16} color="#374151" />}
              value={stats.completed}
              label="Selesai"
              sublabel="Telah diserahkan"
              bgColor="#F9FAFB" textColor="#374151" borderColor="#E5E7EB"
            />
          </View>

          {/* RECENT ORDERS */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 10, marginHorizontal: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#1E40AF' }} />
              <Text style={{ fontWeight: '800', color: '#1F2937', fontSize: 14 }}>📋 10 Pesanan Terbaru</Text>
            </View>
            <Text style={{ fontSize: 11, color: '#9CA3AF', fontWeight: '700' }}>{orders.length} total</Text>
          </View>

          {recentOrders.length > 0 ? recentOrders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.completed;
            const needsAction = ACTIONABLE.includes(order.status);
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => navigation.navigate('StaffVerification', { orderId: order.id })}
                activeOpacity={0.75}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: needsAction ? '#BFDBFE' : '#F3F4F6',
                  shadowColor: needsAction ? '#1E40AF' : '#000',
                  shadowOpacity: needsAction ? 0.08 : 0.04,
                  shadowRadius: 8,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 3,
                  overflow: 'hidden',
                }}
              >
                {needsAction && <View style={{ height: 3, backgroundColor: '#1E40AF', width: '100%' }} />}
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontWeight: '800', color: '#1F2937', fontSize: 14 }}>{order.order_code}</Text>
                      <View style={{ backgroundColor: cfg.bg, borderColor: cfg.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: cfg.text }}>{cfg.label}</Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View>
                      <Text style={{ color: '#6B7280', fontSize: 12, marginBottom: 2 }}>{order.user_name || 'Pelanggan'}</Text>
                      <Text style={{ color: '#1E40AF', fontWeight: '800', fontSize: 14 }}>
                        Rp {order.total_price?.toLocaleString('id-ID') || 0}
                      </Text>
                    </View>
                    {needsAction && (
                      <View style={{ backgroundColor: '#EFF6FF', borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE', paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text style={{ color: '#1E40AF', fontSize: 10, fontWeight: '800' }}>Perlu Aksi ›</Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <View style={{ backgroundColor: 'white', borderRadius: 24, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', marginTop: 8 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📋</Text>
              <Text style={{ fontWeight: '800', color: '#1F2937', fontSize: 15, marginBottom: 4 }}>Antrean Kosong</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, textAlign: 'center' }}>Semua pesanan telah diproses. Kerja bagus!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
