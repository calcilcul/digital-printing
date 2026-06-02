import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { User, Mail, Phone, Calendar, ShieldCheck, Shield, Clock, ArrowLeft, Ban } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import adminApi from '../../services/adminApi';
import { useAdminStore } from '../../store/adminStore';

export default function UserDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { fetchUsers } = useAdminStore();
  
  // The user object passed from list
  const [user, setUser] = useState(route.params?.user);
  const [actionLoading, setActionLoading] = useState(false);

  if (!user) {
    return <View className="flex-1 justify-center items-center"><Text>Data tidak ditemukan</Text></View>;
  }

  const handleToggleStatus = () => {
    const roleStr = user.role || (user.role_id === 1 ? 'owner' : user.role_id === 2 ? 'staff' : 'customer');
    if (user.role_id === 1 || roleStr === 'owner') {
      if (Platform.OS === 'web') alert('Tidak bisa menonaktifkan akun owner utama.');
      else Alert.alert('Error', 'Tidak bisa menonaktifkan akun owner utama.');
      return;
    }

    const newStatus = !user.is_active;
    const actionText = newStatus ? 'Mengaktifkan' : 'Menonaktifkan (Ban)';

    const proceedToggle = async () => {
      setActionLoading(true);
      try {
        await adminApi.updateUserStatus(user.id, newStatus);
        
        // Update local state and global list
        setUser({ ...user, is_active: newStatus });
        await fetchUsers();
        
        if (Platform.OS === 'web') Toast.show({ type: 'success', text1: `Berhasil ${actionText.toLowerCase()} user.` });
      } catch (error: any) {
        console.error('Toggle status error:', error);
        if (Platform.OS === 'web') Toast.show({ type: 'error', text1: `Gagal ${actionText.toLowerCase()} user.` });
        else Alert.alert('Error', `Gagal ${actionText.toLowerCase()} user.`);
      } finally {
        setActionLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Yakin ingin ${actionText.toLowerCase()} user ${user.name}?`)) {
        proceedToggle();
      }
    } else {
      Alert.alert('Konfirmasi', `Yakin ingin ${actionText.toLowerCase()} user ${user.name}?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Lanjutkan', style: newStatus ? 'default' : 'destructive', onPress: proceedToggle }
      ]);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'owner') return { bg: 'bg-purple-100', text: 'text-purple-700', icon: <ShieldCheck color="#7e22ce" size={16} /> };
    if (r === 'staff') return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Shield color="#1d4ed8" size={16} /> };
    return { bg: 'bg-slate-200', text: 'text-slate-700', icon: <User color="#334155" size={16} /> };
  };

  const roleStr = user.role || (user.role_id === 1 ? 'owner' : user.role_id === 2 ? 'staff' : 'customer');
  const roleBadge = getRoleBadge(roleStr);
  const formattedDate = new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(user.created_at));

  return (
    <View className="flex-1 bg-slate-50">
      <View className="bg-white p-5 pt-12 border-b border-slate-200">
        <TouchableOpacity 
          className="flex-row items-center mb-6 self-start"
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft color="#2563eb" size={20} />
          <Text className="text-blue-600 font-bold ml-2 text-sm">Kembali</Text>
        </TouchableOpacity>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 pr-4">
            <View className={`w-16 h-16 rounded-full items-center justify-center ${user.is_active ? 'bg-blue-100' : 'bg-red-100'}`}>
              <User color={user.is_active ? "#2563eb" : "#dc2626"} size={32} />
            </View>
            <View className="ml-4 flex-1">
              <View className="flex-row items-center mb-1">
                <Text className={`text-2xl font-black ${!user.is_active ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                  {user.name}
                </Text>
              </View>
              <View className={`${roleBadge.bg} px-3 py-1 rounded-full flex-row items-center self-start mt-1`}>
                {roleBadge.icon}
                <Text className={`${roleBadge.text} text-xs font-bold ml-1.5 uppercase`}>{roleStr}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-6">
          <Text className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Informasi Akun</Text>
          
          <View className="flex-row items-center mb-4">
            <View className="bg-slate-100 p-2.5 rounded-xl mr-3">
              <Mail color="#64748b" size={20} />
            </View>
            <View>
              <Text className="text-slate-500 text-xs font-medium">Email</Text>
              <Text className="text-slate-800 font-semibold">{user.email}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="bg-slate-100 p-2.5 rounded-xl mr-3">
              <Phone color="#64748b" size={20} />
            </View>
            <View>
              <Text className="text-slate-500 text-xs font-medium">No. Handphone</Text>
              <Text className="text-slate-800 font-semibold">{user.phone || '-'}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="bg-slate-100 p-2.5 rounded-xl mr-3">
              <Calendar color="#64748b" size={20} />
            </View>
            <View>
              <Text className="text-slate-500 text-xs font-medium">Tanggal Bergabung</Text>
              <Text className="text-slate-800 font-semibold">{formattedDate}</Text>
            </View>
          </View>

          <View className="flex-row items-center mb-2">
            <View className="bg-slate-100 p-2.5 rounded-xl mr-3">
              <Clock color="#64748b" size={20} />
            </View>
            <View>
              <Text className="text-slate-500 text-xs font-medium">Terakhir Login</Text>
              <Text className="text-slate-800 font-semibold">
                {user.last_login_at ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(user.last_login_at)) : '-'}
              </Text>
            </View>
          </View>
        </View>

        <View className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <Text className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Status & Akses</Text>
          
          <View className="flex-row items-center justify-between mb-5">
            <View className="flex-row items-center">
              <View className={`p-2.5 rounded-xl mr-3 ${user.is_active ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {user.is_active ? <ShieldCheck color="#059669" size={20} /> : <Ban color="#dc2626" size={20} />}
              </View>
              <View>
                <Text className="text-slate-500 text-xs font-medium">Status Akun</Text>
                <Text className={`font-bold ${user.is_active ? 'text-emerald-600' : 'text-red-600'}`}>
                  {user.is_active ? 'Aktif' : 'Nonaktif (Banned)'}
                </Text>
              </View>
            </View>
          </View>

          {roleStr !== 'owner' && (
            <TouchableOpacity 
              className={`p-4 rounded-xl flex-row items-center justify-center border ${user.is_active ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}
              onPress={handleToggleStatus}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color={user.is_active ? "#dc2626" : "#059669"} />
              ) : (
                <>
                  {user.is_active ? <Ban color="#dc2626" size={18} /> : <ShieldCheck color="#059669" size={18} />}
                  <Text className={`font-bold ml-2 ${user.is_active ? 'text-red-700' : 'text-emerald-700'}`}>
                    {user.is_active ? 'Nonaktifkan Pengguna Ini' : 'Aktifkan Kembali Pengguna Ini'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {roleStr === 'owner' && (
            <View className="bg-slate-100 p-4 rounded-xl flex-row items-center">
              <ShieldCheck color="#64748b" size={20} />
              <Text className="text-slate-600 text-sm ml-2 flex-1">Akun owner utama tidak dapat dinonaktifkan.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
