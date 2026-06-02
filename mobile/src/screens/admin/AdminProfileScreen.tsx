import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Platform, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { User, LogOut, ShieldCheck, Repeat, ChevronRight } from 'lucide-react-native';

import { useAuthStore } from '../../store/authStore';

export default function AdminProfileScreen() {
  const navigation = useNavigation<any>();
  const { user, logout, switchRoleMode } = useAuthStore();

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm('Yakin ingin keluar?')) {
        logout();
      }
    } else {
      Alert.alert('Konfirmasi Keluar', 'Yakin ingin keluar dari akun Anda?', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Keluar', style: 'destructive', onPress: () => logout() }
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="pt-16 pb-8 px-6 bg-white border-b border-slate-100 items-center">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4 border-4 border-white shadow-sm">
            <User color="#2563eb" size={48} />
          </View>
          
          <Text className="text-2xl font-black text-slate-800 mb-1">{user?.name || 'Owner'}</Text>
          <Text className="text-slate-500 mb-3">{user?.email}</Text>
          
          <View className="bg-purple-100 px-4 py-1.5 rounded-full flex-row items-center">
            <ShieldCheck color="#7e22ce" size={16} />
            <Text className="text-purple-700 font-bold ml-2 text-sm uppercase">
              {user?.role || 'OWNER'}
            </Text>
          </View>
        </View>

        <View className="p-6 w-full max-w-2xl mx-auto">
          <View className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-6 overflow-hidden">
            <TouchableOpacity 
              className="p-5 flex-row items-center border-b border-slate-100"
              onPress={() => switchRoleMode('staff')}
            >
              <View className="bg-blue-50 p-3 rounded-xl mr-4">
                <Repeat color="#2563eb" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-slate-800 font-bold text-base mb-0.5">Beralih ke Mode Staff</Text>
                <Text className="text-slate-500 text-xs">Akses operasional dan pesanan</Text>
              </View>
              <ChevronRight color="#cbd5e1" size={20} />
            </TouchableOpacity>

            <TouchableOpacity 
              className="p-5 flex-row items-center"
              onPress={handleLogout}
            >
              <View className="bg-red-50 p-3 rounded-xl mr-4">
                <LogOut color="#dc2626" size={20} />
              </View>
              <View className="flex-1">
                <Text className="text-red-600 font-bold text-base mb-0.5">Keluar Akun</Text>
                <Text className="text-red-400 text-xs">Akhiri sesi Anda saat ini</Text>
              </View>
              <ChevronRight color="#fca5a5" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
