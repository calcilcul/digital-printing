import React, { useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Clock, Wallet, FileCheck, Printer, Package, ArrowRight } from 'lucide-react-native';

import { useStaffStore } from '../../store/staffStore';
import { useAuthStore } from '../../store/authStore';
import { StaffTabParamList, StaffStackParamList } from '../../navigation/StaffTabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import StaffStatusBadge from '../../components/StaffStatusBadge';
import { Repeat } from 'lucide-react-native';

type DashboardNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<StaffTabParamList, 'DashboardTab'>,
  NativeStackNavigationProp<StaffStackParamList>
>;

export default function StaffDashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { user, activeRoleMode, switchRoleMode } = useAuthStore();
  const { orders, isLoading, fetchOrders } = useStaffStore();

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const formattedDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());

  const stats = useMemo(() => {
    return {
      payment: orders.filter(o => o.status === 'payment_verification').length,
      design: orders.filter(o => o.status === 'design_review').length,
      printing: orders.filter(o => o.status === 'printing').length,
      ready: orders.filter(o => o.status === 'ready').length,
    };
  }, [orders]);

  const urgentOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'payment_verification' || o.status === 'design_review')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .slice(0, 5);
  }, [orders]);

  const getRelativeTime = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins} menit lalu`;
    }
    if (hours < 24) return `${hours} jam lalu`;
    return new Intl.DateTimeFormat('id-ID').format(new Date(dateString));
  };

  return (
    <ScrollView 
      className="flex-1 bg-slate-50"
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOrders} />}
    >
      {/* Header */}
      <View className="bg-blue-600 pt-16 pb-8 px-6 rounded-b-3xl relative">
        <View className="flex-row justify-between items-start mb-1">
          <View>
            <Text className="text-white text-2xl font-bold">Halo, {user?.name?.split(' ')[0] || 'Staff'}!</Text>
            <Text className="text-blue-100 text-base">{formattedDate}</Text>
          </View>
          {user?.role?.toLowerCase() === 'owner' && (
            <TouchableOpacity 
              className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center border border-white/30"
              onPress={() => switchRoleMode('admin')}
            >
              <Repeat color="#ffffff" size={14} />
              <Text className="text-white text-xs font-bold ml-1.5">Mode Admin</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="px-5 -mt-6">
        {/* Stat Cards 2x2 */}
        <View className="flex-row flex-wrap justify-between">
          {/* Card 1 */}
          <TouchableOpacity 
            className="w-[48%] bg-[#FAEEDA] p-4 rounded-xl mb-4 shadow-sm"
            onPress={() => navigation.navigate('OrdersTab', { filter: 'payment_verification' })}
          >
            <View className="flex-row items-center mb-2">
              <Wallet color="#633806" size={24} />
              <Text className="text-2xl font-bold text-[#633806] ml-2">{stats.payment}</Text>
            </View>
            <Text className="text-[#633806] font-semibold text-sm">Perlu Verifikasi</Text>
          </TouchableOpacity>

          {/* Card 2 */}
          <TouchableOpacity 
            className="w-[48%] bg-[#E6F1FB] p-4 rounded-xl mb-4 shadow-sm"
            onPress={() => navigation.navigate('OrdersTab', { filter: 'design_review' })}
          >
            <View className="flex-row items-center mb-2">
              <FileCheck color="#0C447C" size={24} />
              <Text className="text-2xl font-bold text-[#0C447C] ml-2">{stats.design}</Text>
            </View>
            <Text className="text-[#0C447C] font-semibold text-sm">Review Desain</Text>
          </TouchableOpacity>

          {/* Card 3 */}
          <TouchableOpacity 
            className="w-[48%] bg-blue-600 p-4 rounded-xl mb-4 shadow-sm"
            onPress={() => navigation.navigate('OrdersTab', { filter: 'printing' })}
          >
            <View className="flex-row items-center mb-2">
              <Printer color="#ffffff" size={24} />
              <Text className="text-2xl font-bold text-white ml-2">{stats.printing}</Text>
            </View>
            <Text className="text-white font-semibold text-sm">Sedang Dicetak</Text>
          </TouchableOpacity>

          {/* Card 4 */}
          <TouchableOpacity 
            className="w-[48%] bg-[#EAF3DE] p-4 rounded-xl mb-4 shadow-sm"
            onPress={() => navigation.navigate('OrdersTab', { filter: 'ready' })}
          >
            <View className="flex-row items-center mb-2">
              <Package color="#27500A" size={24} />
              <Text className="text-2xl font-bold text-[#27500A] ml-2">{stats.ready}</Text>
            </View>
            <Text className="text-[#27500A] font-semibold text-sm">Siap Diambil</Text>
          </TouchableOpacity>
        </View>

        {/* Shortcuts */}
        <Text className="text-lg font-bold text-slate-800 mb-3 mt-2">Jalan Pintas</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <TouchableOpacity 
            className="bg-white px-4 py-3 rounded-xl mr-3 flex-row items-center border border-slate-200"
            onPress={() => navigation.navigate('OrdersTab', { filter: 'payment_verification' })}
          >
            <Wallet color="#633806" size={20} />
            <Text className="ml-2 text-slate-700 font-medium">Verifikasi Bayar</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-white px-4 py-3 rounded-xl mr-3 flex-row items-center border border-slate-200"
            onPress={() => navigation.navigate('OrdersTab', { filter: 'design_review' })}
          >
            <FileCheck color="#0C447C" size={20} />
            <Text className="ml-2 text-slate-700 font-medium">Review Desain</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="bg-white px-4 py-3 rounded-xl mr-3 flex-row items-center border border-slate-200"
            onPress={() => navigation.navigate('ProductionTab')}
          >
            <Printer color="#1A56E8" size={20} />
            <Text className="ml-2 text-slate-700 font-medium">Antrian Cetak</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Urgent Orders */}
        <View className="flex-row justify-between items-end mb-3">
          <Text className="text-lg font-bold text-slate-800">Butuh Aksi Segera</Text>
          <TouchableOpacity onPress={() => navigation.navigate('OrdersTab', { filter: 'action_needed' })}>
            <Text className="text-blue-600 font-medium">Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {urgentOrders.length === 0 ? (
          <View className="bg-white p-6 rounded-2xl items-center border border-slate-100 mb-8">
            <Text className="text-slate-500 text-center">Semua pesanan sudah ditangani 🎉</Text>
          </View>
        ) : (
          <View className="bg-white rounded-2xl border border-slate-100 mb-8 overflow-hidden">
            {urgentOrders.map((order, index) => (
              <TouchableOpacity 
                key={order.id}
                className={`p-4 flex-row items-center justify-between ${index !== urgentOrders.length - 1 ? 'border-b border-slate-100' : ''}`}
                onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
              >
                <View className="flex-1">
                  <View className="flex-row items-center mb-1.5 justify-between pr-4">
                    <Text className="font-bold text-slate-800 text-base">{order.order_code}</Text>
                    <StaffStatusBadge status={order.status} />
                  </View>
                  <Text className="text-slate-500 text-sm mb-2">{order.customer_name || order.user?.name || 'Customer'}</Text>
                  <View className="flex-row items-center">
                    <Clock color="#94a3b8" size={14} />
                    <Text className="text-slate-400 text-xs ml-1">{getRelativeTime(order.created_at)}</Text>
                  </View>
                </View>
                <ArrowRight color="#cbd5e1" size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
