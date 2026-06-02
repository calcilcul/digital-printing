import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Platform, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User as UserIcon, Edit2, Check, X } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { axiosClient } from '../../api/axiosClient';

export default function ProfileScreen() {
  const { user, token, logout, setUser } = useAuthStore();
  const navigation = useNavigation();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Apakah Anda yakin ingin keluar dari akun ini?");
      if (confirm) {
        await logout();
        Toast.show({
          type: 'success',
          text1: 'Berhasil keluar dari akun.',
        });
        (navigation as any).navigate('HomeTab');
      }
    } else {
      Alert.alert("Konfirmasi Logout", "Apakah Anda yakin ingin keluar dari akun ini?", [
        { text: "Batal", style: "cancel" },
        { 
          text: "Keluar", 
          style: "destructive", 
          onPress: async () => {
            await logout();
            Toast.show({
              type: 'success',
              text1: 'Berhasil keluar dari akun.',
            });
            (navigation as any).navigate('HomeTab');
          }
        }
      ]);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Toast.show({ type: 'error', text1: 'Nama tidak boleh kosong' });
      return;
    }
    setSaving(true);
    try {
      await axiosClient.put('/api/profile', { name: name.trim(), phone_number: phone.trim() });
      // Update local user state with the new values
      setUser({
        ...user!,
        name: name.trim(),
        phone: phone.trim(),
      });
      setIsEditing(false);
      Toast.show({ type: 'success', text1: '✅ Profil berhasil diperbarui' });
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || error?.response?.data?.error || 'Silakan coba lagi';
      Toast.show({
        type: 'error',
        text1: 'Gagal memperbarui',
        text2: errMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center p-6">
        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6">
          <UserIcon size={40} color="#2563eb" />
        </View>
        <Text className="text-2xl font-bold text-slate-800 mb-2">Belum Masuk</Text>
        <Text className="text-slate-500 text-center mb-8">
          Silakan masuk atau buat akun baru untuk melihat profil dan riwayat pesanan Anda.
        </Text>
        <TouchableOpacity 
          onPress={() => (navigation as any).navigate('Auth', { screen: 'Login' })}
          className="bg-blue-600 w-full py-4 rounded-xl items-center mb-3"
        >
          <Text className="text-white font-bold text-lg">Masuk Akun</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="pt-16 pb-8 px-6 bg-white border-b border-slate-100 items-center">
        <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
          <UserIcon size={40} color="#2563eb" />
        </View>
        {!isEditing ? (
          <>
            <Text className="text-2xl font-bold text-slate-800">{user?.name}</Text>
            <Text className="text-slate-500 mt-1">{user?.email}</Text>
            <View className="bg-slate-100 px-3 py-1 rounded-full mt-3">
              <Text className="text-slate-600 text-xs font-bold uppercase tracking-wider">{user?.role || 'CUSTOMER'}</Text>
            </View>
          </>
        ) : (
          <Text className="text-xl font-bold text-slate-800 mb-2">Edit Profil</Text>
        )}
      </View>

      <View className="p-6">
        {isEditing ? (
          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <Text className="text-slate-500 mb-2">Nama Lengkap</Text>
            <TextInput 
              value={name}
              onChangeText={setName}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 text-slate-800"
              placeholder="Masukkan nama"
            />
            
            <Text className="text-slate-500 mb-2">Nomor HP</Text>
            <TextInput 
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6 text-slate-800"
              placeholder="Masukkan nomor HP"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={() => { setIsEditing(false); setName(user?.name || ''); setPhone(user?.phone || ''); }}
                className="flex-1 bg-slate-100 py-3 rounded-xl flex-row justify-center items-center"
              >
                <X size={18} color="#64748b" />
                <Text className="text-slate-600 font-bold ml-2">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-blue-600 py-3 rounded-xl flex-row justify-center items-center"
              >
                {saving ? <ActivityIndicator size="small" color="#ffffff" /> : <Check size={18} color="#ffffff" />}
                <Text className="text-white font-bold ml-2">Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
            <View className="p-4 border-b border-slate-50 flex-row justify-between items-center">
              <Text className="text-slate-500">Nomor HP</Text>
              <Text className="text-slate-800 font-medium">{user?.phone || '-'}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setIsEditing(true)}
              className="p-4 bg-slate-50 flex-row justify-center items-center"
            >
              <Edit2 size={16} color="#2563eb" />
              <Text className="text-blue-600 font-bold ml-2">Edit Profil</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 p-4 rounded-xl flex-row items-center justify-center border border-red-100"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-600 font-bold ml-2">Keluar Akun</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
