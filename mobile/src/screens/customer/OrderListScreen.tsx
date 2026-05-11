import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { useOrderStore } from '../../store/orderStore';

export default function OrderListScreen() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const { orders, isLoading, fetchOrders } = useOrderStore();

  useEffect(() => {
    if (isFocused) {
      fetchOrders();
    }
  }, [isFocused, fetchOrders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting_payment': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'paid': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'design_review': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'printing': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'ready': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting_payment': return 'Menunggu Pembayaran';
      case 'paid': return 'Menunggu Verifikasi';
      case 'design_review': return 'Review Desain';
      case 'printing': return 'Sedang Dicetak';
      case 'ready': return 'Siap Diambil';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 py-4 bg-white shadow-sm shadow-gray-200 z-10">
        <Text className="text-2xl font-bold text-gray-900">Pesanan Saya</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : orders.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">📦</Text>
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2">Belum Ada Pesanan</Text>
          <Text className="text-gray-500 text-center">Anda belum membuat pesanan apapun.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {orders.map((order) => (
            <TouchableOpacity 
              key={order.id} 
              onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100"
            >
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-gray-900">{order.invoice_number}</Text>
                <View className={`px-3 py-1 rounded-full border ${getStatusColor(order.status).split(' ')[0]} ${getStatusColor(order.status).split(' ')[2]}`}>
                  <Text className={`text-xs font-bold ${getStatusColor(order.status).split(' ')[1]}`}>
                    {getStatusText(order.status)}
                  </Text>
                </View>
              </View>
              
              <View className="flex-row justify-between items-end mt-2">
                <View>
                  <Text className="text-gray-500 text-xs mb-1">Total Belanja</Text>
                  <Text className="text-blue-600 font-bold text-lg">
                    Rp {order.total_amount.toLocaleString('id-ID')}
                  </Text>
                </View>
                <View className="bg-gray-50 px-4 py-2 rounded-xl">
                  <Text className="text-gray-600 font-medium text-sm">Lihat Detail →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
