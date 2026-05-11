import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { axiosClient } from '../../api/axiosClient';

export default function RegisterScreen() {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Mohon isi semua data yang diperlukan');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/register', { name, email, password });
      Alert.alert('Registrasi Berhasil', 'Akun Anda berhasil dibuat. Silakan login.', [
        { text: 'Login Sekarang', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registrasi Gagal', error.response?.data?.message || 'Terjadi kesalahan, coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 40 }}>
          {/* Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} className="mb-8">
            <Text className="text-gray-500 font-medium">← Kembali</Text>
          </TouchableOpacity>

          <View className="items-center mb-10">
            <View className="w-20 h-20 bg-blue-600 rounded-2xl items-center justify-center mb-4 shadow-lg shadow-blue-500/50">
              <Text className="text-white text-3xl font-bold">JM</Text>
            </View>
            <Text className="text-3xl font-extrabold text-gray-900 tracking-tight">Buat Akun</Text>
            <Text className="text-base text-gray-500 mt-2 text-center">Daftar untuk mulai memesan</Text>
          </View>

          <View className="space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">Nama Lengkap</Text>
              <TextInput
                className="w-full bg-gray-50 px-4 py-4 rounded-xl border border-gray-200 text-gray-900 text-base"
                placeholder="Nama Anda"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mt-4">
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
                placeholder="Minimal 6 karakter"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-1 ml-1">Konfirmasi Password</Text>
              <TextInput
                className="w-full bg-gray-50 px-4 py-4 rounded-xl border border-gray-200 text-gray-900 text-base"
                placeholder="Ulangi password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              className="w-full bg-blue-600 py-4 rounded-xl items-center mt-8 shadow-md shadow-blue-500/30 active:bg-blue-700"
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-lg tracking-wide">DAFTAR</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500">Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-blue-600 font-bold">Login di sini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
