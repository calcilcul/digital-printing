import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useStaffStore } from '../../store/staffStore';
import { CreditCard, Clock, ChevronRight, CheckCircle } from 'lucide-react-native';

export default function StaffPaymentVerificationScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { orders, isLoading, fetchOrders } = useStaffStore();

  useEffect(() => {
    if (isFocused) fetchOrders();
  }, [isFocused]);

  const paymentOrders = orders.filter((o) => o.status === 'payment_verification');

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    const diffM = Math.floor((diffMs % 3600000) / 60000);
    if (diffH > 24) return `${Math.floor(diffH / 24)} hari lalu`;
    if (diffH > 0) return `${diffH} jam lalu`;
    return `${diffM} menit lalu`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
      {/* HEADER */}
      <View style={{ backgroundColor: '#D97706', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={20} color="white" />
          </View>
          <View>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Verifikasi Pembayaran</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Konfirmasi bukti transfer dari pelanggan</Text>
          </View>
        </View>

        {/* Count badge */}
        <View style={{ marginTop: 12, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' }}>Menunggu verifikasi</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>{paymentOrders.length}</Text>
          </View>
        </View>
      </View>

      {isLoading && orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 12 }}>Memuat daftar pembayaran...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOrders} colors={['#D97706']} />}
        >
          {paymentOrders.length > 0 ? paymentOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              onPress={() => navigation.navigate('StaffVerification', { orderId: order.id })}
              activeOpacity={0.75}
              style={{
                backgroundColor: 'white',
                borderRadius: 20,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#FED7AA',
                shadowColor: '#D97706',
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 4 },
                elevation: 4,
                overflow: 'hidden',
              }}
            >
              {/* Orange top accent stripe */}
              <View style={{ height: 3, backgroundColor: '#D97706', width: '100%' }} />

              <View style={{ padding: 16 }}>
                {/* Row 1: Code + badge */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ fontWeight: '900', color: '#1F2937', fontSize: 15 }}>{order.order_code}</Text>
                    <View style={{ backgroundColor: '#FFF7ED', borderColor: '#FED7AA', borderWidth: 1, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 }}>
                      <Text style={{ fontSize: 9, fontWeight: '800', color: '#C2410C' }}>PERLU VERIFIKASI</Text>
                    </View>
                  </View>
                  <ChevronRight size={16} color="#9CA3AF" />
                </View>

                {/* Row 2: Customer + amount */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <View>
                    <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 3 }}>Pelanggan</Text>
                    <Text style={{ color: '#374151', fontWeight: '700', fontSize: 14 }}>{order.user_name || 'Customer'}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 3 }}>Nominal</Text>
                    <Text style={{ color: '#1E40AF', fontWeight: '900', fontSize: 16 }}>
                      Rp {order.total_price?.toLocaleString('id-ID') || 0}
                    </Text>
                  </View>
                </View>

                {/* Row 3: Time + action button */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color="#9CA3AF" />
                    <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{formatTime(order.created_at)}</Text>
                  </View>
                  <View style={{ backgroundColor: '#D97706', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7 }}>
                    <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>Verifikasi Sekarang →</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 48, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', marginTop: 24 }}>
              <View style={{ width: 72, height: 72, backgroundColor: '#ECFDF5', borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <CheckCircle size={36} color="#10B981" />
              </View>
              <Text style={{ fontWeight: '900', color: '#1F2937', fontSize: 16, marginBottom: 6 }}>Semua Pembayaran Bersih</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                Tidak ada bukti transfer baru yang membutuhkan verifikasi. Semua sudah diproses!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
