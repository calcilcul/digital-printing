import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import { axiosClient } from '../../api/axiosClient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CustomerStackParamList } from '../../navigation/CustomerTabs';
import { ClipboardList, ChevronRight, ShoppingBag, Clock, Eye, Printer, Check, CheckCircle2, XCircle, Package, FileText } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';

type OrdersScreenNavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'Tabs'>;

const STATUS_CONFIG: Record<string, any> = {
  pending_design:       { icon: FileText, label: 'Belum Upload Desain', bg: '#F1F5F9', text: '#64748B' },
  design_uploaded:      { icon: FileText, label: 'Desain Diunggah',      bg: '#E6F1FB', text: '#0C447C' },
  waiting_payment:      { icon: Clock, label: 'Menunggu Bayar', bg: '#D3D1C7', text: '#444441' },
  payment_verification: { icon: Clock, label: 'Verifikasi', bg: '#FAEEDA', text: '#633806' },
  payment_rejected:     { icon: XCircle, label: 'Bayar Ditolak', bg: '#FCEBEB', text: '#791F1F' },
  paid:                 { icon: Check, label: 'Lunas', bg: '#EAF3DE', text: '#27500A' },
  design_review:        { icon: Eye, label: 'Review Desain', bg: '#E6F1FB', text: '#0C447C' },
  revision_requested:   { icon: Eye, label: 'Revisi Desain', bg: '#FEF3C7', text: '#92400E' },
  printing:             { icon: Printer, label: 'Dicetak', bg: '#1A56E8', text: '#FFFFFF' },
  ready:                { icon: Check, label: 'Siap Ambil', bg: '#EAF3DE', text: '#27500A' },
  completed:            { icon: CheckCircle2, label: 'Selesai', bg: '#27500A', text: '#FFFFFF' },
  cancelled:            { icon: XCircle, label: 'Dibatalkan', bg: '#FCEBEB', text: '#791F1F' },
};

const formatShort = (n: number) => {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
  if (n >= 1000) return `Rp ${Math.round(n / 1000)}rb`;
  return `Rp ${n}`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const OrderStatusBadge = ({ status }: { status: string }) => {
  const config = STATUS_CONFIG[status] || { icon: Clock, label: status, bg: '#F1F5F9', text: '#64748B' };
  const Icon = config.icon;
  return (
    <View style={{ backgroundColor: config.bg, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 9999 }}>
      <Icon size={12} color={config.text} style={{ marginRight: 4 }} />
      <Text style={{ color: config.text, fontSize: 10, fontWeight: '700' }}>{config.label}</Text>
    </View>
  );
};

const ProgressBar = ({ status }: { status: string }) => {
  const steps = ['waiting_payment', 'payment_verification', 'design_review', 'printing', 'ready', 'completed'];
  const currentIndex = steps.indexOf(status);
  
  if (currentIndex === -1 || status === 'cancelled' || status === 'completed') return null;
  
  const stepNumber = currentIndex + 1;
  const progressPercent = Math.round((stepNumber / 6) * 100);
  const config = STATUS_CONFIG[status];
  const isReady = stepNumber >= 5;
  const activeColor = isReady ? '#65A30D' : '#3b82f6';
  
  // Custom labels to exactly match screenshot
  let labelText = config.label;
  if (status === 'payment_verification') labelText = 'Menunggu Verifikasi';
  if (status === 'ready') labelText = 'Siap Diambil';
  
  return (
    <View style={{ marginTop: 12, marginBottom: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Text style={{ fontSize: 12, color: '#94a3b8', fontWeight: '500' }}>Tahap {stepNumber} dari 6</Text>
        <Text style={{ fontSize: 12, color: activeColor, fontWeight: '700' }}>{labelText}</Text>
      </View>
      <View style={{ height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${progressPercent}%`, backgroundColor: activeColor, borderRadius: 3 }} />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingHorizontal: 2 }}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View 
            key={i} 
            style={{ 
              width: 8, 
              height: 8, 
              borderRadius: 4, 
              backgroundColor: i < currentIndex ? activeColor : (i === currentIndex ? '#F59E0B' : '#e2e8f0') 
            }} 
          />
        ))}
      </View>
    </View>
  );
};

const SkeletonLoader = () => {
  const anim = useRef(new Animated.Value(0.5)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.5, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

  return (
    <View style={{ padding: 16 }}>
      {[1, 2, 3].map(i => (
        <Animated.View key={i} style={{ opacity: anim, backgroundColor: '#e2e8f0', height: 180, borderRadius: 24, marginBottom: 16 }} />
      ))}
    </View>
  );
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const navigation = useNavigation<OrdersScreenNavigationProp>();

  const filteredOrders = orders.filter(order => {
    const isHistory = order.status === 'completed' || order.status === 'cancelled';
    return activeTab === 'history' ? isHistory : !isHistory;
  });

  const activeOrdersCount = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.total_price || 0), 0);

  const { token } = useAuthStore();
  
  const fetchOrders = async () => {
    if (!token) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const res = await axiosClient.get('/api/orders');
      setOrders(res.data.data || res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrders();
    });
    return unsubscribe;
  }, [navigation, token]);

  const renderItem = ({ item }: { item: any }) => {
    const firstItemName = item.items && item.items.length > 0 
      ? item.items[0].product_name 
      : 'Pesanan Digital Printing';
    
    const moreItemsCount = item.items ? item.items.length - 1 : 0;
    const moreItemsText = moreItemsCount > 0 ? `+ ${moreItemsCount} item lainnya` : '';
    const isReady = item.status === 'ready';
    const isHistoryTab = activeTab === 'history';

    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
        style={{
          backgroundColor: '#fff', padding: 20, marginBottom: 16, borderRadius: 24,
          borderWidth: isReady ? 1 : 1, borderColor: isReady ? '#97C459' : '#f1f5f9',
          elevation: 2, shadowColor: '#94a3b8', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
        }}
      >
        {isReady && (
          <View style={{ backgroundColor: '#EAF3DE', marginHorizontal: -20, marginTop: -20, marginBottom: 16, paddingVertical: 10, paddingHorizontal: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, flexDirection: 'row', alignItems: 'center' }}>
            <Package size={16} color="#27500A" style={{ marginRight: 8 }} />
            <Text style={{ color: '#27500A', fontWeight: '700', fontSize: 13 }}>Pesanan siap diambil!</Text>
          </View>
        )}

        {/* Top Row: Order ID, Date & Badge */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <View>
            <Text style={{ fontWeight: '800', color: '#1e293b', fontSize: 16, marginBottom: 2 }}>{item.order_code}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>
              {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <OrderStatusBadge status={item.status} />
        </View>

        {/* Product Info Row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
          {/* Thumbnail */}
          <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: isReady ? '#F7FEE7' : '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
            <FileText size={20} color={isReady ? "#4D7C0F" : "#3b82f6"} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#1e293b', fontWeight: '700', fontSize: 15 }} numberOfLines={1}>
              {firstItemName}
            </Text>
            {moreItemsCount > 0 ? (
              <Text style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{moreItemsText}</Text>
            ) : item.items && item.items.length > 0 ? (
              <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }} numberOfLines={1}>
                {item.items[0].product_variant || 'Varian Default'} - {item.items[0].quantity} item
              </Text>
            ) : (
              <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 4 }}>1 item</Text>
            )}
          </View>
        </View>

        {!isHistoryTab && <ProgressBar status={item.status} />}

        {/* Footer Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ color: '#94a3b8', fontSize: 13, marginRight: 6, fontWeight: '700' }}>Total</Text>
            <Text style={{ fontWeight: '800', color: isReady ? '#27500A' : '#1A56E8', fontSize: 16 }}>
              {formatCurrency(item.total_price || 0)}
            </Text>
          </View>
          
          {isReady ? (
            <TouchableOpacity 
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              style={{ backgroundColor: '#EAF3DE', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ color: '#27500A', fontWeight: '700', fontSize: 13, marginRight: 4 }}>Konfirmasi</Text>
              <ChevronRight size={16} color="#27500A" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
              style={{ backgroundColor: '#EFF6FF', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}
            >
              <Text style={{ color: '#1A56E8', fontWeight: '700', fontSize: 13, marginRight: 4 }}>Lihat Detail</Text>
              <ChevronRight size={16} color="#1A56E8" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!token) {
    return (
      <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <View style={{ width: 96, height: 96, backgroundColor: '#dbeafe', borderRadius: 48, alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <ClipboardList size={40} color="#2563eb" />
        </View>
        <Text style={{ fontSize: 24, fontWeight: '700', color: '#1e293b', marginBottom: 8 }}>Belum Masuk</Text>
        <Text style={{ color: '#64748b', textAlign: 'center', marginBottom: 32 }}>
          Silakan masuk atau buat akun baru untuk melihat riwayat pesanan Anda.
        </Text>
        <TouchableOpacity 
          onPress={() => (navigation as any).navigate('Auth', { screen: 'Login' })}
          style={{ backgroundColor: '#2563eb', width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>Masuk Akun</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Premium Header */}
      <View 
        style={{ 
          backgroundColor: '#1e40af', paddingTop: 64, paddingBottom: 24, paddingHorizontal: 20,
          borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 8, zIndex: 10,
          shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ color: '#93c5fd', fontSize: 12, fontWeight: '700', marginBottom: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Transaksi Anda</Text>
            <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 }}>Pesanan Saya</Text>
          </View>
          <View style={{ width: 48, height: 48, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <ClipboardList size={24} color="#ffffff" />
          </View>
        </View>

        {/* Stats Row */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 10, alignItems: 'center', marginRight: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 2 }}>Aktif</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{loading ? '-' : activeOrdersCount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 10, alignItems: 'center', marginRight: 8 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 2 }}>Selesai</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{loading ? '-' : completedOrdersCount}</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: 10, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 2 }}>Total Belanja</Text>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>{loading ? '-' : formatShort(totalSpent)}</Text>
          </View>
        </View>

        {/* Custom Pill Tab Control */}
        <View style={{ flexDirection: 'row', borderRadius: 16, padding: 6, backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: activeTab === 'active' ? '#fff' : 'transparent' }}
            onPress={() => setActiveTab('active')}
          >
            <Text style={{ fontWeight: '700', fontSize: 14, color: activeTab === 'active' ? '#1e40af' : '#dbeafe' }}>
              Pesanan Aktif
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={{ flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', backgroundColor: activeTab === 'history' ? '#fff' : 'transparent' }}
            onPress={() => setActiveTab('history')}
          >
            <Text style={{ fontWeight: '700', fontSize: 14, color: activeTab === 'history' ? '#1e40af' : '#dbeafe' }}>
              Riwayat
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <SkeletonLoader />
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1A56E8']} />
          }
          ListEmptyComponent={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
              {activeTab === 'active' ? (
                <>
                  <ShoppingBag size={48} color="#D0D8F0" style={{ marginBottom: 16 }} />
                  <Text style={{ color: '#1e293b', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>Belum ada pesanan aktif</Text>
                  <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Yuk, mulai cetak sesuatu!</Text>
                  <TouchableOpacity 
                    onPress={() => (navigation as any).navigate('CatalogTab')}
                    style={{ backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }}
                  >
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Mulai Belanja</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Clock size={48} color="#D0D8F0" style={{ marginBottom: 16 }} />
                  <Text style={{ color: '#1e293b', fontSize: 18, fontWeight: '700', marginBottom: 4 }}>Riwayat pesanan masih kosong</Text>
                  <Text style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Pesanan yang selesai akan muncul di sini</Text>
                </>
              )}
            </View>
          }
        />
      )}
    </View>
  );
}
