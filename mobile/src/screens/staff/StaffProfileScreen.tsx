import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { User, Mail, Phone, LogOut, Edit2, Check, X, ShieldCheck, Repeat, ChevronRight } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useAuthStore } from '../../store/authStore';
import { axiosClient } from '../../api/axiosClient';

export default function StaffProfileScreen() {
  const { user, setUser, logout, switchRoleMode } = useAuthStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isLoading, setIsLoading] = useState(false);
  
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Gagal memperbarui',
        text2: 'Nama tidak boleh kosong'
      });
      return;
    }

    setIsLoading(true);
    try {
      await axiosClient.put('/api/profile', { 
        name: name.trim(), 
        phone_number: phone.trim() 
      });
      if (user) {
        setUser({ ...user, name: name.trim(), phone: phone.trim() });
      }
      Toast.show({
        type: 'success',
        text1: 'Sukses',
        text2: 'Profil berhasil diperbarui'
      });
      setIsEditing(false);
    } catch (error: any) {
      const errMsg = error?.response?.data?.message || 'Gagal memperbarui profil';
      Toast.show({
        type: 'error',
        text1: 'Gagal memperbarui',
        text2: errMsg
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(user?.name || '');
    setPhone(user?.phone || '');
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm("Apakah Anda yakin ingin keluar dari akun ini?");
      if (confirm) {
        logout().then(() => {
          Toast.show({
            type: 'success',
            text1: 'Berhasil keluar dari akun.',
          });
        });
      }
    } else {
      Alert.alert('Konfirmasi', 'Yakin ingin keluar?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: async () => {
            await logout();
            Toast.show({
              type: 'success',
              text1: 'Berhasil keluar dari akun.',
            });
          }
        }
      ]);
    }
  };

  const isOwner = user?.role?.toLowerCase() === 'owner';

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Header Section */}
      <View className="pt-16 pb-8 px-6 bg-white border-b border-slate-100 items-center">
        {!isEditing ? (
          <>
            <View className={`w-24 h-24 ${isOwner ? 'bg-purple-100' : 'bg-blue-100'} rounded-full items-center justify-center mb-4`}>
              <User size={40} color={isOwner ? "#7c3aed" : "#2563eb"} />
            </View>
            <Text className="text-2xl font-bold text-slate-800 text-center">{user?.name}</Text>
            <Text className="text-slate-500 mt-1">{user?.email}</Text>
            <View className={`px-3 py-1 rounded-full mt-3 ${isOwner ? 'bg-purple-100' : 'bg-blue-100'}`}>
              <Text className={`text-xs font-bold uppercase tracking-wider ${isOwner ? 'text-purple-700' : 'text-blue-700'}`}>
                {isOwner ? 'OWNER' : 'STAFF PRODUKSI'}
              </Text>
            </View>
          </>
        ) : (
          <Text className="text-xl font-bold text-slate-800 mb-2">Edit Profil</Text>
        )}
      </View>

      <View className="p-6">
        {isEditing ? (
          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 mb-6">
            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-1">Nama Lengkap</Text>
              <View className={`flex-row items-center border rounded-xl px-4 py-3 transition-colors ${isNameFocused ? 'bg-white border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                <User color={isNameFocused ? "#2563eb" : "#94a3b8"} size={20} />
                <TextInput
                  className="flex-1 ml-3 text-slate-800 font-normal"
                  value={name}
                  onChangeText={setName}
                  placeholder="Masukkan nama Anda"
                  onFocus={() => setIsNameFocused(true)}
                  onBlur={() => setIsNameFocused(false)}
                  style={{ outlineStyle: 'none' } as any}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-slate-700 mb-1">Email</Text>
              <View className="flex-row items-center bg-slate-100 border border-slate-200 rounded-xl px-4 py-3">
                <Mail color="#94a3b8" size={20} />
                <TextInput
                  className="flex-1 ml-3 text-slate-500 font-normal"
                  value={user?.email}
                  editable={false}
                  style={{ outlineStyle: 'none' } as any}
                />
              </View>
              <Text className="text-xs text-slate-400 mt-1 ml-1">Email tidak dapat diubah</Text>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-slate-700 mb-1">Nomor HP</Text>
              <View className={`flex-row items-center border rounded-xl px-4 py-3 transition-colors ${isPhoneFocused ? 'bg-white border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>
                <Phone color={isPhoneFocused ? "#2563eb" : "#94a3b8"} size={20} />
                <TextInput
                  className="flex-1 ml-3 text-slate-800 font-normal"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="08xxxxxxxxxx"
                  keyboardType="phone-pad"
                  onFocus={() => setIsPhoneFocused(true)}
                  onBlur={() => setIsPhoneFocused(false)}
                  style={{ outlineStyle: 'none' } as any}
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity 
                onPress={handleCancelEdit}
                className="flex-1 bg-slate-100 py-3 rounded-xl flex-row justify-center items-center"
              >
                <X size={18} color="#64748b" />
                <Text className="text-slate-600 font-bold ml-2">Batal</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleUpdateProfile}
                disabled={isLoading}
                className="flex-1 bg-blue-600 py-3 rounded-xl flex-row justify-center items-center"
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Check size={18} color="#ffffff" />
                )}
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

        {isOwner && (
          <TouchableOpacity 
            className="bg-white p-5 rounded-2xl flex-row items-center border border-purple-100 shadow-sm mb-4"
            onPress={() => switchRoleMode('admin')}
          >
            <View className="bg-purple-50 p-3 rounded-xl mr-4">
              <Repeat color="#9333ea" size={20} />
            </View>
            <View className="flex-1">
              <Text className="text-purple-700 font-bold text-base mb-0.5">Beralih ke Mode Admin</Text>
              <Text className="text-purple-400 text-xs">Akses kelola sistem & laporan</Text>
            </View>
            <ChevronRight color="#d8b4fe" size={20} />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          onPress={handleLogout}
          className="bg-red-50 p-4 rounded-xl flex-row items-center justify-center border border-red-100 mb-6"
        >
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-600 font-bold ml-2">Keluar Akun</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
