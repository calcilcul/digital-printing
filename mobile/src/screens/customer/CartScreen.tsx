import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';

export default function CartScreen() {
  const navigation = useNavigation<any>();
  const { items, isLoading, fetchCart, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const { checkout, isLoading: isCheckoutLoading } = useOrderStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      Alert.alert('Info', 'Keranjang Anda kosong');
      return;
    }

    const orderId = await checkout();
    if (orderId) {
      Alert.alert('Sukses', 'Pesanan berhasil dibuat!', [
        { 
          text: 'Lihat Pesanan', 
          onPress: () => {
            fetchCart(); // Refresh cart (should be empty now)
            navigation.navigate('OrderDetail', { orderId: orderId });
          } 
        }
      ]);
    } else {
      Alert.alert('Gagal', 'Terjadi kesalahan saat membuat pesanan');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white shadow-sm shadow-gray-200 z-10 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-gray-900">Keranjang</Text>
        <Text className="text-gray-500 font-medium">{items.length} item</Text>
      </View>

      {isLoading && items.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : items.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">🛒</Text>
          </View>
          <Text className="text-xl font-bold text-gray-800 mb-2">Keranjang Kosong</Text>
          <Text className="text-gray-500 text-center mb-8">Anda belum menambahkan produk apapun ke dalam keranjang.</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Beranda')}
            className="bg-blue-600 px-6 py-3 rounded-xl shadow-md shadow-blue-500/30"
          >
            <Text className="text-white font-bold">Mulai Belanja</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
            {items.map((item) => (
              <View key={item.id} className="bg-white p-4 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100 flex-row">
                <View className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden mr-4">
                  <Image 
                    source={{ uri: item.image }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
                
                <View className="flex-1 justify-between">
                  <View>
                    <View className="flex-row justify-between items-start">
                      <Text className="text-gray-900 font-bold text-base flex-1 mr-2" numberOfLines={2}>
                        {item.name}
                      </Text>
                      <TouchableOpacity onPress={() => removeItem(item.id)} className="p-1 bg-red-50 rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-red-500 font-bold text-xs">✕</Text>
                      </TouchableOpacity>
                    </View>
                    <Text className="text-gray-500 text-xs mt-1">
                      Material: {item.options?.Material || 'Standar'}
                    </Text>
                  </View>
                  
                  <View className="flex-row justify-between items-end mt-2">
                    <Text className="text-blue-600 font-bold">
                      Rp {item.price.toLocaleString('id-ID')}
                    </Text>
                    
                    <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Text className="text-gray-600 font-bold">-</Text>
                      </TouchableOpacity>
                      <Text className="mx-2 font-bold text-sm text-gray-800 w-4 text-center">{item.quantity}</Text>
                      <TouchableOpacity 
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 items-center justify-center"
                      >
                        <Text className="text-gray-600 font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <View className="h-24" />
          </ScrollView>

          {/* Checkout Footer */}
          <View className="bg-white px-6 py-5 rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-500 font-medium">Total Harga</Text>
              <Text className="text-2xl font-bold text-gray-900">
                Rp {getCartTotal().toLocaleString('id-ID')}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleCheckout}
              disabled={isCheckoutLoading}
              className={`w-full py-4 rounded-2xl items-center shadow-md ${
                isCheckoutLoading ? 'bg-gray-400' : 'bg-blue-600 shadow-blue-500/30 active:bg-blue-700'
              }`}
            >
              {isCheckoutLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg tracking-wide">Checkout Sekarang</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}
