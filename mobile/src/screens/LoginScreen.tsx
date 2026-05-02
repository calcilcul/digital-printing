import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/config';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      if (Platform.OS === 'web') window.alert("Masukkan email dan password");
      else Alert.alert("Perhatian", "Masukkan email dan password");
      return;
    }
    
    try {
      // Panggil API Golang (pastikan server menyala dan endpoint sesuai)
      const response = await api.post('/login', { email, password });
      
      // Ambil token dari response
      const token = response.data?.token || response.data?.access_token || response.data?.data?.token;
      
      if (token) {
        await AsyncStorage.setItem('userToken', token);
      }
      
      // Navigate to Home screen
      navigation.replace('Home');
    } catch (error) {
      console.error('Login Error:', error);
      // Fallback untuk testing jika backend mati (opsional, bisa dihapus saat production)
      if (Platform.OS === 'web') window.alert("Gagal login API. Menggunakan mode simulasi.");
      else Alert.alert("API Error", "Gagal login API. Menggunakan mode simulasi.");
      
      navigation.replace('Home');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.innerContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.formWrapper}>
            <View style={styles.headerContainer}>
              <Text style={styles.title}>Selamat Datang</Text>
              <Text style={styles.subtitle}>Masuk untuk memesan cetakan Anda</Text>
            </View>
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="contoh@email.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.8}>
                <Text style={styles.loginButtonText}>Masuk & Belanja</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  innerContainer: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  formWrapper: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#000000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  formContainer: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  inputLabel: { color: '#111827', fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: '#000000', fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  loginButton: { backgroundColor: '#000000', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
