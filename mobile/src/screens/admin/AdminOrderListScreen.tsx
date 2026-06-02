import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { Search, ChevronLeft, Wallet, FileCheck } from 'lucide-react-native';

import { useAdminStore } from '../../store/adminStore';

const STATUS_TABS = [
  { key: 'semua', label: 'Semua', statuses: [], bg: '#F1F5F9', text: '#64748B' },
  { key: 'waiting_payment', label: 'Menunggu Bayar', statuses: ['waiting_payment'], bg: '#F1F5F9', text: '#444441' },
  { key: 'payment_verification', label: 'Verifikasi Bayar', statuses: ['payment_verification'], bg: '#FAEEDA', text: '#633806' },
  { key: 'design_review', label: 'Review Desain', statuses: ['design_review'], bg: '#E6F1FB', text: '#0C447C' },
  { key: 'printing', label: 'Dicetak', statuses: ['printing'], bg: '#DBEAFE', text: '#1D4ED8' },
  { key: 'ready', label: 'Siap Ambil', statuses: ['ready'], bg: '#DCFCE7', text: '#15803D' },
  { key: 'completed', label: 'Selesai', statuses: ['completed'], bg: '#EAF3DE', text: '#27500A' },
  { key: 'cancelled', label: 'Dibatalkan', statuses: ['cancelled'], bg: '#FCEBEB', text: '#791F1F' },
];

export default function AdminOrderListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orders, fetchOrders, ordersLoading } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  useEffect(() => {
    if (route.params?.status) {
      setActiveTab(route.params.status);
      navigation.setParams({ status: undefined });
    }
  }, [route.params?.status, navigation]);

  const filteredOrders = useMemo(() => {
    const tab = STATUS_TABS.find(t => t.key === activeTab);
    let filtered = orders || [];
    
    if (tab && tab.statuses.length > 0) {
      filtered = filtered.filter(o => tab.statuses.includes(o.status));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.order_code?.toLowerCase().includes(q) || 
        o.customer_name?.toLowerCase().includes(q)
      );
    }

    // Sort newest first
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, activeTab, searchQuery]);

  const getCount = (statuses: string[]) => {
    if (statuses.length === 0) return (orders || []).length;
    return (orders || []).filter(o => statuses.includes(o.status)).length;
  };

  const renderOrderItem = ({ item }: { item: any }) => {
    const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(item.created_at));
    const price = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total_price);
    
    let productDesc = item.items?.[0]?.product_name || 'Produk';
    if (item.items?.length > 1) {
      productDesc += ` dan ${item.items.length - 1} item lainnya`;
    }

    const statTab = STATUS_TABS.find(t => t.statuses.includes(item.status)) || STATUS_TABS[0];

    return (
      <View className="bg-white p-4 mb-3 border border-slate-100 shadow-sm rounded-xl">
        <View className="flex-row justify-between items-start mb-2">
          <View>
            <Text className="font-bold text-slate-800 text-base">{item.order_code}</Text>
            <Text className="text-slate-400 text-[10px] mt-0.5">{date}</Text>
          </View>
          <View style={{ backgroundColor: statTab.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
            <Text style={{ color: statTab.text, fontSize: 10, fontWeight: 'bold' }}>{statTab.label}</Text>
          </View>
        </View>

        <Text className="text-slate-500 text-[13px] font-medium mb-0.5">
          {item.customer_name || 'Customer'}
        </Text>
        <Text className="text-slate-600 text-sm mb-3">{productDesc}</Text>

        <View className="pt-2 border-t border-slate-50">
          <Text className="font-bold text-blue-600 text-base">{price}</Text>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="bg-blue-600 pt-14 pb-4 px-5 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <ChevronLeft color="#fff" size={28} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Daftar Pesanan</Text>
      </View>

      <View className="px-5 my-4">
        {/* Search */}
        <View className="flex-row items-center bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <Search color="#94a3b8" size={20} />
          <TextInput
            className="flex-1 ml-2 text-slate-800"
            placeholder="Cari no pesanan atau nama kustomer..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="border-b border-slate-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5 pb-3">
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = getCount(tab.statuses);

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 20,
                  backgroundColor: isActive ? '#1A56E8' : 'transparent',
                  borderWidth: 0.5,
                  borderColor: isActive ? '#1A56E8' : '#D3D1C7',
                  marginRight: 8,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  fontSize: 13,
                  fontWeight: isActive ? '600' : '400',
                  color: isActive ? '#FFFFFF' : '#64748B',
                }}>
                  {tab.label} {count > 0 && `(${count})`}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Order List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={ordersLoading} onRefresh={fetchOrders} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-slate-500 text-base">Tidak ada pesanan ditemukan.</Text>
          </View>
        }
      />
    </View>
  );
}
