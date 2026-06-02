import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Box, Package, Users, BarChart2, Repeat, FileText } from 'lucide-react-native';

import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

const formatCompactCurrency = (amount: number) => {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1).replace('.0', '')}jt`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}rb`;
  }
  return `Rp ${amount}`;
};

export default function AdminDashboardScreen() {
  const navigation = useNavigation<any>();
  const { user, switchRoleMode } = useAuthStore();
  const { 
    revenueData, fetchRevenueReport, reportsLoading 
  } = useAdminStore();

  useFocusEffect(
    useCallback(() => {
      fetchRevenueReport('month');
    }, [fetchRevenueReport])
  );

  const formattedDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());

  const revenueStats = useMemo(() => {
    let todayRev = 0;
    let monthRev = 0;
    let totalOrders = 0;

    const todayStr = new Date().toISOString().split('T')[0];

    if (Array.isArray(revenueData)) {
      revenueData.forEach((item: any) => {
        monthRev += item.total_revenue;
        totalOrders += item.total_orders;
        if (item.date && item.date.startsWith(todayStr)) {
          todayRev += item.total_revenue;
        }
      });
    }

    return { todayRev, monthRev, totalOrders };
  }, [revenueData]);

  return (
    <ScrollView 
      className="flex-1 bg-slate-50"
      refreshControl={<RefreshControl refreshing={reportsLoading} onRefresh={() => fetchRevenueReport('month')} />}
    >
      {/* Header */}
      <View className="bg-blue-600 pt-16 pb-8 px-6 rounded-b-3xl relative">
        <View className="flex-row justify-between items-start mb-1">
          <View>
            <Text className="text-white text-2xl font-bold">Halo, {user?.name?.split(' ')[0] || 'Owner'}!</Text>
            <Text className="text-blue-100 text-base">{formattedDate}</Text>
          </View>
          <TouchableOpacity 
            className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center border border-white/30"
            onPress={() => switchRoleMode('staff')}
          >
            <Repeat color="#ffffff" size={14} />
            <Text className="text-white text-xs font-bold ml-1.5">Mode Staff</Text>
          </TouchableOpacity>
        </View>
        
        {/* Revenue Cards */}
        <View className="flex-row justify-between mt-6">
          <View className="bg-white/20 p-4 rounded-2xl flex-1 mr-3 border border-white/10">
            <Text className="text-blue-100 text-xs mb-1 font-medium">Pendapatan Hari Ini</Text>
            <Text className="text-white text-2xl font-black">{formatCompactCurrency(revenueStats.todayRev)}</Text>
          </View>
          <View className="bg-white/20 p-4 rounded-2xl flex-1 border border-white/10">
            <Text className="text-blue-100 text-xs mb-1 font-medium">Bulan Ini</Text>
            <Text className="text-white text-2xl font-black">{formatCompactCurrency(revenueStats.monthRev)}</Text>
          </View>
        </View>

        <View className="mt-4 bg-white/10 p-3 rounded-xl border border-white/10 flex-row justify-between items-center">
           <Text className="text-blue-100 font-medium">Total Pesanan Bulan Ini</Text>
           <Text className="text-white font-bold text-lg">{revenueStats.totalOrders} Pesanan</Text>
        </View>
      </View>

      <View className="px-5 mt-6 pb-10">
        <Text className="text-lg font-bold text-slate-800 mb-4">Manajemen Sistem</Text>
        
        <View className="flex-row flex-wrap justify-between">
          <TouchableOpacity 
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100 items-center"
            onPress={() => navigation.navigate('AdminManageTab')}
          >
            <View className="bg-emerald-100 p-3 rounded-full mb-3">
              <Box color="#10B981" size={28} />
            </View>
            <Text className="text-slate-800 font-bold text-center">Kelola Produk</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100 items-center"
            onPress={() => navigation.navigate('AdminManageTab')}
          >
            <View className="bg-amber-100 p-3 rounded-full mb-3">
              <Package color="#F59E0B" size={28} />
            </View>
            <Text className="text-slate-800 font-bold text-center">Stok Material</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100 items-center"
            onPress={() => navigation.navigate('AdminManageTab')}
          >
            <View className="bg-purple-100 p-3 rounded-full mb-3">
              <Users color="#8B5CF6" size={28} />
            </View>
            <Text className="text-slate-800 font-bold text-center">Kelola Akun</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100 items-center"
            onPress={() => navigation.navigate('AdminReportsTab')}
          >
            <View className="bg-pink-100 p-3 rounded-full mb-3">
              <BarChart2 color="#EC4899" size={28} />
            </View>
            <Text className="text-slate-800 font-bold text-center">Laporan</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-[48%] bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100 items-center"
            onPress={() => navigation.navigate('AdminLogs')}
          >
            <View className="bg-slate-100 p-3 rounded-full mb-3">
              <FileText color="#475569" size={28} />
            </View>
            <Text className="text-slate-800 font-bold text-center">Log Sistem</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-full bg-white p-5 rounded-2xl mb-4 shadow-sm border border-slate-100 flex-row items-center justify-center"
            onPress={() => navigation.navigate('AdminOrders')}
          >
            <View className="bg-blue-100 p-2 rounded-full mr-3">
              <Package color="#2563EB" size={20} />
            </View>
            <Text className="text-slate-800 font-bold text-lg text-center">Daftar Semua Pesanan</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mt-2">
          <Text className="text-blue-800 font-semibold mb-1">Informasi</Text>
          <Text className="text-blue-600 text-sm leading-5">Untuk mengelola dan memverifikasi pesanan masuk, silakan beralih ke <Text className="font-bold">Mode Staff</Text> melalui tombol di kanan atas.</Text>
        </View>
      </View>
    </ScrollView>
  );
}
