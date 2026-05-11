import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { axiosClient } from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuthStore();
  const navigation = useNavigation<any>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Mohon isi email dan password');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Mencoba login ke:', axiosClient.defaults.baseURL + '/login');
      const response = await axiosClient.post('/login', { email, password });
      console.log('Response login:', response.data);
      const token = response.data?.token;

      if (token) {
        console.log('Mendapatkan token, mengambil profil...');
        const profileRes = await axiosClient.get('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Response profil:', profileRes.data);

        const userData = {
          id: profileRes.data?.user_id || 0,
          email: email,
          name: profileRes.data?.name || 'User',
          role: profileRes.data?.role || 'Customer'
        };

        await setSession(token, userData);
      } else {
        Alert.alert('Login Gagal', 'Format response tidak sesuai dari server (Token tidak ditemukan)');
      }
    } catch (error: any) {
      console.error('Login error detail:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        Alert.alert('Login Gagal', error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('Error request:', error.request);
        Alert.alert('Login Gagal', 'Tidak ada respon dari server. Pastikan server aktif dan IP sudah benar.');
      } else {
        console.error('Error message:', error.message);
        Alert.alert('Login Gagal', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-6 justify-center"
      >
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
            <Text className="text-white text-3xl font-bold">JM</Text>
          </View>
          <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">Jaya Mandiri</Text>
          <Text className="text-base text-gray-500 mt-2 text-center">Percetakan & Advertising</Text>
        </View>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">Email</Text>
            <TextInput
              className="w-full bg-gray-50 px-4 py-4 rounded-xl border border-gray-200 text-gray-900 text-base"
              placeholder="nama@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="mt-4">
            <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">Password</Text>
            <TextInput
              className="w-full bg-gray-50 px-4 py-4 rounded-xl border border-gray-200 text-gray-900 text-base"
              placeholder="••••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity 
            className="w-full bg-blue-600 py-4 rounded-xl items-center mt-8 shadow-md shadow-blue-500/30 active:bg-blue-700"
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg tracking-wide">MASUK</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-blue-600 font-bold">Daftar sekarang</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
