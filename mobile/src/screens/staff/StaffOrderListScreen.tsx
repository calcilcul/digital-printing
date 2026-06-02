import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, ChevronRight, Wallet, FileCheck } from 'lucide-react-native';

import { useStaffStore, StaffOrder } from '../../store/staffStore';
import { StaffStackParamList } from '../../navigation/StaffTabs';
import StaffStatusBadge from '../../components/StaffStatusBadge';

type NavigationProp = NativeStackNavigationProp<StaffStackParamList, 'Tabs'>;

const TABS = [
  {
    key: 'semua',
    label: 'Semua',
    statuses: [],   // kosong = tampilkan semua
    activeColor: { bg: '#1A56E8', text: '#FFFFFF' },
  },
  {
    key: 'verifikasi_bayar',
    label: 'Verifikasi Bayar',
    statuses: ['payment_verification'],
    activeColor: { bg: '#FAEEDA', text: '#633806' },
  },
  {
    key: 'review_desain',
    label: 'Review Desain',
    statuses: ['design_review'],
    activeColor: { bg: '#E6F1FB', text: '#0C447C' },
  },
  {
    key: 'produksi',
    label: 'Produksi',
    statuses: ['printing'],
    activeColor: { bg: '#1A56E8', text: '#FFFFFF' },
  },
  {
    key: 'selesai',
    label: 'Selesai',
    statuses: ['ready', 'completed'],
    activeColor: { bg: '#EAF3DE', text: '#27500A' },
  },
];

export default function StaffOrderListScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NavigationProp>();
  const { orders, isLoading, fetchOrders, resetPendingCount } = useStaffStore();
  
  const [activeTab, setActiveTab] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      resetPendingCount();
      fetchOrders();
    }, [fetchOrders, resetPendingCount])
  );

  useEffect(() => {
    if (route.params?.filter) {
      const filterParam = route.params.filter;
      if (filterParam === 'payment_verification') {
        setActiveTab('verifikasi_bayar');
      } else if (filterParam === 'design_review') {
        setActiveTab('review_desain');
      } else if (filterParam === 'printing') {
        setActiveTab('produksi');
      } else if (filterParam === 'ready' || filterParam === 'completed') {
        setActiveTab('selesai');
      }
      // Clear param after handling to avoid stuck state
      navigation.setParams({ filter: undefined } as any);
    }
  }, [route.params?.filter, navigation]);

  const filteredOrders = useMemo(() => {
    const activeTabObj = TABS.find(t => t.key === activeTab);
    let filtered = orders;
    if (activeTabObj && activeTabObj.statuses.length > 0) {
      filtered = filtered.filter(o => activeTabObj.statuses.includes(o.status));
    }

    // Apply Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(o => 
        o.order_code.toLowerCase().includes(q) || 
        (o.user?.name && o.user.name.toLowerCase().includes(q)) ||
        (o.customer_name && o.customer_name.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, activeTab, searchQuery]);

  const getCount = (statuses: string[]) => {
    if (statuses.length === 0) return 0;
    return orders.filter(o => statuses.includes(o.status)).length;
  };

  const tabStyle = (tab: any, isActive: boolean) => ({
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: isActive ? tab.activeColor.bg : 'transparent',
    borderWidth: 0.5,
    borderColor: isActive ? tab.activeColor.bg : '#D3D1C7',
    marginRight: 8,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  });

  const tabTextStyle = (tab: any, isActive: boolean) => ({
    fontSize: 13,
    fontWeight: (isActive ? '500' : '400') as any,
    color: isActive ? tab.activeColor.text : '#888780',
  });

  const renderOrderItem = ({ item }: { item: StaffOrder }) => {
    const date = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(item.created_at));
    const price = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.total_price);
    
    let productDesc = item.items[0]?.product_name || 'Produk';
    if (item.items.length > 1) {
      productDesc += ` dan ${item.items.length - 1} item lainnya`;
    }

    return (
      <TouchableOpacity 
        className="bg-white p-4 mb-3 border-b border-slate-100 flex-row items-center justify-between shadow-sm rounded-xl"
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
      >
        <View className="flex-1 pr-3">
          {/* Row 1: order_code (bold) + StaffStatusBadge di kanan */}
          <View className="flex-row justify-between items-center mb-1.5">
            <View>
              <Text className="font-bold text-slate-800 text-base">{item.order_code}</Text>
              <Text className="text-slate-400 text-[10px] mt-0.5">{date}</Text>
            </View>
            <StaffStatusBadge status={item.status} />
          </View>

          {/* Row 2: nama customer asli */}
          <Text className="text-slate-500 text-[13px] font-medium mb-0.5">
            {item.customer_name || item.user?.name || 'Customer'}
          </Text>

          {/* Row 3: nama produk pertama + jumlah item */}
          <Text className="text-slate-600 text-sm mb-2">{productDesc}</Text>

          {/* Row 4: total harga + chip aksi jika butuh aksi */}
          <View className="flex-row justify-between items-center pt-2 border-t border-slate-50">
            <Text className="font-bold text-blue-600 text-base">{price}</Text>
            
            {item.status === 'payment_verification' && (
              <View className="bg-[#FAEEDA] px-2.5 py-1 rounded-full border border-[#f5dfb8] flex-row items-center">
                <Wallet color="#633806" size={12} />
                <Text className="text-[#633806] text-[10px] font-bold ml-1.5">Perlu Verifikasi Bayar</Text>
              </View>
            )}
            {item.status === 'design_review' && (
              <View className="bg-[#E6F1FB] px-2.5 py-1 rounded-full border border-[#c4def7] flex-row items-center">
                <FileCheck color="#0C447C" size={12} />
                <Text className="text-[#0C447C] text-[10px] font-bold ml-1.5">Perlu Review Desain</Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight color="#cbd5e1" size={20} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 pt-12">
      <View className="px-5 mb-4">
        <Text className="text-2xl font-bold text-slate-800 mb-4">Daftar Pesanan</Text>
        
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
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = getCount(tab.statuses);
            const showBadge = (tab.key === 'verifikasi_bayar' || tab.key === 'review_desain' || tab.key === 'produksi') && count > 0;

            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={tabStyle(tab, isActive)}
              >
                <Text style={tabTextStyle(tab, isActive)}>{tab.label}</Text>
                {showBadge && (
                  <View style={{
                    backgroundColor: '#E24B4A',
                    borderRadius: 9, minWidth: 16, height: 16,
                    justifyContent: 'center', alignItems: 'center',
                    paddingHorizontal: 4.5,
                    marginLeft: 6,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>{count}</Text>
                  </View>
                )}
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
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOrders} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Text className="text-slate-500 text-base">Tidak ada pesanan ditemukan.</Text>
          </View>
        }
      />
    </View>
  );
}
