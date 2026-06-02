import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, Alert, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, ChevronRight, UserPlus, Shield, User, ShieldCheck, Ban, ArrowLeft, Users } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useAdminStore } from '../../store/adminStore';
import adminApi from '../../services/adminApi';

const ROLE_FILTERS = [
  { key: 'all', label: 'Semua' },
  { key: 'owner', label: 'Owner' },
  { key: 'staff', label: 'Staff' },
  { key: 'customer', label: 'Customer' },
];

export default function UserManagementScreen() {
  const navigation = useNavigation<any>();
  const { users, usersLoading, fetchUsers } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const filteredUsers = useMemo(() => {
    let filtered = users || [];

    if (activeTab !== 'all') {
      filtered = filtered.filter(u => {
        const roleStr = u.role_id === 1 ? 'owner' : u.role_id === 2 ? 'staff' : 'customer';
        return roleStr === activeTab;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        (u.name && u.name.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q))
      );
    }

    // Sort: non-active at bottom, then by role, then by created_at (descending implicitly by ID usually)
    return filtered.sort((a, b) => {
      if (a.is_active === b.is_active) return 0;
      return a.is_active ? -1 : 1;
    });
  }, [users, activeTab, searchQuery]);

  const handleToggleStatus = (user: any) => {
    if (user.role_id === 1 || user.role?.toLowerCase() === 'owner') {
      if (Platform.OS === 'web') alert('Tidak bisa menonaktifkan akun owner utama.');
      else Alert.alert('Error', 'Tidak bisa menonaktifkan akun owner utama.');
      return;
    }

    const newStatus = !user.is_active;
    const actionText = newStatus ? 'Mengaktifkan' : 'Menonaktifkan (Ban)';

    const proceedToggle = async () => {
      setActionLoading(true);
      try {
        await adminApi.updateUserStatus(user.id, newStatus);
        await fetchUsers();
        if (Platform.OS === 'web') Toast.show({ type: 'success', text1: `Berhasil ${actionText.toLowerCase()} user.` });
      } catch (error: any) {
        console.error('Toggle status error:', error);
        if (Platform.OS === 'web') Toast.show({ type: 'error', text1: `Gagal ${actionText.toLowerCase()} user.` });
        else Alert.alert('Error', `Gagal ${actionText.toLowerCase()} user.`);
      } finally {
        setActionLoading(false);
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`Yakin ingin ${actionText.toLowerCase()} user ${user.name}?`)) {
        proceedToggle();
      }
    } else {
      Alert.alert('Konfirmasi', `Yakin ingin ${actionText.toLowerCase()} user ${user.name}?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Ya, Lanjutkan', style: newStatus ? 'default' : 'destructive', onPress: proceedToggle }
      ]);
    }
  };

  const getRoleBadge = (role: string) => {
    const r = role?.toLowerCase();
    if (r === 'owner') return { bg: 'bg-purple-100', text: 'text-purple-700', icon: <ShieldCheck color="#7e22ce" size={12} /> };
    if (r === 'staff') return { bg: 'bg-blue-100', text: 'text-blue-700', icon: <Shield color="#1d4ed8" size={12} /> };
    return { bg: 'bg-slate-100', text: 'text-slate-600', icon: <User color="#475569" size={12} /> };
  };

  const renderUserItem = ({ item }: { item: any }) => {
    const roleStr = item.role || (item.role_id === 1 ? 'owner' : item.role_id === 2 ? 'staff' : 'customer');
    const roleBadge = getRoleBadge(roleStr);

    return (
      <View className={`bg-white p-4 mb-3 border ${!item.is_active ? 'border-red-200 bg-red-50/30' : 'border-slate-100'} rounded-2xl shadow-sm flex-row items-center justify-between`}>
        <View className="flex-1 pr-3">
          <View className="flex-row items-center mb-1">
            <Text className={`font-bold text-base mr-2 ${!item.is_active ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {item.name}
            </Text>
            {!item.is_active && (
              <View className="bg-red-100 px-2 py-0.5 rounded-md flex-row items-center">
                <Ban color="#dc2626" size={10} />
                <Text className="text-red-700 text-[10px] font-bold ml-1">BANNED</Text>
              </View>
            )}
          </View>
          
          <Text className="text-slate-500 text-sm mb-0.5">{item.email}</Text>
          <Text className="text-slate-400 text-xs mb-3">{item.phone || 'No phone'}</Text>
          
          <View className="flex-row items-center justify-between">
            <View className={`${roleBadge.bg} px-2.5 py-1 rounded-full flex-row items-center self-start`}>
              {roleBadge.icon}
              <Text className={`${roleBadge.text} text-[10px] font-bold ml-1.5 uppercase`}>{roleStr}</Text>
            </View>

            <View className="flex-row">
              <TouchableOpacity 
                className="bg-slate-100 px-3 py-1.5 rounded-lg mr-2"
                onPress={() => navigation.navigate('UserDetail', { user: item })}
              >
                <Text className="text-slate-600 font-medium text-xs">Detail</Text>
              </TouchableOpacity>
              
              {roleStr !== 'owner' && (
                <TouchableOpacity 
                  className={`px-3 py-1.5 rounded-lg ${item.is_active ? 'bg-red-100' : 'bg-emerald-100'}`}
                  onPress={() => handleToggleStatus(item)}
                  disabled={actionLoading}
                >
                  <Text className={`font-medium text-xs ${item.is_active ? 'text-red-700' : 'text-emerald-700'}`}>
                    {item.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 pt-12">
      {/* Header */}
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <ArrowLeft color="#334155" size={24} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-slate-800">Kelola Akun</Text>
        </View>
        
        <TouchableOpacity 
          className="bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-sm"
          onPress={() => navigation.navigate('StaffForm')}
        >
          <UserPlus color="white" size={20} />
        </TouchableOpacity>
      </View>

      {/* Search & Filter */}
      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm mb-3">
          <Search color="#94a3b8" size={20} />
          <TextInput
            className="flex-1 ml-2 text-slate-800"
            placeholder="Cari nama, email, atau no HP..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ROLE_FILTERS.map((f) => (
            <TouchableOpacity 
              key={f.key}
              onPress={() => setActiveTab(f.key)}
              className={`mr-2 px-4 py-2 rounded-xl border ${activeTab === f.key ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
            >
              <Text className={`text-sm font-semibold ${activeTab === f.key ? 'text-white' : 'text-slate-600'}`}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={usersLoading} onRefresh={fetchUsers} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Users color="#cbd5e1" size={48} />
            <Text className="text-slate-500 text-base mt-4 font-medium">Tidak ada pengguna ditemukan.</Text>
          </View>
        }
      />
    </View>
  );
}
