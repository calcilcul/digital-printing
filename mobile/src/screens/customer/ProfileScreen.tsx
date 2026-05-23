import React, { useEffect, useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image, Platform, TextInput, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useOrderStore } from '../../store/orderStore';
import { useCartStore } from '../../store/cartStore';
import { axiosClient } from '../../api/axiosClient';
import {
  LogOut, Heart, ChevronDown, Package, Star,
  CreditCard, MapPin, Bell, Shield, X, CheckCircle2,
  User, Settings, ChevronRight, ShoppingBag,
  ArrowRight, Lock, UserPlus, Phone, Edit3
} from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, SlideInUp, ZoomIn } from 'react-native-reanimated';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

// ─── GUEST PROFILE VIEW ─────────────────────────────────────────────────────
function GuestProfileView() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header Guest */}
        <View className="bg-primary px-6 pt-6 pb-16 rounded-b-[40px] shadow-lg">
          <Text className="text-white text-2xl font-black mb-1">Profile</Text>
          <Text className="text-primary-light text-sm">Sign in to access your account</Text>
        </View>

        {/* Guest Avatar Card */}
        <View className="mx-6 -mt-10 bg-white rounded-3xl p-6 shadow-md border border-border mb-6 z-10">
          <View className="flex-row items-center mb-5">
            <View className="w-16 h-16 bg-surface rounded-full border-2 border-border items-center justify-center mr-4">
              <User size={32} color="#94A3B8" />
            </View>
            <View className="flex-1">
              <Text className="text-text text-xl font-black">Guest User</Text>
              <Text className="text-text-muted text-sm">Not signed in</Text>
            </View>
          </View>

          {/* CTA Buttons */}
          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            className="bg-primary py-4 rounded-2xl items-center flex-row justify-center mb-3 shadow-md"
            style={{ shadowColor: '#1E3A8A', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
          >
            <Lock size={18} color="white" />
            <Text className="text-white font-bold text-base ml-2">Sign In to Your Account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
            className="bg-surface border-2 border-border py-4 rounded-2xl items-center flex-row justify-center"
          >
            <UserPlus size={18} color="#1E3A8A" />
            <Text className="text-primary font-bold text-base ml-2">Create New Account</Text>
          </TouchableOpacity>
        </View>

        {/* What You'll Get */}
        <View className="mx-6 mb-6">
          <Text className="text-text font-black text-lg mb-4">What you get by signing in</Text>

          {[
            { icon: ShoppingBag, color: '#1E3A8A', bg: '#EFF6FF', title: 'Track Your Orders', desc: 'Monitor all your printing orders in real-time' },
            { icon: Star, color: '#F59E0B', bg: '#FFFBEB', title: 'Loyalty Points', desc: 'Earn points on every purchase and redeem rewards' },
            { icon: Heart, color: '#EF4444', bg: '#FEF2F2', title: 'Save Favorites', desc: 'Bookmark products you love for quick access' },
            { icon: ArrowRight, color: '#10B981', bg: '#ECFDF5', title: 'Fast Reorder', desc: 'Instantly reorder from your previous purchases' },
          ].map((item, idx) => (
            <View key={idx} className="flex-row items-center bg-white rounded-2xl p-4 mb-3 border border-border shadow-sm">
              <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: item.bg }}>
                <item.icon size={22} color={item.color} />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-text text-base">{item.title}</Text>
                <Text className="text-text-muted text-xs mt-0.5">{item.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Preview Orders (blurred/locked) */}
        <View className="mx-6 mb-6">
          <Text className="text-text font-black text-lg mb-4">Order History</Text>
          <View className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
            {/* Locked overlay */}
            <View className="absolute inset-0 z-10 items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
              <View className="bg-primary/10 rounded-full p-4 mb-3">
                <Lock size={28} color="#1E3A8A" />
              </View>
              <Text className="font-black text-text text-base mb-1">Sign in to view orders</Text>
              <Text className="text-text-muted text-xs text-center px-6">Your order history will appear here</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                className="mt-4 bg-primary px-6 py-2.5 rounded-full"
              >
                <Text className="text-white font-bold text-sm">Sign In</Text>
              </TouchableOpacity>
            </View>
            {/* Blurred fake orders */}
            {[
              { code: 'ORD-48291', status: 'Delivered', price: '$89.97', date: 'May 10, 2026' },
              { code: 'ORD-47103', status: 'In Transit', price: '$29.99', date: 'Apr 28, 2026' },
            ].map((order, idx) => (
              <View key={idx} className={`px-4 py-4 ${idx !== 0 ? 'border-t border-border' : ''}`} style={{ opacity: 0.3 }}>
                <View className="flex-row justify-between items-center">
                  <Text className="font-bold text-text">{order.code}</Text>
                  <Text className="font-black text-text">{order.price}</Text>
                </View>
                <View className="flex-row justify-between items-center mt-1">
                  <Text className="text-text-muted text-xs">{order.date}</Text>
                  <View className="bg-success/10 px-2 py-0.5 rounded-md">
                    <Text className="text-success text-xs font-bold">{order.status}</Text>
                  </View>
                </View>
              </View>
            ))}
            <View className="h-24" />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── AUTHENTICATED PROFILE VIEW ──────────────────────────────────────────────
function AuthenticatedProfileView() {
  const navigation = useNavigation<any>();
  const { user, signOut, token, setSession } = useAuthStore();
  const { orders, isLoading: isOrdersLoading, fetchOrders } = useOrderStore();
  const { items: cartItems, addItem, clearCart } = useCartStore();

  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('All');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [reorderItem, setReorderItem] = useState<any>(null);
  const [showReorderSuccess, setShowReorderSuccess] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  // States untuk Update Profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const fetchProfileData = React.useCallback(async () => {
    try {
      const res = await axiosClient.get('/api/profile');
      if (res.data) {
        setProfileName(res.data.name || '');
        setProfilePhone(res.data.phone || '');
      }
    } catch (err) {
      console.log('Error fetching latest profile:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    fetchProfileData();
  }, [fetchOrders, fetchProfileData]);

  const handleUpdateProfile = async () => {
    if (!profileName.trim()) {
      Alert.alert('Error', 'Nama lengkap tidak boleh kosong');
      return;
    }
    setIsSavingProfile(true);
    try {
      await axiosClient.put('/api/profile', {
        name: profileName.trim(),
        phone_number: profilePhone.trim()
      });
      
      // Update local state dan global Zustand store
      if (token && user) {
        await setSession(token, {
          ...user,
          name: profileName.trim()
        });
      }
      
      setIsSavingProfile(false);
      setIsEditingProfile(false);
      Alert.alert('Sukses', 'Profil Anda berhasil diperbarui!');
    } catch (error: any) {
      setIsSavingProfile(false);
      Alert.alert('Gagal', error.response?.data?.message || 'Gagal memperbarui profil');
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmLogout = window.confirm('Are you sure you want to log out?');
      if (confirmLogout) {
        clearCart();
        await signOut();
        // Untuk memastikan UI di-refresh dan diarahkan ke guest view jika diperlukan
        navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
      }
    } else {
      Alert.alert('Log Out', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out', style: 'destructive', onPress: async () => {
            clearCart();
            await signOut();
          }
        }
      ]);
    }
  };

  const handleOpenReorder = (order: any) => {
    setReorderItem(order);
    bottomSheetRef.current?.expand();
  };

  const executeReorder = async (replace: boolean) => {
    if (!reorderItem) return;
    if (replace) clearCart();
    for (const item of reorderItem.items || []) {
      await addItem(item.product_id, item.variant_id, item.quantity);
    }
    bottomSheetRef.current?.close();
    setShowReorderSuccess(true);
    setTimeout(() => {
      setShowReorderSuccess(false);
      navigation.navigate('Cart');
    }, 2000);
  };

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'All') return true;
    if (orderFilter === 'Processing' && o.status === 'PENDING') return true;
    if (orderFilter === 'In Transit' && o.status === 'PRODUCING') return true;
    if (orderFilter === 'Delivered' && o.status === 'COMPLETED') return true;
    return false;
  });

  const initials = (user?.name || 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'March 2024';

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Header */}
        <View className="bg-primary px-6 pt-6 pb-14 rounded-b-[40px] shadow-lg relative">
          
          {/* Quick Log Out Button */}
          <View className="absolute top-6 right-6 z-20">
            <TouchableOpacity onPress={handleLogout} className="bg-white/10 p-2.5 rounded-full border border-white/20 flex-row items-center">
              <LogOut size={16} color="white" />
              <Text className="text-white text-xs font-bold ml-2">Keluar</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-5 mt-2">
            {/* Avatar */}
            <View className="relative mr-4">
              <View className="w-16 h-16 bg-white/20 rounded-full border-2 border-white/50 items-center justify-center">
                <Text className="text-white text-2xl font-black">{initials}</Text>
              </View>
              <View className="absolute -bottom-1 -right-1 bg-warning w-6 h-6 rounded-full items-center justify-center border-2 border-primary">
                <Star size={12} color="white" fill="white" />
              </View>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center mb-1">
                <Text className="text-white text-xl font-black mr-2">{user?.name || 'User'}</Text>
                <View className="bg-warning/30 px-2 py-0.5 rounded-full border border-warning/50">
                  <Text className="text-warning text-[10px] font-black">Gold Member</Text>
                </View>
              </View>
              <Text className="text-primary-light text-sm">{user?.email}</Text>
              <Text className="text-white/60 text-xs mt-0.5">Member since {memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View className="mx-6 -mt-7 bg-white rounded-3xl p-5 flex-row justify-center shadow-md border border-border mb-6 z-10">
          <View className="items-center w-1/2">
            <View className="w-12 h-12 rounded-full items-center justify-center mb-2 bg-[#EFF6FF]">
              <Package size={24} color="#1E3A8A" />
            </View>
            <Text className="text-text font-black text-2xl">{orders.length}</Text>
            <Text className="text-text-muted text-[10px] font-bold uppercase tracking-wider mt-1">Total Orders</Text>
          </View>
        </View>

        {/* Tab Switcher */}
        <View className="mx-6 mb-4">
          <View className="bg-surface rounded-full p-1 flex-row border border-border">
            {['orders', 'settings'].map(tab => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                className={`flex-1 py-3 items-center rounded-full ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`font-bold capitalize text-sm ${activeTab === tab ? 'text-text' : 'text-text-muted'}`}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="px-6">
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <Animated.View entering={FadeIn}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                {['All', 'Delivered', 'In Transit', 'Processing'].map(f => (
                  <TouchableOpacity
                    key={f} onPress={() => setOrderFilter(f)}
                    className={`px-4 py-1.5 rounded-full mr-2 border ${orderFilter === f ? 'bg-primary border-primary' : 'bg-surface border-border'}`}
                  >
                    <Text className={`text-xs font-bold ${orderFilter === f ? 'text-white' : 'text-text-muted'}`}>{f}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {isOrdersLoading ? (
                <ActivityIndicator color="#1E3A8A" className="py-10" />
              ) : filteredOrders.length === 0 ? (
                <View className="items-center py-10">
                  <Package size={40} color="#CBD5E1" />
                  <Text className="text-text-muted font-bold mt-3">No orders found</Text>
                </View>
              ) : (
                filteredOrders.map(order => (
                  <View key={order.id} className="bg-white rounded-2xl mb-4 border border-border shadow-sm overflow-hidden">
                    <TouchableOpacity
                      onPress={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                      className="p-4"
                    >
                      <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-bold text-text">{order.order_code}</Text>
                        <View className={`px-2 py-1 rounded-md ${
                          order.status === 'COMPLETED' ? 'bg-success/10' :
                          order.status === 'PENDING' ? 'bg-warning/10' : 'bg-primary-light/10'
                        }`}>
                          <Text className={`text-[10px] font-bold ${
                            order.status === 'COMPLETED' ? 'text-success' :
                            order.status === 'PENDING' ? 'text-warning' : 'text-primary-light'
                          }`}>
                            {order.status === 'COMPLETED' ? 'Delivered' :
                             order.status === 'PENDING' ? 'Processing' : 'In Transit'}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row justify-between items-end">
                        <Text className="text-text-muted text-xs">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', dd: 'numeric', year: 'numeric' } as any)}</Text>
                        <View className="flex-row items-center">
                          <Text className="text-text font-black text-base mr-2">Rp {order.total_price.toLocaleString('id-ID')}</Text>
                          <ChevronDown size={18} color="#94A3B8"
                            style={{ transform: [{ rotate: expandedOrder === order.id ? '180deg' : '0deg' }] }}
                          />
                        </View>
                      </View>
                    </TouchableOpacity>
                    {expandedOrder === order.id && (
                      <View className="bg-surface p-4 border-t border-border">
                        {order.items?.map((item: any) => (
                          <View key={item.id} className="flex-row mb-3 items-center">
                            <View className="w-10 h-10 bg-white rounded-lg border border-border mr-3" />
                            <View className="flex-1">
                              <Text className="font-bold text-text text-xs">Product #{item.product_id}</Text>
                              <Text className="text-text-muted text-[10px]">Qty: {item.quantity}</Text>
                            </View>
                            <Text className="font-bold text-text text-xs">Rp {item.price.toLocaleString('id-ID')}</Text>
                          </View>
                        ))}
                        <View className="flex-row mt-2 space-x-2 gap-2">
                          <TouchableOpacity
                            onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                            className="flex-1 bg-white border border-border py-2.5 rounded-xl items-center"
                          >
                            <Text className="text-text font-bold text-xs">View Details</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleOpenReorder(order)}
                            className="flex-1 bg-primary py-2.5 rounded-xl items-center"
                          >
                            <Text className="text-white font-bold text-xs">Reorder</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                ))
              )}
            </Animated.View>
          )}



          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <Animated.View entering={FadeIn}>
              <View className="bg-white rounded-3xl border border-border overflow-hidden mb-6">
                {[
                  { icon: User, label: 'Personal Information', onPress: () => setIsEditingProfile(true) },
                  { icon: MapPin, label: 'Saved Addresses', onPress: () => Alert.alert('Info', 'Fitur Alamat Tersimpan segera hadir!') },
                  { icon: CreditCard, label: 'Payment Methods', onPress: () => Alert.alert('Info', 'Fitur Metode Pembayaran segera hadir!') },
                  { icon: Bell, label: 'Notifications', onPress: () => Alert.alert('Info', 'Fitur Notifikasi segera hadir!') },
                  { icon: Shield, label: 'Privacy & Security', onPress: () => Alert.alert('Info', 'Fitur Privasi & Keamanan segera hadir!') },
                ].map((item, i, arr) => (
                  <TouchableOpacity
                    key={i}
                    onPress={item.onPress}
                    className={`flex-row items-center p-4 ${i !== arr.length - 1 ? 'border-b border-border' : ''}`}
                  >
                    <View className="w-10 h-10 bg-surface rounded-full items-center justify-center mr-4">
                      <item.icon size={20} color="#1E3A8A" />
                    </View>
                    <Text className="flex-1 font-bold text-text">{item.label}</Text>
                    <ChevronRight size={18} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                onPress={handleLogout}
                className="bg-error/10 border border-error/20 py-4 rounded-2xl items-center flex-row justify-center mb-10"
              >
                <LogOut size={20} color="#EF4444" />
                <Text className="text-error font-bold text-base ml-2">Log Out</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* EDIT PROFILE MODAL (1.11) */}
          <Modal
            visible={isEditingProfile}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsEditingProfile(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', padding: 20 }}>
              <View className="bg-white rounded-3xl p-6 border border-border shadow-2xl">
                {/* Modal Header */}
                <View className="flex-row justify-between items-center mb-6">
                  <View className="flex-row items-center">
                    <View className="w-9 h-9 bg-primary/10 rounded-full items-center justify-center mr-3">
                      <Edit3 size={18} color="#1E3A8A" />
                    </View>
                    <Text className="text-xl font-black text-text">Edit Profil</Text>
                  </View>
                  <TouchableOpacity onPress={() => setIsEditingProfile(false)} className="bg-surface p-1.5 rounded-full border border-border">
                    <X size={18} color="#94A3B8" />
                  </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View className="space-y-4 mb-6">
                  {/* Name Input */}
                  <View>
                    <Text className="text-text-muted text-xs font-bold mb-2 uppercase tracking-wide">Nama Lengkap</Text>
                    <View className="flex-row items-center bg-surface border border-border rounded-2xl px-4 py-3.5">
                      <User size={18} color="#94A3B8" className="mr-3" />
                      <TextInput
                        className="flex-1 text-text font-medium text-sm p-0 m-0"
                        placeholder="Masukkan nama lengkap"
                        value={profileName}
                        onChangeText={setProfileName}
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>

                  {/* Phone Input */}
                  <View className="mt-4">
                    <Text className="text-text-muted text-xs font-bold mb-2 uppercase tracking-wide">Nomor Telepon</Text>
                    <View className="flex-row items-center bg-surface border border-border rounded-2xl px-4 py-3.5">
                      <Phone size={18} color="#94A3B8" className="mr-3" />
                      <TextInput
                        className="flex-1 text-text font-medium text-sm p-0 m-0"
                        placeholder="Masukkan nomor telepon"
                        value={profilePhone}
                        onChangeText={setProfilePhone}
                        keyboardType="phone-pad"
                        placeholderTextColor="#94A3B8"
                      />
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setIsEditingProfile(false)}
                    className="flex-1 bg-surface border border-border py-4 rounded-2xl items-center"
                    disabled={isSavingProfile}
                  >
                    <Text className="text-text-muted font-bold text-sm">Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleUpdateProfile}
                    className="flex-1 bg-primary py-4 rounded-2xl items-center shadow-md shadow-primary/20"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-white font-bold text-sm">Simpan</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>

      {/* Reorder Success Overlay */}
      {showReorderSuccess && (
        <Animated.View entering={FadeIn} exiting={FadeOut}
          className="absolute inset-0 bg-white/90 z-50 items-center justify-center"
        >
          <Animated.View entering={ZoomIn}>
            <View className="w-20 h-20 bg-success rounded-full items-center justify-center mb-4">
              <CheckCircle2 size={40} color="white" />
            </View>
            <Text className="text-2xl font-black text-text mb-2 text-center">Cart Updated!</Text>
            <Text className="text-text-muted font-bold text-center">Taking you to checkout...</Text>
          </Animated.View>
        </Animated.View>
      )}

      {/* Reorder Bottom Sheet */}
      <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={['50%']} enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#ffffff', borderRadius: 32 }}
      >
        <BottomSheetView style={{ flex: 1, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 }}>
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-xl font-black text-text">Reorder Preview</Text>
            <TouchableOpacity onPress={() => bottomSheetRef.current?.close()}>
              <X size={24} color="#0F172A" />
            </TouchableOpacity>
          </View>
          <View className="bg-surface rounded-2xl p-4 border border-border mb-6">
            <Text className="text-text-muted text-xs font-bold mb-3 uppercase">Order #{reorderItem?.order_code}</Text>
            {reorderItem?.items?.map((item: any) => (
              <View key={item.id} className="flex-row justify-between items-center mb-2">
                <Text className="text-text font-medium" numberOfLines={1}>
                  {item.quantity}x Product #{item.product_id}
                </Text>
                <Text className="text-text font-bold">Rp {item.price?.toLocaleString('id-ID')}</Text>
              </View>
            ))}
            <View className="border-t border-border mt-3 pt-3 flex-row justify-between">
              <Text className="font-bold text-text">Total</Text>
              <Text className="font-black text-primary text-lg">Rp {reorderItem?.total_price?.toLocaleString('id-ID')}</Text>
            </View>
          </View>
          {cartItems.length === 0 ? (
            <TouchableOpacity onPress={() => executeReorder(false)}
              className="bg-primary py-4 rounded-full items-center"
            >
              <Text className="text-white font-bold text-lg">Add to Cart</Text>
            </TouchableOpacity>
          ) : (
            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => Alert.alert('Replace Cart?', `Remove ${cartItems.length} item(s) and replace?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Replace', style: 'destructive', onPress: () => executeReorder(true) }
              ])} className="flex-1 bg-white border-2 border-warning py-4 rounded-full items-center">
                <Text className="text-warning font-bold">Replace Cart</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => executeReorder(false)}
                className="flex-1 bg-primary py-4 rounded-full items-center"
              >
                <Text className="text-white font-bold">Add to Current</Text>
              </TouchableOpacity>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

// ─── MAIN EXPORT ────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { user, token } = useAuthStore();
  const isAuthenticated = !!token && !!user;

  return isAuthenticated ? <AuthenticatedProfileView /> : <GuestProfileView />;
}
