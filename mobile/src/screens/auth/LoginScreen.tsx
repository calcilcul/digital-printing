import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';

type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }
    
    setLoading(true);
    try {
      await login({ email, password });
      
      const user = useAuthStore.getState().user;
      Toast.show({
        type: 'success',
        text1: `Berhasil masuk! Selamat datang, ${user?.name || ''}`,
      });
      // Redirect to HomeTab
      navigation.getParent()?.navigate('Customer', {
        screen: 'Tabs',
        params: { screen: 'HomeTab' }
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Gagal',
        text2: error?.response?.data?.error || error?.message || 'Email atau password salah',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center p-6"
      >
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={{ position: 'absolute', top: 24, left: 24, zIndex: 10, padding: 8, backgroundColor: '#e2e8f0', borderRadius: 20 }}
        >
          <X size={20} color="#475569" />
        </TouchableOpacity>

        <View className="mb-10 items-center">
          <Text className="text-3xl font-bold text-blue-600 mb-2">Jaya Mandiri</Text>
          <Text className="text-gray-500 text-base">Digital Printing Solutions</Text>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <Text className="text-xl font-bold text-slate-800 mb-6">Masuk ke Akun Anda</Text>
        
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

        <View className="mb-6">
          <Text className="text-sm font-medium text-slate-600 mb-2">Password</Text>
          <TextInput
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800"
            placeholder="Masukkan password Anda"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          className={`w-full py-4 rounded-xl items-center justify-center ${loading ? 'bg-blue-400' : 'bg-blue-600'}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Masuk</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-slate-600">Belum punya akun? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text className="text-blue-600 font-bold">Daftar Sekarang</Text>
          </TouchableOpacity>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
