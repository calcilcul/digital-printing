import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { axiosClient } from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setSession } = useAuthStore();
  const navigation = useNavigation<any>();
  const [isSuccess, setIsSuccess] = useState(false);
  const [userName, setUserName] = useState('');

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
      const token = response.data?.data?.token;

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
        
        // Tampilkan Custom UI Success Notification
        setUserName(userData.name);
        setIsSuccess(true);
        
        // Pindah ke Home setelah 1.5 detik
        setTimeout(() => {
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }, 1500);

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
    <SafeAreaView className="flex-1 bg-[#0A0B0D]">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} 
          className="px-6"
          showsVerticalScrollIndicator={false}
        >
          {/* Close Button / Go Back */}
          <View className="absolute top-4 right-6 z-10">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-10 h-10 rounded-full bg-[#18191D] items-center justify-center border border-[#2B2C31]"
            >
              <Text className="text-white text-lg font-light">✕</Text>
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
            <Text className="text-white text-3xl font-bold mt-6 tracking-tight text-center">Save your progress</Text>
            <Text className="text-[#8E8E93] text-sm mt-2 text-center max-w-[280px]">
              Nikmati layanan percetakan premium & monitoring pesanan secara real-time.
            </Text>
          </View>

          {/* Input Fields */}
          <View className="space-y-4">
            <View>
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
                placeholder="Kata Sandi"
                placeholderTextColor="#636469"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Next Button */}
            <TouchableOpacity 
              className="w-full bg-white py-4.5 rounded-full items-center mt-6 active:opacity-90 shadow-lg shadow-white/10"
              onPress={handleLogin}
              disabled={loading}
              style={{ height: 56, justifyContent: 'center' }}
            >
              {loading ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <Text className="text-[#0A0B0D] font-bold text-base tracking-wide">Next</Text>
              )}
            </TouchableOpacity>

            {/* Divider "or" */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-[1px] bg-[#222328]" />
              <Text className="text-[#636469] text-xs px-4">or</Text>
              <View className="flex-1 h-[1px] bg-[#222328]" />
            </View>

            {/* Alternative Access / Continue as Guest */}
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="w-full bg-[#16171B] py-4 rounded-full items-center border border-[#2F3037] active:bg-[#202126]"
              style={{ height: 52, justifyContent: 'center' }}
            >
              <Text className="text-white font-medium text-sm">Continue as Guest</Text>
            </TouchableOpacity>
          </View>

          {/* Register CTA */}
          <View className="flex-row justify-center mt-8 mb-6">
            <Text className="text-[#636469] text-sm">Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text className="text-white font-bold text-sm underline">Daftar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* SUCCESS OVERLAY */}
      {isSuccess && (
        <View className="absolute top-0 bottom-0 left-0 right-0 z-50 items-center justify-center bg-[#0A0B0D]/95">
          <Animated.View 
            entering={FadeIn.duration(300)}
            style={{ flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Animated.View entering={ZoomIn.delay(100).springify()} style={{ alignItems: 'center' }}>
              <View className="w-20 h-20 bg-[#10B981]/20 rounded-full items-center justify-center mb-6">
                <View className="w-14 h-14 bg-[#10B981] rounded-full items-center justify-center">
                  <CheckCircle2 size={32} color="white" />
                </View>
              </View>
              <Text className="text-white text-2xl font-black mb-2 text-center tracking-tight">Login Berhasil!</Text>
              <Text className="text-[#8E8E93] text-sm text-center px-8">
                Selamat datang kembali, <Text className="text-white font-bold">{userName}</Text>!{"\n"}Menyiapkan dashboard Anda...
              </Text>
            </Animated.View>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}

