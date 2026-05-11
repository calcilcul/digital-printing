import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProductStore } from '../../store/productStore';

export default function ProductManagementScreen() {
  const { products, isLoading, fetchProducts } = useProductStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 py-4 bg-white shadow-sm shadow-gray-200 z-10 flex-row justify-between items-center">
        <Text className="text-xl font-bold text-gray-900">Manajemen Produk</Text>
        <TouchableOpacity className="bg-emerald-600 px-4 py-2 rounded-xl">
          <Text className="text-white font-bold text-sm">+ Tambah</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {products.map((product) => (
            <View key={product.id} className="bg-white p-4 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100 flex-row items-center">
              <View className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden mr-4">
                <Image 
                  source={{ uri: product.image }} 
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{product.name}</Text>
                <Text className="text-emerald-600 font-bold mt-1">Rp {product.base_price.toLocaleString('id-ID')}</Text>
                <Text className={`text-xs mt-2 font-bold ${product.is_active ? 'text-green-600' : 'text-red-500'}`}>
                  {product.is_active ? 'Aktif' : 'Nonaktif'}
                </Text>
              </View>
              <TouchableOpacity className="bg-gray-100 p-3 rounded-xl ml-2">
                <Text className="text-gray-700 font-bold">Edit</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
