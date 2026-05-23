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
    <SafeAreaView className="flex-1 bg-[#0A0B0D]">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 40 }}
        >
          {/* Top Back/Close Button */}
          <View className="absolute top-4 left-6 z-10">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-10 h-10 rounded-full bg-[#18191D] items-center justify-center border border-[#2B2C31]"
            >
              <Text className="text-white text-lg font-light">←</Text>
            </TouchableOpacity>
          </View>

          {/* Logo & Headline */}
          <View className="items-center mb-10 mt-8">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 bg-white rounded-lg items-center justify-center mr-2 shadow-md">
                <Text className="text-[#0A0B0D] font-extrabold text-base">J</Text>
              </View>
              <Text className="text-white text-xl font-bold tracking-wider">JAYA MANDIRI</Text>
            </View>
            <Text className="text-white text-3xl font-bold mt-6 tracking-tight text-center">Create your account</Text>
            <Text className="text-[#8E8E93] text-sm mt-2 text-center max-w-[280px]">
              Daftar untuk mulai menikmati semua kemudahan cetak & advertising.
            </Text>
          </View>

          {/* Input Fields */}
          <View className="space-y-4">
            <View>
              <TextInput
                className="w-full bg-[#16171B] px-5 py-4 rounded-2xl border border-[#2F3037] text-white text-base"
                placeholder="Nama Lengkap"
                placeholderTextColor="#636469"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View className="mt-3">
              <TextInput
                className="w-full bg-[#16171B] px-5 py-4 rounded-2xl border border-[#2F3037] text-white text-base"
                placeholder="Alamat Email"
                placeholderTextColor="#636469"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="mt-3">
              <TextInput
                className="w-full bg-[#16171B] px-5 py-4 rounded-2xl border border-[#2F3037] text-white text-base"
                placeholder="Kata Sandi (Min. 6 karakter)"
                placeholderTextColor="#636469"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View className="mt-3">
              <TextInput
                className="w-full bg-[#16171B] px-5 py-4 rounded-2xl border border-[#2F3037] text-white text-base"
                placeholder="Konfirmasi Kata Sandi"
                placeholderTextColor="#636469"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Register Action Button */}
            <TouchableOpacity
              className="w-full bg-white py-4.5 rounded-full items-center mt-6 active:opacity-90 shadow-lg shadow-white/10"
              onPress={handleRegister}
              disabled={loading}
              style={{ height: 56, justifyContent: 'center' }}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text className="text-[#0A0B0D] font-bold text-base tracking-wide">Next</Text>
              )}
            </TouchableOpacity>

            {/* Back to Login CTA */}
            <View className="flex-row justify-center mt-8">
              <Text className="text-[#636469] text-sm">Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-white font-bold text-sm underline">Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

