import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import Toast from 'react-native-toast-message';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, ShoppingCart, Minus, Plus } from 'lucide-react-native';
import { axiosClient } from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const productId = route.params?.productId;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const { token } = useAuthStore();
  const { totalItems, fetchCart } = useCartStore();

  useEffect(() => {
    if (token) fetchCart();
  }, [token, fetchCart]);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const res = await axiosClient.get(`/products`);
        const p = res.data.data?.find((item: any) => item.id === productId) || res.data?.products?.find((item: any) => item.id === productId);
        setProduct(p);
        if (p?.variants?.length > 0) {
          setSelectedVariant(p.variants[0]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductDetail();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!token) {
      (navigation as any).navigate('Auth', { screen: 'Login' });
      return;
    }
    if (!selectedVariant) {
      Toast.show({
        type: 'error',
        text1: 'Perhatian',
        text2: 'Silakan pilih varian produk terlebih dahulu.',
      });
      return;
    }
    try {
      await axiosClient.post('/api/cart', {
        product_id: product.id,
        variant_id: selectedVariant.id,
        quantity: quantity,
        notes: notes
      });
      await fetchCart();
      Toast.show({
        type: 'success',
        text1: 'Berhasil ditambahkan ke keranjang!',
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Gagal',
        text2: error?.response?.data?.error || error?.message || 'Gagal menambahkan item. Coba lagi.',
      });
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      (navigation as any).navigate('Auth', { screen: 'Login' });
      return;
    }
    if (!selectedVariant) {
      Toast.show({
        type: 'error',
        text1: 'Perhatian',
        text2: 'Silakan pilih varian produk terlebih dahulu.',
      });
      return;
    }
    try {
      const res = await axiosClient.post('/api/buy-now', {
        product_id: product.id,
        variant_id: selectedVariant.id,
        quantity: quantity,
        notes: notes
      });
      Toast.show({
        type: 'success',
        text1: 'Berhasil',
        text2: 'Pesanan berhasil dibuat!',
      });
      (navigation as any).replace('OrderDetail', { 
        orderId: res.data.data?.id || res.data.order_id 
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Gagal',
        text2: error?.response?.data?.error || 'Gagal membuat order',
      });
    }
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <Text className="text-slate-500">Produk tidak ditemukan</Text>
      </View>
    );
  }

  const imageUrl = product.image_url
    ? product.image_url.startsWith('http')
      ? product.image_url
      : `http://localhost:8000${product.image_url}`
    : null;

  const currentPrice = selectedVariant ? selectedVariant.price : (product.base_price || 0);
  const subtotal = currentPrice * quantity;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Image Section */}
        <View className="w-full h-80 bg-slate-200 relative">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full items-center justify-center bg-slate-200">
              <Text className="text-slate-400">No Image</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="absolute top-12 left-4 w-10 h-10 rounded-full bg-black/30 items-center justify-center backdrop-blur-md"
          >
            <ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View className="px-4 py-5 bg-white mb-2">
          <View className="bg-blue-50 self-start px-3 py-1 rounded-full mb-2">
            <Text className="text-blue-600 font-bold text-xs">{product.category || 'Produk'}</Text>
          </View>
          <Text className="text-2xl font-bold text-slate-800 mb-2">{product.name}</Text>
          <Text className="text-slate-500 leading-6">{product.description || 'Tidak ada deskripsi tersedia untuk produk ini.'}</Text>
        </View>

        {/* Variants Section */}
        {product.variants && product.variants.length > 0 && (
          <View className="px-4 py-5 bg-white mb-2">
            <Text className="font-bold text-slate-800 text-base mb-3">Pilih Varian</Text>
            <View className="flex-row flex-wrap gap-2">
              {product.variants.map((v: any) => {
                const isSelected = selectedVariant?.id === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    onPress={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl border ${isSelected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white'}`}
                  >
                    <Text className={`font-semibold ${isSelected ? 'text-blue-600' : 'text-slate-600'}`}>{v.name || v.variant_name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Quantity Section */}
        <View className="px-4 py-5 bg-white mb-2">
          <Text className="font-bold text-slate-800 text-base mb-3">Kuantitas</Text>
          <View className="flex-row items-center border border-slate-200 rounded-xl self-start overflow-hidden">
            <TouchableOpacity onPress={decrementQuantity} className="p-3 bg-slate-50 active:bg-slate-100">
              <Minus size={20} color={quantity > 1 ? '#475569' : '#cbd5e1'} />
            </TouchableOpacity>
            <View className="px-6 py-2 border-x border-slate-200 bg-white">
              <Text className="font-bold text-lg text-slate-800">{quantity}</Text>
            </View>
            <TouchableOpacity onPress={incrementQuantity} className="p-3 bg-slate-50 active:bg-slate-100">
              <Plus size={20} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Notes Section */}
        <View className="px-4 py-5 bg-white mb-2">
          <Text className="font-bold text-slate-800 text-base mb-3">Catatan (Opsional)</Text>
          <TextInput
            className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 min-h-[100px]"
            placeholder="Ukuran custom, instruksi cetak, dll."
            placeholderTextColor="#94a3b8"
            multiline
            textAlignVertical="top"
            value={notes}
            onChangeText={setNotes}
            style={{ outlineStyle: 'none' } as any}
          />
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-4 py-4 pb-8 flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-slate-500 text-xs mb-1">Subtotal</Text>
          <Text className="text-blue-600 font-bold text-xl">{formatCurrency(subtotal)}</Text>
        </View>
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handleAddToCart}
            className="bg-blue-50 border border-blue-200 p-3 rounded-xl justify-center items-center"
          >
            <ShoppingCart size={24} color="#2563eb" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBuyNow}
            className="bg-blue-600 px-6 py-3 rounded-xl justify-center items-center"
          >
            <Text className="text-white font-bold text-base">Beli Sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
