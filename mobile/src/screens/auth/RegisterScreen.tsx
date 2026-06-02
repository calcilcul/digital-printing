import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

import Toast from 'react-native-toast-message';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const register = useAuthStore((state) => state.register);
  const navigation = useNavigation<RegisterScreenNavigationProp>();

  const handleRegister = async () => {
    if (!name || !email || !password || !phone) {
      Toast.show({
        type: 'error',
        text1: 'Validasi Gagal',
        text2: 'Semua field harus diisi',
      });
      return;
    }
    
    setLoading(true);
    try {
      await register({ name, email, phone, password, role: 'customer' });
      Toast.show({
        type: 'success',
        text1: 'Akun berhasil dibuat! Selamat datang.',
      });
      // Redirect to HomeTab
      navigation.getParent()?.navigate('Customer', {
        screen: 'Tabs',
        params: { screen: 'HomeTab' }
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registrasi Gagal',
        text2: error?.response?.data?.error || error?.message || 'Terjadi kesalahan saat registrasi',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24, justifyContent: 'center', flexGrow: 1 }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, padding: 8, backgroundColor: '#e2e8f0', borderRadius: 20 }}
          >
            <ArrowLeft size={20} color="#475569" />
          </TouchableOpacity>

          <View className="mb-10 items-center mt-10">
            <Text className="text-3xl font-bold text-blue-600 mb-2">Jaya Mandiri</Text>
            <Text className="text-gray-500 text-base">Buat Akun Baru</Text>
          </View>

          <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-600 mb-2">Nama Lengkap</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
              placeholder="Masukkan nama lengkap Anda"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-600 mb-2">Email</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
              placeholder="Masukkan email Anda"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mb-4">
            <Text className="text-sm font-medium text-slate-600 mb-2">Nomor HP / WhatsApp</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
              placeholder="Contoh: 08123456789"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>

          <View className="mb-8">
            <Text className="text-sm font-medium text-slate-600 mb-2">Password</Text>
            <TextInput
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
              placeholder="Minimal 6 karakter"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            onPress={handleRegister}
            disabled={loading}
            className={`w-full py-4 rounded-xl items-center justify-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">Daftar</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-slate-600">Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text className="text-blue-600 font-bold">Masuk di sini</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
