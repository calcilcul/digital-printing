import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Box, Package, Users, ChevronRight } from 'lucide-react-native';

export default function AdminManageScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="bg-blue-600 pt-12 pb-6 px-6 rounded-b-3xl mb-4">
        <Text className="text-white text-2xl font-bold">Menu Kelola</Text>
        <Text className="text-blue-100 text-sm mt-1">Pilih menu manajemen untuk mengatur data sistem</Text>
      </View>

      <ScrollView className="px-5 pt-2">
        <TouchableOpacity 
          className="bg-white p-5 rounded-2xl mb-4 border border-slate-100 flex-row items-center justify-between shadow-sm"
          onPress={() => navigation.navigate('ProductManagement')}
        >
          <View className="flex-row items-center flex-1 pr-4">
            <View className="bg-emerald-100 p-4 rounded-xl">
              <Box color="#10B981" size={32} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-slate-800 mb-1">Kelola Produk</Text>
              <Text className="text-sm text-slate-500 leading-tight">Tambah, ubah, atau nonaktifkan produk & varian harga</Text>
            </View>
          </View>
          <ChevronRight color="#cbd5e1" size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white p-5 rounded-2xl mb-4 border border-slate-100 flex-row items-center justify-between shadow-sm"
          onPress={() => navigation.navigate('MaterialManagement')}
        >
          <View className="flex-row items-center flex-1 pr-4">
            <View className="bg-amber-100 p-4 rounded-xl">
              <Package color="#F59E0B" size={32} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-slate-800 mb-1">Stok Material</Text>
              <Text className="text-sm text-slate-500 leading-tight">Pantau dan sesuaikan jumlah stok bahan baku percetakan</Text>
            </View>
          </View>
          <ChevronRight color="#cbd5e1" size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white p-5 rounded-2xl mb-4 border border-slate-100 flex-row items-center justify-between shadow-sm"
          onPress={() => navigation.navigate('UserManagement')}
        >
          <View className="flex-row items-center flex-1 pr-4">
            <View className="bg-purple-100 p-4 rounded-xl">
              <Users color="#8B5CF6" size={32} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-slate-800 mb-1">Kelola Pengguna</Text>
              <Text className="text-sm text-slate-500 leading-tight">Manajemen akun staff dan customer, tambah staff baru</Text>
            </View>
          </View>
          <ChevronRight color="#cbd5e1" size={24} />
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white p-5 rounded-2xl mb-4 border border-slate-100 flex-row items-center justify-between shadow-sm"
          onPress={() => navigation.navigate('AdminOrders')}
        >
          <View className="flex-row items-center flex-1 pr-4">
            <View className="bg-blue-100 p-4 rounded-xl">
              <Package color="#2563EB" size={32} />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-slate-800 mb-1">Daftar Pesanan</Text>
              <Text className="text-sm text-slate-500 leading-tight">Pantau seluruh riwayat pesanan (Selesai, Batal, dll)</Text>
            </View>
          </View>
          <ChevronRight color="#cbd5e1" size={24} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
