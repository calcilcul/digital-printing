import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrderStore } from '../../store/orderStore';
import { axiosClient } from '../../api/axiosClient';

export default function OrderDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params || {};
  
  const { currentOrder, isLoading, fetchOrderDetail } = useOrderStore();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail(orderId);
    }
  }, [orderId, fetchOrderDetail]);

  const handleMarkCompleted = async () => {
    try {
      await axiosClient.put(`/api/orders/${orderId}/complete`);
      Alert.alert('Sukses', 'Pesanan telah diselesaikan. Terima kasih!');
      fetchOrderDetail(orderId);
    } catch (e) {
      Alert.alert('Gagal', 'Gagal menyelesaikan pesanan');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting_payment': return 'Menunggu Pembayaran';
      case 'paid': return 'Menunggu Verifikasi Pembayaran';
      case 'design_review': return 'Review Desain';
      case 'printing': return 'Sedang Dicetak';
      case 'ready': return 'Siap Diambil';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  if (isLoading || !currentOrder) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 bg-white flex-row items-center shadow-sm shadow-gray-200 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-xl font-bold text-gray-700">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center font-bold text-lg text-gray-900 mr-10">Detail Pesanan</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100">
          <Text className="text-gray-500 text-sm mb-1">Status Pesanan</Text>
          <Text className="text-xl font-bold text-gray-900 mb-4">{getStatusText(currentOrder.status)}</Text>
          
          <Text className="text-gray-500 text-sm mb-1">Nomor Invoice</Text>
          <Text className="font-bold text-gray-900">{currentOrder.invoice_number}</Text>
        </View>

        {/* Items */}
        <Text className="text-lg font-bold text-gray-900 mb-3 ml-2">Daftar Item</Text>
        {currentOrder.items?.map((item: any, index: number) => (
          <View key={index} className="bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-gray-100 border border-gray-100">
            <Text className="font-bold text-gray-900 text-base">{item.product_name}</Text>
            <Text className="text-gray-500 text-sm mb-2">Varian: {item.variant_name}</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-medium">{item.quantity}x Rp {item.price.toLocaleString('id-ID')}</Text>
              <Text className="text-blue-600 font-bold">Rp {item.subtotal.toLocaleString('id-ID')}</Text>
            </View>
            
            {/* Tombol Upload Desain untuk item yang butuh desain */}
            {(currentOrder.status === 'waiting_payment' || currentOrder.status === 'design_review') && (
              <TouchableOpacity 
                onPress={() => navigation.navigate('UploadDesign', { orderItemId: item.id })}
                className="mt-3 bg-indigo-50 py-2 rounded-xl border border-indigo-100 items-center"
              >
                <Text className="text-indigo-600 font-bold text-sm">Upload / Update Desain</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Action Buttons based on status */}
        <View className="mt-6 mb-10">
          {currentOrder.status === 'waiting_payment' && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Payment', { orderId: currentOrder.id, amount: currentOrder.total_amount })}
              className="bg-blue-600 py-4 rounded-2xl items-center shadow-md shadow-blue-500/30"
            >
              <Text className="text-white font-bold text-lg">Upload Bukti Pembayaran</Text>
            </TouchableOpacity>
          )}

          {currentOrder.status === 'ready' && (
            <TouchableOpacity 
              onPress={handleMarkCompleted}
              className="bg-emerald-500 py-4 rounded-2xl items-center shadow-md shadow-emerald-500/30"
            >
              <Text className="text-white font-bold text-lg">Selesaikan Pesanan</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
