import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { CustomerStackParamList } from '../../navigation/CustomerTabs';
import { useProductStore, Product } from '../../store/productStore';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { axiosClient } from '../../api/axiosClient';
import {
  Search,
  ShoppingCart,
  Package,
  Clock,
  ChevronRight,
  Printer,
  Star,
  Bell,
  ClipboardList
} from 'lucide-react-native';

type HomeScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'Tabs'>;

const SkeletonCard = () => (
  <View className="w-44 bg-white rounded-2xl shadow-sm overflow-hidden mr-4 border border-slate-100">
    <View className="w-full bg-slate-200" style={{ aspectRatio: 1 }} />
    <View className="p-3">
      <View className="h-3 bg-slate-200 rounded-full w-12 mb-2" />
      <View className="h-4 bg-slate-200 rounded-full w-full mb-1" />
      <View className="h-4 bg-slate-200 rounded-full w-3/4 mb-3" />
      <View className="h-5 bg-slate-200 rounded-full w-1/2" />
    </View>
  </View>
);

const ProductCard = ({ item, onPress }: { item: Product; onPress: () => void }) => {
  const imageUrl = item.image_url
    ? item.image_url.startsWith('http')
      ? item.image_url
      : `http://localhost:8000${item.image_url}`
    : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="w-44 bg-white rounded-2xl shadow-sm overflow-hidden mr-4 border border-slate-100"
      activeOpacity={0.88}
    >
      <View className="w-full bg-slate-100 items-center justify-center" style={{ aspectRatio: 1 }}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 w-full items-center justify-center">
            <View className="w-14 h-14 bg-blue-50 rounded-full items-center justify-center">
              <Package size={28} color="#93c5fd" />
            </View>
          </View>
        )}
      </View>
      <View className="p-3">
        <View className="bg-blue-50 self-start px-2 py-0.5 rounded-full mb-1.5">
          <Text className="text-blue-600 text-[10px] font-bold">{item.category || 'Produk'}</Text>
        </View>
        <Text className="text-slate-800 font-bold text-sm leading-5 mb-1" numberOfLines={2}>
          {item.name}
        </Text>
        <View className="flex-row items-center mb-2">
          <Clock size={10} color="#94a3b8" />
          <Text className="text-slate-400 text-xs ml-1">Est. {item.estimated_days} hari</Text>
        </View>
        <Text className="text-blue-600 font-bold text-base">
          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.base_price || 0)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { products, isLoading, fetchProducts } = useProductStore();
  const { user, token } = useAuthStore();
  
  // Safe extraction to prevent crashes if store is not ready
  const cartStore = useCartStore() as any;
  const totalItems = cartStore?.totalItems ?? 0;
  const fetchCart = cartStore?.fetchCart ?? (() => {});

  const [searchQuery, setSearchQuery] = useState('');
  const [latestOrder, setLatestOrder] = useState<any>(null);
  
  const insets = useSafeAreaInsets();

  // Initial load products
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch last order safely with [] dependency and try-catch
  useEffect(() => {
    const fetchLatestOrder = async () => {
      try {
        const res = await axiosClient.get('/api/orders');
        const orders = res.data?.data || res.data;
        if (Array.isArray(orders) && orders.length > 0) {
          setLatestOrder(orders[0]);
        } else {
          setLatestOrder(null);
        }
      } catch (error) {
        setLatestOrder(null);
        console.warn('Failed to fetch last order:', error);
      }
    };
    fetchLatestOrder();
  }, [token]);

  // Sync cart with backend every time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (token) {
        fetchCart();
      }
    }, [token])
  );

  const handleSearchSubmit = () => {
    if (searchQuery.trim().length > 0) {
      navigation.navigate('CatalogTab' as any, { searchQuery });
      setSearchQuery('');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending_design': return 'bg-slate-100 text-slate-700';
      case 'design_uploaded': return 'bg-blue-100 text-blue-700';
      case 'waiting_payment': return 'bg-orange-100 text-orange-700';
      case 'payment_verification': return 'bg-yellow-100 text-yellow-700';
      case 'payment_rejected': return 'bg-red-100 text-red-700';
      case 'paid': return 'bg-green-100 text-green-700';
      case 'design_review': return 'bg-blue-100 text-blue-700';
      case 'revision_requested': return 'bg-amber-100 text-amber-700';
      case 'printing': return 'bg-purple-100 text-purple-700';
      case 'ready': return 'bg-teal-100 text-teal-700';
      case 'completed': return 'bg-slate-100 text-slate-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'pending_design') return 'BELUM UPLOAD DESAIN';
    if (status === 'design_uploaded') return 'DESAIN DIUNGGAH';
    if (status === 'payment_rejected') return 'PEMBAYARAN DITOLAK';
    if (status === 'revision_requested') return 'DESAIN PERLU REVISI';
    return status ? status.replace(/_/g, ' ').toUpperCase() : 'UNKNOWN';
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Pelanggan';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#1A56E8' }}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#f8fafc' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={{ backgroundColor: '#1A56E8', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 20, color: '#ffffff' }}>
                Halo, {firstName} 👋
              </Text>
              <Text style={{ fontSize: 14, color: '#bfdbfe', marginTop: 4 }}>
                Siap mencetak hari ini?
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <TouchableOpacity
                onPress={() => alert('Fitur notifikasi akan hadir di pembaruan selanjutnya! 🚀')}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Bell size={18} color="#ffffff" />
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => navigation.navigate('Cart' as any)}
                style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}
              >
                <ShoppingCart size={18} color="#ffffff" />
                {token && totalItems > 0 && (
                  <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#1A56E8' }}>
                    <Text style={{ color: '#ffffff', fontSize: 10, fontWeight: 'bold' }}>{totalItems}</Text>
                  </View>
                )}
              </TouchableOpacity>

            <TouchableOpacity
              onPress={() => (navigation as any).navigate('ProfileTab')}
              style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', marginLeft: 4 }}
            >
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#dbeafe', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 14 }}>
                  {firstName.charAt(0).toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 9999, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#e2e8f0' }}>
          <Search size={16} color="#94a3b8" />
          <TextInput
            style={{ flex: 1, marginLeft: 8, color: '#334155', fontSize: 14 }}
            placeholder="Cari produk cetak..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
        </View>
      </View>

        {/* ── Hero Banner ── */}
        <View className="mx-4 mt-5 p-6 rounded-3xl bg-blue-600 overflow-hidden">
          <View
            className="absolute w-40 h-40 bg-blue-500 rounded-full"
            style={{ top: -30, right: -20, opacity: 0.5 }}
          />
          <View
            className="absolute w-24 h-24 bg-blue-700 rounded-full"
            style={{ bottom: -20, right: 60, opacity: 0.4 }}
          />
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 bg-white rounded-full items-center justify-center mr-2">
              <Printer size={16} color="#2563eb" />
            </View>
            <Text className="text-blue-100 text-xs font-semibold">Jaya Mandiri Printing</Text>
          </View>
          <Text className="text-white font-bold text-2xl leading-8 mb-1">
            Wujudkan{'\n'}Idemu Jadi Nyata ✨
          </Text>
          <Text className="text-blue-100 text-sm mt-1 mb-4">
            Kualitas cetak premium, proses cepat & mudah.
          </Text>
          <TouchableOpacity
            onPress={() => (navigation as any).navigate('CatalogTab')}
            className="bg-white self-start px-5 py-2.5 rounded-full flex-row items-center"
            activeOpacity={0.9}
          >
            <Text className="text-blue-600 font-bold text-sm mr-1">Mulai Pesan</Text>
            <ChevronRight size={14} color="#2563eb" />
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ── */}
        <View className="mx-4 mt-4 flex-row gap-3">
          {( [
            { label: 'Produk Aktif', value: `${products.length}+`, icon: Package },
            { label: 'Kualitas Cetak', value: 'Premium', icon: Star },
            { label: 'Estimasi', value: '1-3 Hari', icon: Clock },
          ] as any[] ).map((s, i) => {
            const Icon = s.icon;
            return (
              <View
                key={i}
                className="flex-1 bg-white rounded-2xl p-3 items-center border border-slate-100 shadow-sm"
              >
                <Icon size={18} color="#2563eb" />
                <Text className="text-slate-800 font-bold text-sm mt-1">{s.value}</Text>
                <Text className="text-slate-400 text-[10px] text-center">{s.label}</Text>
              </View>
            );
          })}
        </View>

        {/* ── Popular Products ── */}
        <View className="mt-7">
          <View className="flex-row items-center justify-between px-4 mb-3">
            <Text className="font-bold text-lg text-slate-800">Produk Terpopuler</Text>
            <TouchableOpacity 
              className="flex-row items-center"
              onPress={() => (navigation as any).navigate('CatalogTab')}
            >
              <Text className="text-blue-600 text-sm font-semibold">Lihat Semua</Text>
              <ChevronRight size={14} color="#2563eb" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
            </ScrollView>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            >
              {products.slice(0, 5).map((item) => (
                <ProductCard
                  key={item.id}
                  item={item}
                  onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Pesanan Terakhir ── */}
        {latestOrder && (
          <View className="mt-7 mx-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-bold text-lg text-slate-800">Pesanan terakhir</Text>
              <TouchableOpacity onPress={() => (navigation as any).navigate('OrdersTab')}>
                <Text className="text-blue-600 text-sm font-semibold">Lihat semua</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.navigate('OrderDetail', { orderId: latestOrder.id })}
              className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex-row items-center justify-between"
              activeOpacity={0.8}
            >
              <View className="flex-row items-center flex-1">
                <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                  <ClipboardList size={26} color="#2563eb" />
                </View>
                <View className="flex-1 pr-2">
                  <Text className="font-bold text-slate-800 text-sm mb-0.5" numberOfLines={1}>
                    {latestOrder.order_code}
                  </Text>
                  <Text className="text-slate-500 text-xs" numberOfLines={1}>
                    {latestOrder.items && latestOrder.items.length > 0 
                      ? `${latestOrder.items[0].product_name} x${latestOrder.items[0].quantity}` 
                      : 'Detail pesanan'}
                  </Text>
                </View>
              </View>
              <View className={`px-3 py-1.5 rounded-full border ${getStatusColor(latestOrder.status)}`}>
                <Text className={`text-xs font-bold ${getStatusColor(latestOrder.status).split(' ')[1]}`}>
                  {getStatusText(latestOrder.status)}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
