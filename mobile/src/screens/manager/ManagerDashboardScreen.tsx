import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

export default function ManagerDashboardScreen() {
  const { reports, isLoading, fetchReports } = useAdminStore();
  const { user, signOut } = useAuthStore();

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 py-4 bg-white shadow-sm shadow-gray-200 z-10 flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-bold text-gray-900">Dashboard Manager</Text>
          <Text className="text-sm text-gray-500">Halo, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={signOut} className="bg-red-50 px-4 py-2 rounded-xl">
          <Text className="text-red-600 font-bold text-sm">Keluar</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {/* Laporan Omzet */}
          <Text className="text-lg font-bold text-gray-900 mb-3">Laporan Pendapatan</Text>
          {reports.revenue && reports.revenue.length > 0 ? (
            reports.revenue.map((rev, index) => (
              <View key={index} className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100 flex-row justify-between items-center">
                <Text className="text-gray-600 font-semibold">{rev.date}</Text>
                <Text className="text-emerald-600 font-bold text-lg">Rp {rev.total_revenue?.toLocaleString('id-ID')}</Text>
              </View>
            ))
          ) : (
            <View className="bg-white p-5 rounded-3xl mb-6 shadow-sm shadow-gray-200 border border-gray-100 items-center">
              <Text className="text-gray-500">Belum ada data pendapatan.</Text>
            </View>
          )}

          {/* Laporan Produk Terlaris */}
          <Text className="text-lg font-bold text-gray-900 mb-3 mt-4">Produk Terlaris</Text>
          {reports.topProducts && reports.topProducts.length > 0 ? (
            reports.topProducts.map((prod, index) => (
              <View key={index} className="bg-white p-5 rounded-3xl mb-3 shadow-sm shadow-gray-200 border border-gray-100">
                <View className="flex-row justify-between">
                  <Text className="font-bold text-gray-900 flex-1">{prod.product_name}</Text>
                  <Text className="text-blue-600 font-bold">Terjual: {prod.total_sold}</Text>
                </View>
                <Text className="text-gray-500 text-sm mt-2">
                  Total Pendapatan: Rp {prod.total_revenue?.toLocaleString('id-ID')}
                </Text>
              </View>
            ))
          ) : (
            <View className="bg-white p-5 rounded-3xl mb-6 shadow-sm shadow-gray-200 border border-gray-100 items-center">
              <Text className="text-gray-500">Belum ada data produk terjual.</Text>
            </View>
          )}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
