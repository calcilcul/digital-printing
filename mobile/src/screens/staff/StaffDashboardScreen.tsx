import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useStaffStore } from '../../store/staffStore';
import { useAuthStore } from '../../store/authStore';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  paid:           { label: 'Menunggu Verifikasi', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  design_review:  { label: 'Review Desain', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  printing:       { label: 'Sedang Dicetak', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  ready:          { label: 'Siap Diambil', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  completed:      { label: 'Selesai', color: 'bg-gray-100 text-gray-600 border-gray-200' },
};

const ACTIONABLE = ['paid', 'design_review', 'printing'];

export default function StaffDashboardScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { orders, isLoading, fetchOrders } = useStaffStore();
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    if (isFocused) fetchOrders();
  }, [isFocused, fetchOrders]);

  const actionable = orders.filter((o) => ACTIONABLE.includes(o.status));
  const done       = orders.filter((o) => !ACTIONABLE.includes(o.status));

  const renderCard = (order: any) => {
    const s = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600 border-gray-200' };
    const needsAction = ACTIONABLE.includes(order.status);
    return (
      <TouchableOpacity
        key={order.id}
        onPress={() => navigation.navigate('StaffVerification', { orderId: order.id })}
        className={`bg-white p-4 rounded-3xl mb-3 shadow-sm border ${needsAction ? 'border-blue-200 shadow-blue-100' : 'border-gray-100'}`}
      >
        <View className="flex-row justify-between items-center mb-2">
          <Text className="font-bold text-gray-900">{order.invoice_number}</Text>
          <View className={`px-3 py-1 rounded-full border ${s.color}`}>
            <Text className="text-xs font-bold">{s.label}</Text>
          </View>
        </View>
        <Text className="text-gray-500 text-sm mb-1">Pelanggan: {order.user_name}</Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-blue-600 font-bold">Rp {order.total_amount?.toLocaleString('id-ID')}</Text>
          {needsAction && (
            <Text className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">Perlu Tindakan →</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white shadow-sm shadow-gray-200 z-10 flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-bold text-gray-900">Dashboard Staff</Text>
          <Text className="text-sm text-gray-500">Halo, {user?.name} 👋</Text>
        </View>
        <TouchableOpacity onPress={signOut} className="bg-red-50 px-4 py-2 rounded-xl border border-red-100">
          <Text className="text-red-600 font-bold text-sm">Keluar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

          {/* Perlu Tindakan */}
          {actionable.length > 0 && (
            <>
              <View className="flex-row items-center mb-3">
                <View className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
                <Text className="font-bold text-gray-900">Perlu Tindakan ({actionable.length})</Text>
              </View>
              {actionable.map(renderCard)}
            </>
          )}

          {/* Selesai */}
          {done.length > 0 && (
            <>
              <View className="flex-row items-center mb-3 mt-4">
                <View className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
                <Text className="font-bold text-gray-500">Sudah Diproses ({done.length})</Text>
              </View>
              {done.map(renderCard)}
            </>
          )}

          {orders.length === 0 && (
            <View className="flex-1 items-center justify-center py-24">
              <Text className="text-4xl mb-4">📋</Text>
              <Text className="text-xl font-bold text-gray-800 mb-2">Tidak ada pesanan</Text>
              <Text className="text-gray-500 text-center">Semua pesanan telah diproses.</Text>
            </View>
          )}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
