import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';

const MENU_ITEMS = [
  { id: 'pesanan', emoji: '📦', label: 'Pesanan Saya', desc: 'Lihat riwayat dan status pesanan' },
  { id: 'upload', emoji: '🎨', label: 'Upload Desain', desc: 'Unggah file desain untuk pesanan Anda' },
  { id: 'bantuan', emoji: '❓', label: 'Cara Pemesanan', desc: 'Pelajari cara memesan di Jaya Mandiri' },
  { id: 'pengaturan', emoji: '⚙️', label: 'Pengaturan Akun', desc: 'Ubah data diri dan keamanan akun' },
];

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  const handleLogout = () => {
    Alert.alert(
      'Konfirmasi Keluar',
      'Apakah Anda yakin ingin keluar dari akun ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Keluar', 
          style: 'destructive', 
          onPress: async () => {
            await signOut();
          }
        }
      ]
    );
  };

  const handleMenuPress = (id: string) => {
    if (id === 'pesanan') navigation.navigate('Pesanan');
    else if (id === 'upload') navigation.navigate('UploadDesign', { orderItemId: null });
    else setActiveTab(id);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-6 py-4 bg-white shadow-sm shadow-gray-200 z-10">
        <Text className="text-2xl font-bold text-gray-900">Profil Saya</Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View className="mx-4 mt-4 bg-white p-6 rounded-3xl shadow-sm shadow-gray-200 border border-gray-100 items-center">
          <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-3 shadow-md shadow-blue-500/30">
            <Text className="text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-900 mb-1">{user?.name || 'Pengguna'}</Text>
          <Text className="text-sm text-gray-500 mb-1">{user?.email}</Text>
          <View className="mt-2 bg-blue-50 px-4 py-1 rounded-full border border-blue-100">
            <Text className="text-blue-700 font-bold text-xs uppercase tracking-wider">{user?.role || 'Customer'}</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-4 mt-6">
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleMenuPress(item.id)}
              className="bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-gray-100 border border-gray-100 flex-row items-center"
            >
              <View className="w-12 h-12 bg-gray-50 rounded-xl items-center justify-center mr-4">
                <Text className="text-2xl">{item.emoji}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900">{item.label}</Text>
                <Text className="text-gray-500 text-sm mt-0.5">{item.desc}</Text>
              </View>
              <Text className="text-gray-400 text-lg">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View className="px-4 mt-2 mb-10">
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 py-4 rounded-2xl items-center border border-red-100 flex-row justify-center"
          >
            <Text className="text-2xl mr-2">🚪</Text>
            <Text className="text-red-600 font-bold text-base">Keluar dari Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
