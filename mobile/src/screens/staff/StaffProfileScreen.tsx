import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useStaffStore } from '../../store/staffStore';
import { LogOut, Mail, Shield, Award, Clock, TrendingUp, Package } from 'lucide-react-native';

export default function StaffProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { clearCart } = useCartStore();
  const { orders } = useStaffStore();

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar dari akun Staf?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar', style: 'destructive', onPress: async () => {
          clearCart();
          await signOut();
        }
      }
    ]);
  };

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const initials = getInitials(user?.name || 'Staff');

  // Quick stat counts
  const pendingPayment = orders.filter(o => o.status === 'payment_verification').length;
  const pendingDesign = orders.filter(o => o.status === 'design_review' || o.status === 'paid').length;
  const inPrinting = orders.filter(o => o.status === 'printing').length;
  const completed = orders.filter(o => o.status === 'completed').length;

  const InfoRow = ({ icon, label, value }: any) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
      <View style={{ width: 36, height: 36, backgroundColor: '#EFF6FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>{label}</Text>
        <Text style={{ color: '#1F2937', fontWeight: '700', fontSize: 14 }}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }} edges={['top']}>
      {/* HEADER */}
      <View style={{ backgroundColor: '#1E3A5F', paddingHorizontal: 24, paddingTop: 18, paddingBottom: 28 }}>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Akun & Sesi Kerja</Text>
        <Text style={{ color: 'white', fontWeight: '900', fontSize: 20, marginTop: 2 }}>Profil Staf</Text>

        {/* Avatar + name */}
        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: '#2563EB',
            alignItems: 'center', justifyContent: 'center',
            borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)',
            shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}>
            <Text style={{ color: 'white', fontWeight: '900', fontSize: 26 }}>{initials}</Text>
          </View>
          <Text style={{ color: 'white', fontWeight: '900', fontSize: 20, marginTop: 12 }}>{user?.name || 'Nama Staf'}</Text>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, marginTop: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Shield size={12} color="rgba(255,255,255,0.9)" />
            <Text style={{ color: 'white', fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>
              {(user?.role || 'Staff').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* QUICK STATS */}
        <Text style={{ fontWeight: '800', color: '#1F2937', fontSize: 14, marginBottom: 10, marginLeft: 4 }}>📊 Statistik Saya Hari Ini</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
          {[
            { label: 'Verifikasi', value: pendingPayment, color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
            { label: 'Review Desain', value: pendingDesign, color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
            { label: 'Sedang Cetak', value: inPrinting, color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
            { label: 'Selesai', value: completed, color: '#374151', bg: '#F9FAFB', border: '#E5E7EB' },
          ].map((item, idx) => (
            <View key={idx} style={{ width: '50%', padding: 4 }}>
              <View style={{ backgroundColor: item.bg, borderColor: item.border, borderWidth: 1, borderRadius: 18, padding: 14, alignItems: 'center' }}>
                <Text style={{ fontSize: 26, fontWeight: '900', color: item.color }}>{item.value}</Text>
                <Text style={{ fontSize: 11, color: item.color, fontWeight: '700', marginTop: 4 }}>{item.label}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ACCOUNT INFO */}
        <Text style={{ fontWeight: '800', color: '#1F2937', fontSize: 14, marginBottom: 10, marginLeft: 4 }}>👤 Informasi Akun</Text>
        <View style={{ backgroundColor: 'white', borderRadius: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2, marginBottom: 20 }}>
          <InfoRow icon={<Mail size={16} color="#1D4ED8" />} label="Email" value={user?.email || 'staff@jayamandiri.com'} />
          <InfoRow icon={<Shield size={16} color="#1D4ED8" />} label="Peran" value={(user?.role || 'Staff').charAt(0).toUpperCase() + (user?.role || 'Staff').slice(1)} />
          <InfoRow icon={<Award size={16} color="#1D4ED8" />} label="Status" value="Aktif Bertugas ✓" />
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}>
            <View style={{ width: 36, height: 36, backgroundColor: '#EFF6FF', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
              <Clock size={16} color="#1D4ED8" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>Sesi Aktif Sejak</Text>
              <Text style={{ color: '#1F2937', fontWeight: '700', fontSize: 14 }}>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.8}
          style={{
            backgroundColor: 'white',
            borderRadius: 18,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            borderWidth: 1.5,
            borderColor: '#FECACA',
            shadowColor: '#EF4444',
            shadowOpacity: 0.1,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 3 },
            elevation: 3,
          }}
        >
          <LogOut size={18} color="#DC2626" />
          <Text style={{ color: '#DC2626', fontWeight: '800', fontSize: 15 }}>Keluar dari Akun Staf</Text>
        </TouchableOpacity>

        <Text style={{ color: '#D1D5DB', fontSize: 11, textAlign: 'center', marginTop: 20 }}>
          Jaya Mandiri Percetakan & Advertising © 2026
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
