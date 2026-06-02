import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import { axiosClient } from '../../api/axiosClient';
import { ShoppingBag, Trash2, ArrowLeft, Minus, Plus } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { useCartStore } from '../../store/cartStore';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function CartScreen() {
  const { token } = useAuthStore();
  const navigation = useNavigation();
  const { items, totalPrice, isLoading, fetchCart } = useCartStore();
  const [isRemoving, setIsRemoving] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, [token, fetchCart]);

  const handleRemove = async (itemId: number) => {
    setIsRemoving(true);
    try {
      await axiosClient.delete('/api/cart', { data: { cart_item_id: itemId } });
      await fetchCart();
      Toast.show({
        type: 'success',
        text1: 'Item dihapus dari keranjang.',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.message || 'Gagal menghapus item',
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(itemId);
    try {
      await axiosClient.put('/api/cart', { cart_item_id: itemId, quantity: newQuantity });
      await fetchCart();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.response?.data?.error || 'Gagal mengupdate kuantitas',
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleCheckout = async () => {
    try {
      await axiosClient.post('/api/checkout');
      await fetchCart();
      Toast.show({
        type: 'success',
        text1: 'Pesanan berhasil dibuat!',
        text2: 'Silakan lakukan pembayaran.',
      });
      // Navigate to orders
      (navigation as any).navigate('OrdersTab');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Checkout gagal',
        text2: error?.response?.data?.error || error?.response?.data?.message || 'Periksa koneksi atau stok produk.',
      });
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white p-4 mb-3 rounded-2xl border border-slate-100 shadow-sm flex-row items-center">
      <View className="flex-1">
        <Text className="font-bold text-slate-800 text-base">{item.product_name}</Text>
        <Text className="text-blue-600 text-sm mb-2">{item.variant_name}</Text>
        <Text className="font-bold text-slate-800 mb-2">
          {formatCurrency(item.subtotal || item.quantity * item.price)}
        </Text>
        
        <View className="flex-row items-center">
          <View className="flex-row items-center border border-slate-200 rounded-lg overflow-hidden">
            <TouchableOpacity 
              onPress={() => handleUpdateQuantity(item.cart_item_id, item.quantity - 1)}
              disabled={updatingItemId === item.cart_item_id || item.quantity <= 1}
              className="px-3 py-1.5 bg-slate-50 active:bg-slate-100"
            >
              <Minus size={16} color={item.quantity > 1 ? "#475569" : "#cbd5e1"} />
            </TouchableOpacity>
            <View className="px-3 py-1.5 border-x border-slate-200 bg-white min-w-[32px] items-center">
              {updatingItemId === item.cart_item_id ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text className="font-bold text-sm text-slate-800">{item.quantity}</Text>
              )}
            </View>
            <TouchableOpacity 
              onPress={() => handleUpdateQuantity(item.cart_item_id, item.quantity + 1)}
              disabled={updatingItemId === item.cart_item_id}
              className="px-3 py-1.5 bg-slate-50 active:bg-slate-100"
            >
              <Plus size={16} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <TouchableOpacity 
        onPress={() => handleRemove(item.cart_item_id)}
        disabled={isRemoving}
        className="ml-4 w-10 h-10 bg-red-50 rounded-full items-center justify-center"
      >
        <Trash2 size={20} color={isRemoving ? "#fca5a5" : "#ef4444"} />
      </TouchableOpacity>
    </View>
  );

  if (!token) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center p-6">
        <View className="absolute top-12 left-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <ArrowLeft size={24} color="#475569" />
          </TouchableOpacity>
        </View>
        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
          <ShoppingBag size={40} color="#2563eb" />
        </View>
        <Text className="text-2xl font-bold text-slate-800 mb-2">Belum Masuk</Text>
        <Text className="text-slate-500 text-center mb-8">
          Silakan masuk atau buat akun baru untuk melihat dan memproses keranjang Anda.
        </Text>
        <TouchableOpacity 
          onPress={() => (navigation as any).navigate('Auth', { screen: 'Login' })}
          className="bg-blue-600 w-full py-4 rounded-xl items-center mb-3"
        >
          <Text className="text-white font-bold text-lg">Masuk Akun</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <View className="pt-12 pb-4 px-4 bg-white border-b border-slate-100 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
          <ArrowLeft size={24} color="#0f172a" />
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-slate-800 flex-1">Keranjang</Text>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-700 font-bold">{items.length} item</Text>
        </View>
      </View>

      {isLoading && items.length === 0 ? (
        <View className="flex-1 justify-center items-center bg-slate-50">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item, index) => item?.cart_item_id ? item.cart_item_id.toString() : index.toString()}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 16 }}
            ListEmptyComponent={
              <View className="flex-1 justify-center items-center pt-20">
                <ShoppingBag size={64} color="#cbd5e1" className="mb-4" />
                <Text className="text-slate-500 text-lg">Keranjang Anda masih kosong</Text>
              </View>
            }
          />

          {items.length > 0 && (
            <View className="bg-white p-6 border-t border-slate-100 pb-8">
              <View className="flex-row justify-between mb-4">
                <Text className="text-slate-500 text-base">Total Pembayaran</Text>
                <Text className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalPrice)}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={handleCheckout}
                className="w-full bg-blue-600 py-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold text-lg">Checkout Sekarang</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}
