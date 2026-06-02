import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Printer, Clock, CheckCircle, Play } from 'lucide-react-native';

import { useStaffStore, StaffOrder } from '../../store/staffStore';
import { staffApi } from '../../api/staffApi';
import { StaffStackParamList } from '../../navigation/StaffTabs';

type NavigationProp = NativeStackNavigationProp<StaffStackParamList, 'Tabs'>;

export default function StaffProductionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { orders, isLoading, fetchOrders } = useStaffStore();
  
  const [actionLoading, setActionLoading] = useState(false);
  const [finishModalVisible, setFinishModalVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [prodNotes, setProdNotes] = useState('');

  // Timer Tick State (re-render every 60 seconds)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [fetchOrders])
  );

  const printingOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'printing')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [orders]);

  const handleStartProduction = (orderId: number) => {
    Alert.alert('Konfirmasi', 'Mulai proses cetak untuk order ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Mulai Cetak', onPress: async () => {
        setActionLoading(true);
        try {
          await staffApi.startProduction(orderId);
          await fetchOrders();
          Alert.alert('Sukses', 'Produksi dimulai!');
        } catch (e: any) {
          Alert.alert('Info', e.response?.data?.message || 'Gagal memulai produksi (mungkin sudah dimulai)');
        } finally {
          setActionLoading(false);
        }
      }}
    ]);
  };

  const handleFinishProduction = async () => {
    if (!selectedOrderId) return;
    setActionLoading(true);
    try {
      await staffApi.finishProduction(selectedOrderId, prodNotes);
      setFinishModalVisible(false);
      setSelectedOrderId(null);
      setProdNotes('');
      await fetchOrders();
      Alert.alert('Sukses', 'Produksi selesai! Customer dinotifikasi.');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Gagal menyelesaikan produksi');
    } finally {
      setActionLoading(false);
    }
  };

  const getElapsed = (startTime: string) => {
    const diff = Date.now() - new Date(startTime).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours} jam ${minutes} menit`;
    return `${minutes} menit`;
  };

  const getQueueTime = (item: StaffOrder) => {
    const log = item.status_logs?.find((l: any) => l.status === 'printing');
    const timeStart = log ? new Date(log.created_at).getTime() : new Date(item.created_at).getTime();
    const diff = Date.now() - timeStart;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours} jam ${minutes} menit`;
    return `${minutes} menit`;
  };

  const renderItem = ({ item }: { item: StaffOrder }) => {
    const productionLog = item.production_logs?.[0];
    const hasStarted = !!productionLog?.start_time;
    const hasFinished = !!productionLog?.end_time;
    
    return (
      <View 
        className={
          hasStarted 
            ? "bg-white p-5 rounded-2xl mb-4 border border-slate-100 border-l-4 border-l-blue-600 shadow-sm"
            : "bg-white p-5 rounded-2xl mb-4 border border-slate-100 border-l-4 border-l-amber-500 shadow-sm"
        }
      >
        <TouchableOpacity onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}>
          {/* Header row: order_code + status badge */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-bold text-slate-800 text-lg">{item.order_code}</Text>
            {hasStarted ? (
              <View style={{ backgroundColor: '#1A56E8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>Sedang Dicetak</Text>
              </View>
            ) : (
              <View style={{ backgroundColor: '#FAEEDA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                <Text style={{ color: '#633806', fontSize: 11, fontWeight: '700' }}>Menunggu Mulai</Text>
              </View>
            )}
          </View>

          {/* Info: customer name */}
          <View className="mb-3">
            <Text className="text-slate-500 text-xs uppercase font-bold tracking-wider">Customer</Text>
            <Text className="text-slate-800 text-base font-semibold mt-0.5">
              {item.customer_name || item.user?.name || 'Customer'}
            </Text>
          </View>

          {/* Info: products list */}
          <View className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100/50">
            <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1.5">Daftar Cetak</Text>
            {item.items.map((prod: any, idx: number) => (
              <View key={idx} className="flex-row justify-between items-center mb-1">
                <Text className="text-slate-700 text-sm flex-1">{prod.product_name} - {prod.variant_name}</Text>
                <Text className="font-bold text-slate-900 ml-2">{prod.quantity}x</Text>
              </View>
            ))}
          </View>

          {/* Time indicator (Green badge for printing duration, Amber for queue time) */}
          <View className="mb-4">
            {hasStarted ? (
              <View className="flex-row items-center bg-green-50 p-2.5 rounded-xl border border-green-100">
                <Clock color="#16a34a" size={16} />
                <Text className="text-green-700 text-sm font-semibold ml-2">
                  Sudah {getElapsed(productionLog.start_time)}
                </Text>
              </View>
            ) : (
              <View className="flex-row items-center bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                <Clock color="#d97706" size={16} />
                <Text className="text-amber-700 text-sm font-semibold ml-2">
                  Antri sejak {getQueueTime(item)} lalu
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Full-width single conditional button */}
        <View className="mt-1">
          {!hasStarted && (
            <TouchableOpacity 
              className="w-full bg-blue-600 py-3.5 rounded-xl items-center flex-row justify-center shadow-sm"
              onPress={() => handleStartProduction(item.id)}
              disabled={actionLoading}
            >
              <Play color="white" size={18} />
              <Text className="text-white font-bold text-base ml-2">Mulai Cetak</Text>
            </TouchableOpacity>
          )}
          {hasStarted && !hasFinished && (
            <TouchableOpacity 
              className="w-full bg-green-600 py-3.5 rounded-xl items-center flex-row justify-center shadow-sm"
              onPress={() => { setSelectedOrderId(item.id); setFinishModalVisible(true); }}
              disabled={actionLoading}
            >
              <CheckCircle color="white" size={18} />
              <Text className="text-white font-bold text-base ml-2">Tandai Selesai</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50 pt-12">
      <View className="px-5 mb-4 border-b border-slate-200 pb-4">
        <View className="flex-row items-center">
          <Printer color="#1A56E8" size={28} />
          <Text className="text-2xl font-bold text-slate-800 ml-2">Antrian Produksi</Text>
        </View>
        <Text className="text-slate-500 mt-1">{printingOrders.length} pesanan aktif</Text>
      </View>

      <FlatList
        data={printingOrders}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 20, paddingBottom: 80 }}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchOrders} />}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20">
            <Printer color="#cbd5e1" size={64} />
            <Text className="text-slate-500 text-lg font-medium mt-4">Tidak ada pesanan di antrian cetak</Text>
            <Text className="text-slate-400">Semua berjalan lancar! 🎉</Text>
          </View>
        }
      />

      {/* Finish Production Modal */}
      <Modal visible={finishModalVisible} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-end p-0">
          <View className="bg-white w-full rounded-t-3xl p-6 h-auto">
            <Text className="text-xl font-bold text-slate-800 mb-2">Selesaikan Pesanan?</Text>
            <Text className="text-slate-500 mb-4">Customer akan mendapatkan notifikasi bahwa pesanannya sudah siap diambil.</Text>
            
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 mb-6"
              placeholder="Catatan opsional (misal: bungkus rapi)"
              multiline
              numberOfLines={3}
              value={prodNotes}
              onChangeText={setProdNotes}
              textAlignVertical="top"
            />
            
            <View className="flex-row justify-end">
              <TouchableOpacity className="flex-1 mr-2 py-3 bg-slate-200 rounded-xl items-center" onPress={() => setFinishModalVisible(false)}>
                <Text className="text-slate-600 font-bold">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 ml-2 py-3 bg-green-600 rounded-xl items-center"
                onPress={handleFinishProduction}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold">Tandai Selesai</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
