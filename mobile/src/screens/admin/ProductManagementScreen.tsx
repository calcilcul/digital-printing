import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, Alert, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, Plus, Edit2, Trash2, Box, ArrowLeft, Package } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useAdminStore } from '../../store/adminStore';
import adminApi from '../../services/adminApi';

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(n);

export default function ProductManagementScreen() {
  const navigation = useNavigation<any>();
  const { products, productsLoading, fetchProducts } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [fetchProducts])
  );

  const filteredProducts = useMemo(() => {
    let filtered = products || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(q)) || 
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    // Sort by id descending
    return filtered.sort((a, b) => b.id - a.id);
  }, [products, searchQuery]);

  const handleDelete = (product: any) => {
    const proceedDelete = async () => {
      setActionLoading(true);
      try {
        await adminApi.deleteProduct(product.id);
        await fetchProducts();
        if (Platform.OS === 'web') Toast.show({ type: 'success', text1: 'Produk berhasil dihapus.' });
      } catch (error: any) {
        console.error('Delete product error:', error);
        if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Gagal menghapus produk.' });
        else Alert.alert('Error', 'Gagal menghapus produk.');
      } finally {
        setActionLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Yakin ingin menghapus produk ${product.name}?`)) {
        proceedDelete();
      }
    } else {
      Alert.alert('Hapus Produk', `Yakin ingin menghapus produk ${product.name}?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: proceedDelete }
      ]);
    }
  };

  const renderProductItem = ({ item }: { item: any }) => {
    const variantCount = item.variants?.length || 0;

    return (
      <View className={`bg-white p-4 mb-3 border ${!item.is_active ? 'border-slate-200 bg-slate-50' : 'border-slate-100'} rounded-2xl shadow-sm`}>
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <View className={`p-2.5 rounded-xl mr-3 ${item.is_active ? 'bg-blue-100' : 'bg-slate-200'}`}>
              <Box color={item.is_active ? "#2563eb" : "#64748b"} size={20} />
            </View>
            <View className="flex-1">
              <Text className={`font-bold text-base ${!item.is_active ? 'text-slate-500' : 'text-slate-800'}`}>
                {item.name}
              </Text>
              <Text className="text-blue-600 text-xs font-semibold">{item.category || 'Tanpa Kategori'}</Text>
            </View>
          </View>

          <View className={`px-2.5 py-1 rounded-full ${item.is_active ? 'bg-emerald-100' : 'bg-slate-200'}`}>
            <Text className={`text-[10px] font-bold ${item.is_active ? 'text-emerald-700' : 'text-slate-600'}`}>
              {item.is_active ? 'AKTIF' : 'NONAKTIF'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <View>
            <Text className="text-slate-400 text-xs font-medium mb-0.5">Mulai dari</Text>
            <Text className="text-slate-700 font-bold">{formatRupiah(item.base_price)}</Text>
          </View>

          <View className="items-center mr-6">
            <Text className="text-slate-400 text-xs font-medium mb-0.5">Varian</Text>
            <View className="flex-row items-center">
              <Package color="#94a3b8" size={12} />
              <Text className="text-slate-600 font-bold ml-1">{variantCount}</Text>
            </View>
          </View>
          
          <View className="flex-row">
            <TouchableOpacity 
              className="bg-slate-100 w-9 h-9 rounded-full items-center justify-center mr-2"
              onPress={() => navigation.navigate('ProductForm', { product: item })}
            >
              <Edit2 color="#475569" size={16} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-red-50 w-9 h-9 rounded-full items-center justify-center"
              onPress={() => handleDelete(item)}
              disabled={actionLoading}
            >
              <Trash2 color="#dc2626" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 pt-12">
      {/* Header */}
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <ArrowLeft color="#334155" size={24} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-slate-800">Kelola Produk</Text>
        </View>
        
        <TouchableOpacity 
          className="bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-sm"
          onPress={() => navigation.navigate('ProductForm')}
        >
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <Search color="#94a3b8" size={20} />
          <TextInput
            className="flex-1 ml-2 text-slate-800"
            placeholder="Cari nama produk atau kategori..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderProductItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={productsLoading} onRefresh={fetchProducts} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Box color="#cbd5e1" size={48} />
            <Text className="text-slate-500 text-base mt-4 font-medium">Belum ada produk yang ditambahkan.</Text>
            <TouchableOpacity 
              className="bg-blue-600 px-4 py-2 rounded-lg mt-4"
              onPress={() => navigation.navigate('ProductForm')}
            >
              <Text className="text-white font-bold">Tambah Produk</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}
