import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useStaffStore } from '../../store/staffStore';
import { Palette, Clock, ChevronRight, CheckCheck, FileImage } from 'lucide-react-native';

export default function StaffDesignReviewScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { orders, isLoading, fetchOrders } = useStaffStore();

  useEffect(() => {
    if (isFocused) fetchOrders();
  }, [isFocused]);

  const designOrders = orders.filter((o) => o.status === 'design_review' || o.status === 'paid');
  const designReviewCount = orders.filter((o) => o.status === 'design_review').length;
  const paidWaitCount = orders.filter((o) => o.status === 'paid').length;

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
      <View style={{ backgroundColor: '#6D28D9', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
            <Palette size={20} color="white" />
          </View>
          <View>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Review Desain Cetak</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Periksa, setujui, atau minta revisi desain customer</Text>
          </View>
        </View>

        {/* Mini stats row */}
        <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>{designReviewCount}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600', marginTop: 2 }}>Review Desain</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>{paidWaitCount}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: '600', marginTop: 2 }}>Lunas Belum Review</Text>
          </View>
        </View>
      </View>

      {isLoading && orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#6D28D9" />
          <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 12 }}>Memuat antrean desain...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOrders} colors={['#6D28D9']} />}
        >
          {designOrders.length > 0 ? designOrders.map((order) => {
            const isDesignReview = order.status === 'design_review';
            const accentColor = isDesignReview ? '#6D28D9' : '#1D4ED8';
            const bgColor = isDesignReview ? '#F5F3FF' : '#EFF6FF';
            const borderColor = isDesignReview ? '#DDD6FE' : '#BFDBFE';
            const badgeLabel = isDesignReview ? 'REVIEW DESAIN' : 'LUNAS • MENUNGGU DESAIN';

            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => navigation.navigate('StaffVerification', { orderId: order.id })}
                activeOpacity={0.75}
                style={{
                  backgroundColor: 'white',
                  borderRadius: 20,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor,
                  shadowColor: accentColor,
                  shadowOpacity: 0.1,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 4,
                  overflow: 'hidden',
                }}
              >
                <View style={{ height: 3, backgroundColor: accentColor }} />
                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 34, height: 34, backgroundColor: bgColor, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                        <FileImage size={16} color={accentColor} />
                      </View>
                      <View>
                        <Text style={{ fontWeight: '900', color: '#1F2937', fontSize: 14 }}>{order.order_code}</Text>
                        <View style={{ backgroundColor: bgColor, borderColor, borderWidth: 1, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 1, marginTop: 3 }}>
                          <Text style={{ fontSize: 8, fontWeight: '800', color: accentColor }}>{badgeLabel}</Text>
                        </View>
                      </View>
                    </View>
                    <ChevronRight size={16} color="#9CA3AF" />
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <View>
                      <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Pelanggan</Text>
                      <Text style={{ color: '#374151', fontWeight: '700', fontSize: 14 }}>{order.user_name || 'Customer'}</Text>
                    </View>
                    <Text style={{ color: '#1E40AF', fontWeight: '900', fontSize: 16 }}>
                      Rp {order.total_price?.toLocaleString('id-ID') || 0}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} color="#9CA3AF" />
                      <Text style={{ color: '#9CA3AF', fontSize: 11 }}>{formatTime(order.created_at)}</Text>
                    </View>
                    <View style={{ backgroundColor: accentColor, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7 }}>
                      <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>Review Desain →</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 48, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', marginTop: 24 }}>
              <View style={{ width: 72, height: 72, backgroundColor: '#F5F3FF', borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <CheckCheck size={36} color="#6D28D9" />
              </View>
              <Text style={{ fontWeight: '900', color: '#1F2937', fontSize: 16, marginBottom: 6 }}>Review Desain Selesai</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                Tidak ada file desain baru dari customer yang perlu direview saat ini.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
