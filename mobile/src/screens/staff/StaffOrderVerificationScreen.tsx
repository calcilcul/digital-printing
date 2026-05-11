import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useStaffStore } from '../../store/staffStore';

export default function StaffOrderVerificationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params || {};
  const { orders, approvePayment, rejectPayment, startProduction, finishProduction } = useStaffStore();

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  const handleApprovePayment = async () => {
    const paymentId = order.payment_id || order.id;
    const res = await approvePayment(paymentId);
    if (res.success) {
      Alert.alert('Sukses', 'Pembayaran diverifikasi. Pesanan lanjut ke produksi.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Gagal', res.error);
    }
  };

  const handleRejectPayment = async () => {
    Alert.alert('Konfirmasi', 'Tolak pembayaran ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Tolak', style: 'destructive', onPress: async () => {
          const paymentId = order.payment_id || order.id;
          const res = await rejectPayment(paymentId);
          if (res.success) {
            Alert.alert('Berhasil', 'Pembayaran ditolak.', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          } else {
            Alert.alert('Gagal', res.error);
          }
        }
      }
    ]);
  };

  const handleStartProduction = async () => {
    const res = await startProduction(order.id, 'Desain disetujui, mulai cetak');
    if (res.success) {
      Alert.alert('Sukses', 'Pesanan masuk antrean produksi.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Gagal', res.error);
    }
  };

  const handleFinishProduction = async () => {
    const res = await finishProduction(order.id, 'Produksi selesai');
    if (res.success) {
      Alert.alert('Sukses', 'Produksi selesai! Pesanan siap diambil.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert('Gagal', res.error);
    }
  };

  const isPaidStatus = order.status === 'paid';
  const isDesignReview = order.status === 'design_review';
  const isPrinting = order.status === 'printing';

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 bg-white flex-row items-center shadow-sm shadow-gray-200 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-xl font-bold text-gray-700">←</Text>
        </TouchableOpacity>
        <View className="flex-1 ml-3">
          <Text className="font-bold text-lg text-gray-900">{order.invoice_number}</Text>
          <Text className="text-gray-500 text-sm">{order.user_name}</Text>
        </View>
        <Text className="text-blue-600 font-bold">Rp {order.total_amount?.toLocaleString('id-ID')}</Text>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

        {/* Verifikasi Pembayaran */}
        {isPaidStatus && (
          <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100">
            <Text className="font-bold text-gray-900 text-base mb-3">✅ Verifikasi Pembayaran</Text>

            {order.payment_proof_url ? (
              <View className="rounded-2xl overflow-hidden mb-4 border border-gray-200">
                <Image source={{ uri: order.payment_proof_url }} className="w-full h-56" resizeMode="contain" />
              </View>
            ) : (
              <View className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-4">
                <Text className="text-amber-700 font-medium text-sm text-center">
                  Bukti pembayaran belum diunggah oleh customer
                </Text>
              </View>
            )}

            <View className="flex-row space-x-3">
              <TouchableOpacity onPress={handleRejectPayment} className="flex-1 bg-red-50 py-3 rounded-xl items-center border border-red-200 mr-2">
                <Text className="text-red-600 font-bold">✕ Tolak</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleApprovePayment} className="flex-1 bg-green-500 py-3 rounded-xl items-center shadow-sm shadow-green-500/30">
                <Text className="text-white font-bold">✓ Terima & Verifikasi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Review Desain */}
        {isDesignReview && (
          <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100">
            <Text className="font-bold text-gray-900 text-base mb-3">🎨 Review Desain</Text>
            {order.design_file_url ? (
              <View className="rounded-2xl overflow-hidden mb-4 border border-gray-200 bg-gray-50 p-2">
                <Image source={{ uri: order.design_file_url }} className="w-full h-48" resizeMode="contain" />
              </View>
            ) : (
              <View className="bg-orange-50 p-4 rounded-xl border border-orange-200 mb-4">
                <Text className="text-orange-700 font-medium text-sm text-center">
                  ⚠️ Desain belum diunggah — customer minta jasa desain
                </Text>
              </View>
            )}
            <TouchableOpacity onPress={handleStartProduction} className="bg-blue-600 py-3 rounded-xl items-center shadow-sm shadow-blue-500/30">
              <Text className="text-white font-bold">▶ Mulai Produksi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selesai Produksi */}
        {isPrinting && (
          <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100">
            <Text className="font-bold text-gray-900 text-base mb-3">🖨️ Proses Produksi</Text>
            <View className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
              <Text className="text-blue-700 font-medium text-sm text-center">
                Produk sedang dalam proses cetak
              </Text>
            </View>
            <TouchableOpacity onPress={handleFinishProduction} className="bg-indigo-600 py-3 rounded-xl items-center shadow-sm shadow-indigo-500/30">
              <Text className="text-white font-bold">✓ Tandai Selesai Produksi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Detail Item Pesanan */}
        <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100">
          <Text className="font-bold text-gray-900 text-base mb-4">Detail Item Pesanan</Text>
          {order.items?.map((item: any, idx: number) => (
            <View key={idx} className="flex-row items-center pb-4 mb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
              <View className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden mr-3">
                <Image
                  source={{ uri: item.image || 'https://placehold.co/100?text=Produk' }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-sm">{item.product_name}</Text>
                <Text className="text-gray-500 text-xs mt-1">Material: {item.variant_name}</Text>
                <View className="flex-row mt-2 items-center">
                  <Text className="text-gray-600 text-xs font-medium bg-gray-100 px-2 py-0.5 rounded-full">Qty: {item.quantity}</Text>
                  <Text className="text-blue-600 text-xs font-bold ml-3">Rp {item.subtotal?.toLocaleString('id-ID')}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
