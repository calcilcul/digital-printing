import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, User, Mail, Lock } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import adminApi from '../../services/adminApi';
import { useAdminStore } from '../../store/adminStore';

export default function StaffFormScreen() {
  const navigation = useNavigation<any>();
  const { fetchUsers } = useAdminStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Semua kolom wajib diisi' });
      else Alert.alert('Error', 'Semua kolom wajib diisi');
      return;
    }

    if (password.length < 6) {
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Password minimal 6 karakter' });
      else Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    try {
      await adminApi.createStaff({ name, email, password });
      await fetchUsers(); // Refresh the list
      
      if (Platform.OS === 'web') Toast.show({ type: 'success', text1: 'Akun staff berhasil dibuat!' });
      else Alert.alert('Sukses', 'Akun staff berhasil dibuat!');
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Create staff error:', error);
      const msg = error.response?.data?.message || 'Gagal membuat akun staff';
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: msg });
      else Alert.alert('Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

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

        <Text className="text-2xl font-black text-slate-800">Tambah Staff</Text>
        <Text className="text-slate-500 text-sm mt-1">Buat akun baru untuk karyawan dengan akses staff.</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        <View className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          
          <View className="mb-4">
            <Text className="text-slate-700 font-bold mb-2">Nama Lengkap</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
              <User color="#94a3b8" size={20} />
              <TextInput
                className="flex-1 ml-2 text-slate-800 h-10"
                placeholder="Masukkan nama lengkap staff"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-slate-700 font-bold mb-2">Email</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
              <Mail color="#94a3b8" size={20} />
              <TextInput
                className="flex-1 ml-2 text-slate-800 h-10"
                placeholder="Masukkan alamat email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
            <Text className="text-slate-400 text-[10px] mt-1 ml-1">Email ini akan digunakan staff untuk login.</Text>
          </View>

          <View className="mb-6">
            <Text className="text-slate-700 font-bold mb-2">Password</Text>
            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
              <Lock color="#94a3b8" size={20} />
              <TextInput
                className="flex-1 ml-2 text-slate-800 h-10"
                placeholder="Minimal 6 karakter"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity 
            className="bg-blue-600 py-3.5 rounded-xl items-center flex-row justify-center"
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-base">Buat Akun Staff</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
