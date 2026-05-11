import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAdminStore } from '../../store/adminStore';

export default function ManagerMaterialScreen() {
  const { materials, isLoading, fetchMaterials, adjustMaterialStock } = useAdminStore();
  const [adjustingId, setAdjustingId] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'add' | 'deduct'>('add');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleAdjust = async (materialId: number) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert('Error', 'Masukkan jumlah yang valid');
      return;
    }
    
    const res = await adjustMaterialStock(materialId, Number(amount), type, reason || 'Penyesuaian stok');
    if (res.success) {
      Alert.alert('Sukses', 'Stok berhasil diperbarui');
      setAdjustingId(null);
      setAmount('');
      setReason('');
    } else {
      Alert.alert('Gagal', res.error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <View className="px-6 py-4 bg-white shadow-sm shadow-gray-200 z-10">
        <Text className="text-xl font-bold text-gray-900">Stok Bahan Baku</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#059669" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
          {materials.map((mat) => (
            <View key={mat.id} className="bg-white p-5 rounded-3xl mb-4 shadow-sm shadow-gray-200 border border-gray-100">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-gray-900 flex-1 text-lg">{mat.name}</Text>
                <View className="bg-gray-100 px-3 py-1 rounded-lg">
                  <Text className="text-gray-700 font-bold">{mat.stock} {mat.unit}</Text>
                </View>
              </View>

              {adjustingId === mat.id ? (
                <View className="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <View className="flex-row mb-3 space-x-2">
                    <TouchableOpacity 
                      onPress={() => setType('add')}
                      className={`flex-1 py-2 rounded-lg items-center ${type === 'add' ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <Text className={type === 'add' ? 'text-white font-bold' : 'text-gray-500'}>+ Tambah</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setType('deduct')}
                      className={`flex-1 py-2 rounded-lg items-center ${type === 'deduct' ? 'bg-red-500' : 'bg-gray-200'}`}
                    >
                      <Text className={type === 'deduct' ? 'text-white font-bold' : 'text-gray-500'}>- Kurangi</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <TextInput
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-2"
                    placeholder="Jumlah"
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                  />
                  <TextInput
                    className="bg-white border border-gray-200 rounded-lg px-3 py-2 mb-3"
                    placeholder="Alasan (opsional)"
                    value={reason}
                    onChangeText={setReason}
                  />
                  
                  <View className="flex-row space-x-2">
                    <TouchableOpacity 
                      onPress={() => setAdjustingId(null)}
                      className="flex-1 bg-gray-200 py-3 rounded-lg items-center"
                    >
                      <Text className="text-gray-700 font-bold">Batal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => handleAdjust(mat.id)}
                      className="flex-1 bg-blue-600 py-3 rounded-lg items-center"
                    >
                      <Text className="text-white font-bold">Simpan</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  onPress={() => setAdjustingId(mat.id)}
                  className="mt-2 bg-emerald-50 py-2 rounded-xl border border-emerald-100 items-center"
                >
                  <Text className="text-emerald-700 font-bold text-sm">Update Stok</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          <View className="h-10" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
