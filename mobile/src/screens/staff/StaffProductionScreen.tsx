import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useStaffStore } from '../../store/staffStore';
import { Printer, PackageCheck, Clock, ChevronRight, CheckCircle2 } from 'lucide-react-native';

export default function StaffProductionScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { orders, isLoading, fetchOrders } = useStaffStore();

  useEffect(() => {
    if (isFocused) fetchOrders();
  }, [isFocused]);

  const printingOrders = orders.filter((o) => o.status === 'printing');
  const readyOrders = orders.filter((o) => o.status === 'ready');
  const productionOrders = [...printingOrders, ...readyOrders];

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
      <View style={{ backgroundColor: '#065F46', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <View style={{ width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 14, alignItems: 'center', justifyContent: 'center' }}>
            <Printer size={20} color="white" />
          </View>
          <View>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 18 }}>Antrean Cetak & Produksi</Text>
            <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Pantau mesin cetak dan serah terima pesanan</Text>
          </View>
        </View>

        {/* Mini stats */}
        <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Printer size={18} color="rgba(255,255,255,0.9)" />
            <View>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>{printingOrders.length}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600' }}>Sedang Cetak</Text>
            </View>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PackageCheck size={18} color="rgba(255,255,255,0.9)" />
            <View>
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 20 }}>{readyOrders.length}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600' }}>Siap Diambil</Text>
            </View>
          </View>
        </View>
      </View>

      {isLoading && orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#065F46" />
          <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 12 }}>Memuat antrean produksi...</Text>
        </View>
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOrders} colors={['#065F46']} />}
        >
          {/* PRINTING section */}
          {printingOrders.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginLeft: 4 }}>
                <Printer size={14} color="#065F46" />
                <Text style={{ fontWeight: '800', color: '#065F46', fontSize: 13 }}>Sedang Dicetak ({printingOrders.length})</Text>
              </View>
              {printingOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => navigation.navigate('StaffVerification', { orderId: order.id })}
                  activeOpacity={0.75}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#A7F3D0',
                    shadowColor: '#065F46',
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ height: 3, backgroundColor: '#10B981' }} />
                  <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 34, height: 34, backgroundColor: '#ECFDF5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                          <Printer size={16} color="#065F46" />
                        </View>
                        <View>
                          <Text style={{ fontWeight: '900', color: '#1F2937', fontSize: 14 }}>{order.order_code}</Text>
                          <View style={{ backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 1, marginTop: 3 }}>
                            <Text style={{ fontSize: 8, fontWeight: '800', color: '#065F46' }}>🖨️ SEDANG DICETAK</Text>
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
                      <View style={{ backgroundColor: '#065F46', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7 }}>
                        <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>Selesaikan Cetak →</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* READY section */}
          {readyOrders.length > 0 && (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, marginTop: printingOrders.length > 0 ? 8 : 0, marginLeft: 4 }}>
                <PackageCheck size={14} color="#15803D" />
                <Text style={{ fontWeight: '800', color: '#15803D', fontSize: 13 }}>Siap Diambil ({readyOrders.length})</Text>
              </View>
              {readyOrders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  onPress={() => navigation.navigate('StaffVerification', { orderId: order.id })}
                  activeOpacity={0.75}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 20,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#BBF7D0',
                    shadowColor: '#15803D',
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    shadowOffset: { width: 0, height: 3 },
                    elevation: 3,
                    overflow: 'hidden',
                  }}
                >
                  <View style={{ height: 3, backgroundColor: '#22C55E' }} />
                  <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ width: 34, height: 34, backgroundColor: '#F0FDF4', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                          <PackageCheck size={16} color="#15803D" />
                        </View>
                        <View>
                          <Text style={{ fontWeight: '900', color: '#1F2937', fontSize: 14 }}>{order.order_code}</Text>
                          <View style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 1, marginTop: 3 }}>
                            <Text style={{ fontSize: 8, fontWeight: '800', color: '#15803D' }}>📦 SIAP DIAMBIL</Text>
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
                      <View style={{ backgroundColor: '#15803D', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 7 }}>
                        <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>Serahkan ke Customer →</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}

          {productionOrders.length === 0 && (
            <View style={{ backgroundColor: 'white', borderRadius: 28, padding: 48, alignItems: 'center', borderWidth: 1, borderColor: '#F3F4F6', marginTop: 24 }}>
              <View style={{ width: 72, height: 72, backgroundColor: '#ECFDF5', borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <CheckCircle2 size={36} color="#10B981" />
              </View>
              <Text style={{ fontWeight: '900', color: '#1F2937', fontSize: 16, marginBottom: 6 }}>Antrean Produksi Kosong</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                Tidak ada pesanan yang sedang dicetak atau menunggu diambil. Semua bersih!
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
