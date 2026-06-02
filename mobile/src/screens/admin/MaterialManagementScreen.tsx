import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, RefreshControl, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Search, Plus, Package, Edit2, PackagePlus, PackageMinus, X, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { useAdminStore } from '../../store/adminStore';
import adminApi from '../../services/adminApi';

export default function MaterialManagementScreen() {
  const navigation = useNavigation<any>();
  const { materials, materialsLoading, fetchMaterials } = useAdminStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Modals state
  const [createModal, setCreateModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(false);
  
  // Create Form State
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newStock, setNewStock] = useState('');

  // Adjust Form State
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [changeType, setChangeType] = useState<'in' | 'out'>('in');
  const [adjQuantity, setAdjQuantity] = useState('');
  const [adjReference, setAdjReference] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchMaterials();
    }, [fetchMaterials])
  );

  const filteredMaterials = useMemo(() => {
    let filtered = materials || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(m => m.name && m.name.toLowerCase().includes(q));
    }
    return filtered.sort((a, b) => b.id - a.id);
  }, [materials, searchQuery]);

  const handleCreate = async () => {
    if (!newName.trim() || !newUnit.trim()) {
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Nama dan satuan wajib diisi' });
      else Alert.alert('Error', 'Nama dan satuan wajib diisi');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.createMaterial({
        name: newName,
        unit: newUnit,
        stock: parseFloat(newStock) || 0
      });
      await fetchMaterials();
      
      setCreateModal(false);
      setNewName('');
      setNewUnit('');
      setNewStock('');
      
      if (Platform.OS === 'web') Toast.show({ type: 'success', text1: 'Material berhasil ditambahkan' });
      else Alert.alert('Sukses', 'Material berhasil ditambahkan');
    } catch (error: any) {
      console.error('Create material error:', error);
      const msg = error.response?.data?.message || 'Gagal menambah material';
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: msg });
      else Alert.alert('Error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const openAdjust = (item: any) => {
    setSelectedMaterial(item);
    setChangeType('in');
    setAdjQuantity('');
    setAdjReference('');
    setAdjustModal(true);
  };

  const handleAdjust = async () => {
    if (!adjQuantity || parseFloat(adjQuantity) <= 0) {
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Kuantitas harus lebih dari 0' });
      else Alert.alert('Error', 'Kuantitas harus lebih dari 0');
      return;
    }

    if (changeType === 'out' && parseFloat(adjQuantity) > selectedMaterial.stock) {
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: 'Stok tidak mencukupi' });
      else Alert.alert('Error', 'Stok tidak mencukupi');
      return;
    }

    setActionLoading(true);
    try {
      await adminApi.adjustMaterial(selectedMaterial.id, {
        change_type: changeType,
        quantity: parseFloat(adjQuantity),
        reference: adjReference
      });
      await fetchMaterials();
      
      setAdjustModal(false);
      
      if (Platform.OS === 'web') Toast.show({ type: 'success', text1: 'Stok berhasil disesuaikan' });
    } catch (error: any) {
      console.error('Adjust stock error:', error);
      const msg = error.response?.data?.error || 'Gagal menyesuaikan stok';
      if (Platform.OS === 'web') Toast.show({ type: 'error', text1: msg });
      else Alert.alert('Error', msg);
    } finally {
      setActionLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View className="bg-white p-4 mb-3 border border-slate-100 rounded-2xl shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 pr-3">
          <View className="p-3 bg-amber-100 rounded-xl mr-3">
            <Package color="#F59E0B" size={24} />
          </View>
          <View className="flex-1">
            <Text className="font-bold text-slate-800 text-base mb-0.5">{item.name}</Text>
            <View className="flex-row items-baseline">
              <Text className="text-xl font-black text-amber-600 mr-1">{item.stock}</Text>
              <Text className="text-sm font-semibold text-slate-500">{item.unit}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 flex-row items-center"
          onPress={() => openAdjust(item)}
        >
          <Edit2 color="#2563eb" size={14} />
          <Text className="text-blue-700 font-bold ml-1.5 text-xs">Sesuaikan Stok</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 pt-12">
      <View className="px-5 mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <ArrowLeft color="#334155" size={24} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-slate-800">Stok Material</Text>
        </View>
        
        <TouchableOpacity 
          className="bg-blue-600 w-10 h-10 rounded-full items-center justify-center shadow-sm"
          onPress={() => setCreateModal(true)}
        >
          <Plus color="white" size={20} />
        </TouchableOpacity>
      </View>

      <View className="px-5 mb-4">
        <View className="flex-row items-center bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm">
          <Search color="#94a3b8" size={20} />
          <TextInput
            className="flex-1 ml-2 text-slate-800"
            placeholder="Cari nama material..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredMaterials}
        keyExtractor={(item: any) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={materialsLoading} onRefresh={fetchMaterials} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Package color="#cbd5e1" size={48} />
            <Text className="text-slate-500 text-base mt-4 font-medium">Belum ada material yang terdaftar.</Text>
          </View>
        }
      />

      {/* Create Modal */}
      <Modal visible={createModal} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl h-[70%]">
            <View className="flex-row items-center justify-between p-5 border-b border-slate-100">
              <Text className="text-xl font-bold text-slate-800">Tambah Material</Text>
              <TouchableOpacity onPress={() => setCreateModal(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView className="p-5" contentContainerStyle={{ paddingBottom: 100 }}>
              <View className="mb-4">
                <Text className="text-slate-700 font-bold mb-1">Nama Material</Text>
                <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-slate-800" value={newName} onChangeText={setNewName} placeholder="Misal: Kertas Art Carton 260gsm" />
              </View>

              <View className="mb-4">
                <Text className="text-slate-700 font-bold mb-1">Satuan</Text>
                <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-slate-800" value={newUnit} onChangeText={setNewUnit} placeholder="Misal: lembar, rim, lusin, roll" />
              </View>

              <View className="mb-6">
                <Text className="text-slate-700 font-bold mb-1">Stok Awal</Text>
                <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-slate-800" value={newStock} onChangeText={setNewStock} keyboardType="numeric" placeholder="Misal: 500" />
              </View>

              <TouchableOpacity 
                className="bg-blue-600 py-3.5 rounded-xl items-center" 
                onPress={handleCreate}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Simpan Material</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Adjust Modal */}
      <Modal visible={adjustModal} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/60 justify-center items-center p-5">
          <View className="bg-white w-full rounded-2xl">
            <View className="flex-row items-center justify-between p-5 border-b border-slate-100">
              <Text className="text-lg font-bold text-slate-800">Sesuaikan Stok</Text>
              <TouchableOpacity onPress={() => setAdjustModal(false)}>
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            <View className="p-5">
              <View className="bg-amber-50 border border-amber-100 p-3 rounded-xl mb-4">
                <Text className="text-slate-500 text-xs">Material</Text>
                <Text className="font-bold text-slate-800 text-base">{selectedMaterial?.name}</Text>
                <Text className="text-amber-600 text-sm font-semibold">Stok Saat Ini: {selectedMaterial?.stock} {selectedMaterial?.unit}</Text>
              </View>

              <View className="flex-row mb-4">
                <TouchableOpacity 
                  className={`flex-1 flex-row justify-center items-center py-3 rounded-l-xl border ${changeType === 'in' ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'} border-r-0`}
                  onPress={() => setChangeType('in')}
                >
                  <PackagePlus color={changeType === 'in' ? '#059669' : '#94a3b8'} size={18} />
                  <Text className={`font-bold ml-2 ${changeType === 'in' ? 'text-emerald-700' : 'text-slate-400'}`}>Tambah Masuk</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-1 flex-row justify-center items-center py-3 rounded-r-xl border ${changeType === 'out' ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}
                  onPress={() => setChangeType('out')}
                >
                  <PackageMinus color={changeType === 'out' ? '#dc2626' : '#94a3b8'} size={18} />
                  <Text className={`font-bold ml-2 ${changeType === 'out' ? 'text-red-700' : 'text-slate-400'}`}>Kurangi / Rusak</Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-slate-700 font-bold mb-1">Jumlah</Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4">
                  <TextInput 
                    className="flex-1 h-12 text-slate-800" 
                    value={adjQuantity} 
                    onChangeText={setAdjQuantity} 
                    keyboardType="numeric" 
                    placeholder="Misal: 50" 
                  />
                  <Text className="text-slate-400 font-semibold">{selectedMaterial?.unit}</Text>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-slate-700 font-bold mb-1">Catatan / Referensi</Text>
                <TextInput className="bg-slate-50 border border-slate-200 rounded-xl px-4 h-12 text-slate-800" value={adjReference} onChangeText={setAdjReference} placeholder="Opsional (misal: Rusak basah, PO Supplier X)" />
              </View>

              <TouchableOpacity 
                className={`py-3.5 rounded-xl items-center ${changeType === 'in' ? 'bg-emerald-600' : 'bg-red-600'}`} 
                onPress={handleAdjust}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Konfirmasi Penyesuaian</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
