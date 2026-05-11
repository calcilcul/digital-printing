import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useProductStore } from '../../store/productStore';

export default function CatalogScreen() {
  const navigation = useNavigation<any>();
  const { products, isLoading, fetchProducts } = useProductStore();
  const [search, setSearch] = React.useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-3 bg-white shadow-sm shadow-gray-200 z-10">
        <Text className="text-2xl font-bold text-gray-900 mb-3">Katalog Produk</Text>
        <TextInput
          className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 text-base border border-gray-200"
          placeholder="🔍  Cari produk..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-4xl mb-4">🔎</Text>
              <Text className="text-gray-500 font-medium">Produk tidak ditemukan</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {filtered.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
                  className="bg-white rounded-3xl mb-4 overflow-hidden shadow-sm shadow-gray-200 border border-gray-100"
                  style={{ width: '48%' }}
                >
                  <View className="w-full h-36 bg-gray-100">
                    <Image
                      source={{ uri: product.image }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  </View>
                  <View className="p-3">
                    <Text className="font-bold text-gray-900 text-sm" numberOfLines={2}>{product.name}</Text>
                    <Text className="text-blue-600 font-bold text-sm mt-1">
                      Rp {product.base_price.toLocaleString('id-ID')}
                    </Text>
                    {!product.is_active && (
                      <Text className="text-red-500 text-xs font-bold mt-1">Tidak Tersedia</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
