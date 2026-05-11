import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useProductStore } from '../../store/productStore';
import { useCartStore } from '../../store/cartStore';

export default function ProductDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { productId } = route.params || {};
  
  const { getProductById } = useProductStore();
  const { addItem, isLoading } = useCartStore();
  
  const product = getProductById(productId);
  
  const [selectedVariant, setSelectedVariant] = useState(product?.variants?.[0]?.id || 0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <Text className="text-gray-500">Produk tidak ditemukan</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="mt-4 bg-blue-600 px-4 py-2 rounded-xl">
          <Text className="text-white font-bold">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentVariantInfo = product.variants.find(v => v.id === selectedVariant) || product.variants[0];
  const price = currentVariantInfo ? currentVariantInfo.price : product.base_price;

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      Alert.alert('Info', 'Silakan pilih varian material terlebih dahulu');
      return;
    }
    
    const notes = JSON.stringify({ Material: currentVariantInfo?.variant_name });
    const success = await addItem(product.id, selectedVariant, quantity, notes);
    
    if (success) {
      Alert.alert('Sukses', 'Produk berhasil ditambahkan ke keranjang', [
        { text: 'Lanjut Belanja', onPress: () => navigation.goBack() },
        { text: 'Lihat Keranjang', onPress: () => navigation.navigate('Keranjang') }
      ]);
    } else {
      Alert.alert('Gagal', 'Gagal menambahkan ke keranjang');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 bg-white flex-row items-center shadow-sm shadow-gray-200 z-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-100">
          <Text className="text-xl font-bold text-gray-700">←</Text>
        </TouchableOpacity>
        <Text className="flex-1 text-center font-bold text-lg text-gray-900 mr-10">Detail Produk</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="w-full h-72 bg-white">
          <Image 
            source={{ uri: product.image }} 
            className="w-full h-full"
            resizeMode="cover"
          />
        </View>

        <View className="p-6 bg-white rounded-t-3xl -mt-6 shadow-sm shadow-gray-200">
          <View className="flex-row justify-between items-start mb-2">
            <Text className="text-2xl font-bold text-gray-900 flex-1">{product.name}</Text>
            <Text className="text-xl font-bold text-blue-600 ml-4">
              Rp {price.toLocaleString('id-ID')}
            </Text>
          </View>
          
          <Text className="text-gray-500 mb-6 leading-relaxed">
            {product.description || 'Deskripsi produk tidak tersedia.'}
          </Text>

          <Text className="font-bold text-gray-900 mb-3 text-base">Pilih Varian Material</Text>
          <View className="flex-row flex-wrap mb-6">
            {product.variants.map((v) => (
              <TouchableOpacity 
                key={v.id}
                onPress={() => setSelectedVariant(v.id)}
                className={`mr-3 mb-3 px-4 py-3 rounded-xl border ${
                  selectedVariant === v.id 
                    ? 'border-blue-600 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Text className={`font-semibold ${selectedVariant === v.id ? 'text-blue-700' : 'text-gray-700'}`}>
                  {v.variant_name}
                </Text>
                <Text className={`text-xs mt-1 ${selectedVariant === v.id ? 'text-blue-600' : 'text-gray-500'}`}>
                  Rp {v.price.toLocaleString('id-ID')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl mb-8 border border-gray-100">
            <Text className="font-bold text-gray-700">Kuantitas</Text>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm shadow-gray-100"
              >
                <Text className="text-xl font-bold text-gray-600">-</Text>
              </TouchableOpacity>
              <Text className="mx-6 font-bold text-lg text-gray-900">{quantity}</Text>
              <TouchableOpacity 
                onPress={() => setQuantity(quantity + 1)}
                className="w-10 h-10 bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm shadow-gray-100"
              >
                <Text className="text-xl font-bold text-gray-600">+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            onPress={handleAddToCart}
            disabled={isLoading || !product.is_active}
            className={`w-full py-4 rounded-2xl items-center shadow-md ${
              (!product.is_active || isLoading) ? 'bg-gray-400' : 'bg-blue-600 shadow-blue-500/30 active:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {!product.is_active ? 'Tidak Tersedia' : 'Tambah ke Keranjang'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
