import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useProductStore } from '../../store/productStore';

export default function HomeScreen() {
  const { user, signOut } = useAuthStore();
  const { products, isLoading, fetchProducts } = useProductStore();
  const navigation = useNavigation<any>();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header Profile Section */}
      <View className="px-6 py-6 bg-white rounded-b-[32px] shadow-sm shadow-gray-200 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-gray-500 text-sm font-medium">Selamat Datang,</Text>
            <Text className="text-gray-900 text-2xl font-bold mt-1">
              {user?.name || user?.email?.split('@')[0] || 'Pelanggan'}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={signOut}
            className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center border border-blue-100"
          >
            <Text className="text-blue-600 font-bold text-lg">
              {(user?.name?.[0] || user?.email?.[0] || 'P').toUpperCase()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Banner Section */}
        <View className="bg-blue-600 rounded-3xl p-6 mb-8 shadow-lg shadow-blue-500/40 relative overflow-hidden">
          <View className="w-40 h-40 bg-white/10 rounded-full absolute -right-10 -top-10" />
          <View className="w-24 h-24 bg-white/10 rounded-full absolute -left-5 -bottom-5" />
          
          <Text className="text-white/80 text-sm font-semibold mb-1">Cetak Digital & Offset</Text>
          <Text className="text-white text-2xl font-bold w-2/3 mb-4">Mulai Proyek Cetak Anda Hari Ini</Text>
          
          <TouchableOpacity className="bg-white px-4 py-2 rounded-xl self-start">
            <Text className="text-blue-600 font-bold">Pesan Sekarang</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-lg font-bold text-gray-900 mb-4">Produk Kami</Text>
        
        {isLoading ? (
          <View className="py-10 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {products.map((product) => (
              <TouchableOpacity 
                key={product.id}
                onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                className="w-[48%] bg-white rounded-3xl mb-4 shadow-sm shadow-gray-200 overflow-hidden border border-gray-100"
              >
                <View className="h-32 bg-gray-100 relative">
                  <Image 
                    source={{ uri: product.image }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                  {!product.is_active && (
                    <View className="absolute inset-0 bg-black/50 items-center justify-center">
                      <Text className="text-white font-bold text-xs">Tidak Tersedia</Text>
                    </View>
                  )}
                </View>
                <View className="p-4">
                  <Text className="text-gray-800 font-bold" numberOfLines={1}>{product.name}</Text>
                  <Text className="text-blue-600 font-bold mt-1">Rp {product.base_price.toLocaleString('id-ID')}</Text>
                </View>
              </TouchableOpacity>
            ))}
            
            {products.length === 0 && !isLoading && (
              <View className="w-full py-10 items-center justify-center">
                <Text className="text-gray-500">Belum ada produk.</Text>
              </View>
            )}
          </View>
        )}

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
