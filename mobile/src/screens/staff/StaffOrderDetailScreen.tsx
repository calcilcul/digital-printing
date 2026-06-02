import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, TextInput, ActivityIndicator, Alert, Linking, Platform, DeviceEventEmitter } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Clock, CheckCircle, XCircle, X, Maximize2, AlertCircle, FileText, Check, Play, Square, Printer, Download, Wallet, FileCheck, ArrowLeft } from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { axiosClient } from '../../api/axiosClient';
import { staffApi } from '../../api/staffApi';
import StaffStatusBadge from '../../components/StaffStatusBadge';
import OrderTimeline from '../../components/OrderTimeline';

const getPaymentProofPath = (order: any) => {
  if (!order) return '';
  return order.payment?.payment_proof
    || order.payment_transactions?.[0]?.payment_proof
    || order.payment_proof_url
    || '';
};

const getDesignFilePath = (item: any) => {
  if (!item) return '';
  return item.design_file_path
    || (item.design_files && item.design_files.length > 0 && item.design_files[item.design_files.length - 1]?.file_path)
    || '';
};

const getFileUrl = (filePath: string) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return encodeURI(filePath);
  const cleanPath = filePath.startsWith('/') ? filePath : '/' + filePath;
  const base = axiosClient.defaults.baseURL || 'http://10.0.2.2:8080';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return encodeURI(cleanBase + cleanPath);
};

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(n);

export default function StaffOrderDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { orderId } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modal States
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  
  const [revisionModal, setRevisionModal] = useState(false);
  const [revisionItemId, setRevisionItemId] = useState<number | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  const [finishProdModal, setFinishProdModal] = useState(false);
  const [prodNotes, setProdNotes] = useState('');

  // Timer Tick State (re-render every 60 seconds)
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const getElapsed = (startTime: string) => {
    const diff = Date.now() - new Date(startTime).getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours} jam ${minutes} menit`;
    return `${minutes} menit`;
  };

  const getQueueTime = (orderObj: any) => {
    const log = orderObj?.status_logs?.find((l: any) => l.status === 'printing');
    const timeStart = log ? new Date(log.created_at).getTime() : new Date(orderObj?.created_at).getTime();
    const diff = Date.now() - timeStart;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours} jam ${minutes} menit`;
    return `${minutes} menit`;
  };

  const fetchOrderDetail = useCallback(async () => {
    try {
      const response = await axiosClient.get(`/api/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Fetch Order Detail Error:', error);
      if (Platform.OS === 'web') {
        Toast.show({ type: 'error', text1: 'Gagal memuat detail pesanan' });
      } else {
        Alert.alert('Error', 'Gagal memuat detail pesanan');
      }
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetail();
    const sub = DeviceEventEmitter.addListener('order_updated', (data: any) => {
      if (Number(data.orderId) === Number(orderId)) {
        fetchOrderDetail();
      }
    });
    return () => {
      sub.remove();
    };
  }, [orderId, fetchOrderDetail]);

  // Actions
  const handleApprovePayment = () => {
    const amount = order?.payment?.amount
      || order?.payment_transactions?.[0]?.amount
      || order?.payment_transactions?.[0]?.total_amount
      || order?.total_price
      || 0;

    const message = `Setujui pembayaran ${formatRupiah(amount)}?`;

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        setActionLoading(true);
        (async () => {
          try {
            await staffApi.approvePayment(orderId);
            await fetchOrderDetail();
            Toast.show({ type: 'success', text1: 'Pembayaran disetujui!' });
          } catch (e) {
            console.error('Approve Payment Error:', e);
            Toast.show({ type: 'error', text1: 'Gagal menyetujui pembayaran' });
          } finally {
            setActionLoading(false);
          }
        })();
      }
    } else {
      Alert.alert('Konfirmasi', message, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Setujui', onPress: async () => {
          setActionLoading(true);
          try {
            await staffApi.approvePayment(orderId);
            await fetchOrderDetail();
            Toast.show({ type: 'success', text1: 'Pembayaran disetujui!' });
          } catch (e) {
            console.error('Approve Payment Error:', e);
            Alert.alert('Error', 'Gagal menyetujui pembayaran');
          } finally {
            setActionLoading(false);
          }
        }}
      ]);
    }
  };

  const handleRejectPayment = () => {
    const message = 'Tolak pembayaran ini?';

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        setActionLoading(true);
        (async () => {
          try {
            await staffApi.rejectPayment(orderId, "Bukti pembayaran ditolak");
            await fetchOrderDetail();
            Toast.show({ type: 'success', text1: 'Pembayaran ditolak.' });
          } catch (e) {
            console.error('Reject Payment Error:', e);
            Toast.show({ type: 'error', text1: 'Gagal menolak pembayaran' });
          } finally {
            setActionLoading(false);
          }
        })();
      }
    } else {
      Alert.alert('Konfirmasi', message, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Tolak', style: 'destructive', onPress: async () => {
          setActionLoading(true);
          try {
            await staffApi.rejectPayment(orderId, "Bukti pembayaran ditolak");
            await fetchOrderDetail();
            Toast.show({ type: 'success', text1: 'Pembayaran ditolak.' });
          } catch (e) {
            console.error('Reject Payment Error:', e);
            Alert.alert('Error', 'Gagal menolak pembayaran');
          } finally {
            setActionLoading(false);
          }
        }}
      ]);
    }
  };

  const handleApproveDesign = (itemId: number) => {
    const message = 'Setujui desain ini?';

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        setActionLoading(true);
        (async () => {
          try {
            await staffApi.approveDesign(orderId, itemId);
            await fetchOrderDetail();
            Toast.show({ type: 'success', text1: 'Desain disetujui!' });
          } catch (e) {
            console.error('Approve Design Error:', e);
            Toast.show({ type: 'error', text1: 'Gagal menyetujui desain' });
          } finally {
            setActionLoading(false);
          }
        })();
      }
    } else {
      Alert.alert('Konfirmasi', message, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Setujui', onPress: async () => {
          setActionLoading(true);
          try {
            await staffApi.approveDesign(orderId, itemId);
            await fetchOrderDetail();
            Toast.show({ type: 'success', text1: 'Desain disetujui!' });
          } catch (e) {
            console.error('Approve Design Error:', e);
            Alert.alert('Error', 'Gagal menyetujui desain');
          } finally {
            setActionLoading(false);
          }
        }}
      ]);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionItemId) return;
    setActionLoading(true);
    try {
      await staffApi.requestRevision(orderId, revisionItemId, revisionNotes);
      setRevisionModal(false);
      setRevisionItemId(null);
      setRevisionNotes('');
      await fetchOrderDetail();
      if (Platform.OS === 'web') {
        Toast.show({ type: 'success', text1: 'Revisi diminta.' });
      } else {
        Alert.alert('Sukses', 'Revisi diminta.');
      }
    } catch (e) {
      console.error('Request Revision Error:', e);
      if (Platform.OS === 'web') {
        Toast.show({ type: 'error', text1: 'Gagal meminta revisi' });
      } else {
        Alert.alert('Error', 'Gagal meminta revisi');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartProduction = () => {
    const message = 'Mulai proses cetak untuk order ini?';
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(message)) {
        setActionLoading(true);
        (async () => {
          try {
            await staffApi.startProduction(orderId);
            await fetchOrderDetail();
            Toast.show({ type: 'success', text1: 'Produksi dimulai!' });
          } catch (e) {
            console.error('Start Production Error:', e);
            Toast.show({ type: 'error', text1: 'Gagal memulai produksi' });
          } finally {
            setActionLoading(false);
          }
        })();
      }
    } else {
      Alert.alert('Konfirmasi', message, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Mulai Cetak', onPress: async () => {
          setActionLoading(true);
          try {
            await staffApi.startProduction(orderId);
            await fetchOrderDetail();
          } catch (e) {
            console.error('Start Production Error:', e);
            Alert.alert('Error', 'Gagal memulai produksi');
          } finally {
            setActionLoading(false);
          }
        }}
      ]);
    }
  };

  const handleFinishProduction = async () => {
    setActionLoading(true);
    try {
      await staffApi.finishProduction(orderId, prodNotes);
      setFinishProdModal(false);
      setProdNotes('');
      await fetchOrderDetail();
      if (Platform.OS === 'web') {
        Toast.show({ type: 'success', text1: 'Produksi selesai!' });
      } else {
        Alert.alert('Sukses', 'Produksi selesai!');
      }
    } catch (e) {
      console.error('Finish Production Error:', e);
      if (Platform.OS === 'web') {
        Toast.show({ type: 'error', text1: 'Gagal menyelesaikan produksi' });
      } else {
        Alert.alert('Error', 'Gagal menyelesaikan produksi');
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || !order) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#2563eb" /></View>;
  }

  console.log('=== StaffOrderDetailScreen Render ===');
  console.log('Order Code:', order.order_code);
  console.log('Order Status:', order.status);
  console.log('Order Items:', JSON.stringify(order.items));

  const paymentAmount = order?.payment?.amount
    || order?.payment_transactions?.[0]?.amount
    || order?.payment_transactions?.[0]?.total_amount
    || order?.total_price
    || 0;

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
        {/* 4a. Header Info */}
        <View className="bg-white p-5 border-b border-slate-200">
          <TouchableOpacity 
            className="flex-row items-center mb-4 py-1 self-start"
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color="#2563eb" size={20} />
            <Text className="text-blue-600 font-bold ml-2 text-sm">Kembali</Text>
          </TouchableOpacity>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-2xl font-black text-slate-800">{order.order_code}</Text>
            <StaffStatusBadge status={order.status} />
          </View>
          
          <Text className="text-slate-700 text-sm font-semibold mb-1">
            {order.customer_name || order.user?.name || 'Customer'} • {order.customer_phone || order.user?.phone || '-'}
          </Text>

          <Text className="text-slate-400 text-xs mb-4">
            Tanggal Order: {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(order.created_at))}
          </Text>
          
          <View className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex-row justify-between items-center">
            <View>
              <Text className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Total Harga</Text>
              <Text className="text-xl font-extrabold text-blue-600">
                {formatRupiah(order.total_price)}
              </Text>
            </View>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <OrderTimeline order={order} />
        </View>

        {/* 4b. Item Pesanan & Desain (ALWAYS VISIBLE) */}
        <View className="mt-4 bg-white p-5 border-y border-slate-200">
          <View className="flex-row items-center mb-4">
            <FileText color="#2563eb" size={20} />
            <Text className="text-lg font-bold text-slate-800 ml-2">Item Pesanan & Desain</Text>
          </View>
          
          {order.items?.map((item: any) => {
            const hasDesign = !!getDesignFilePath(item);
            return (
              <View key={item.id} className="mb-6 p-4 border border-slate-200 rounded-xl bg-white">
                <Text className="font-bold text-slate-800 text-base mb-1">
                  {item.product_name || item.product?.name || 'Produk'} - {item.variant_name || item.variant?.name || ''}
                </Text>
                <Text className="text-xs text-slate-500 mb-2">
                  Jumlah: {item.quantity}x • Harga: {formatRupiah(item.price)}
                </Text>
                <Text className="text-sm text-slate-500 mb-3">Versi ke-{item.design_version || 1}</Text>
                
                {(item.design_notes || order.revision_notes) ? (
                  <View className="bg-orange-50 p-3 rounded-lg mb-3 border border-orange-200">
                    <Text className="text-orange-800 text-xs font-bold mb-1">Catatan Revisi Sebelumnya:</Text>
                    <Text className="text-orange-700 text-sm">{item.design_notes || order.revision_notes}</Text>
                  </View>
                ) : null}

                {hasDesign ? (
                  <TouchableOpacity 
                    className="relative bg-slate-100 rounded-lg overflow-hidden mb-4 border border-slate-200 justify-center items-center"
                    style={{ minHeight: 220 }}
                    onPress={() => {
                      const url = getFileUrl(getDesignFilePath(item));
                      console.log('Design file URL:', url);
                      setFullscreenUrl(url);
                    }}
                  >
                    <Image 
                      source={{ uri: getFileUrl(getDesignFilePath(item)) }} 
                      style={{ width: '100%', height: 220 }} 
                      resizeMode="contain" 
                    />
                    <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                      <Maximize2 color="white" size={12} />
                      <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>Perbesar</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View style={{ minHeight: 100, backgroundColor: '#f1f5f9', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Text className="text-slate-500 italic">Belum ada file desain dari customer.</Text>
                  </View>
                )}

                {/* Status Desain Badge & Aksi */}
                <View className="mt-2">
                  {item.design_status === 'approved' ? (
                    <View className="bg-green-50 p-2.5 rounded-lg border border-green-200 items-center">
                      <Text className="text-green-700 font-medium text-sm">✓ Desain Disetujui</Text>
                    </View>
                  ) : item.design_status === 'revision' || item.design_status === 'revision_requested' ? (
                    <View className="bg-red-50 p-2.5 rounded-lg border border-red-200 items-center">
                      <Text className="text-red-700 font-medium text-sm">⚠ Perlu Revisi Desain</Text>
                    </View>
                  ) : (
                    <View className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 items-center">
                      <Text className="text-blue-700 font-medium text-sm">⏳ Menunggu Review Desain</Text>
                    </View>
                  )}

                  {order.status === 'design_review' && item.design_status !== 'approved' && (
                    <View className="flex-row mt-4">
                      <TouchableOpacity 
                        key="btn-reject-design"
                        style={{ flex: 1, marginRight: 8, backgroundColor: 'white', borderWidth: 1, borderColor: '#f97316', borderRadius: 8, paddingVertical: 10, alignItems: 'center' }}
                        onPress={() => { setRevisionItemId(item.id); setRevisionModal(true); }}
                        disabled={actionLoading}
                      >
                        <Text style={{ color: '#ea580c', fontWeight: 'bold', fontSize: 14 }}>Minta Revisi Desain</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        key="btn-approve-design"
                        style={{ flex: 1, marginLeft: 8, backgroundColor: '#16a34a', borderRadius: 8, paddingVertical: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                        onPress={() => handleApproveDesign(item.id)}
                        disabled={actionLoading}
                      >
                        <Check color="white" size={16} />
                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 14, marginLeft: 4 }}>Setujui Desain</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* 4c. Verifikasi Pembayaran Section */}
        {order.payment && (
          <View className="mt-4 bg-white p-5 border-y border-slate-200">
            <View className="flex-row items-center mb-4">
              <Wallet color="#ca8a04" size={20} />
              <Text className="text-lg font-bold text-slate-800 ml-2">Verifikasi Pembayaran</Text>
            </View>
            <View className="bg-yellow-50 p-3.5 rounded-xl border border-yellow-200 mb-4">
              <Text className="text-sm text-yellow-800 mb-1">Metode: <Text className="font-bold">{order.payment.payment_method}</Text></Text>
              <Text className="text-sm text-yellow-800">Nominal: <Text className="font-bold">{formatRupiah(paymentAmount)}</Text></Text>
            </View>
            {getPaymentProofPath(order) ? (
              <TouchableOpacity 
                className="relative bg-slate-100 rounded-xl overflow-hidden mb-4 border border-slate-200 justify-center items-center"
                style={{ minHeight: 200 }}
                onPress={() => {
                  const url = getFileUrl(getPaymentProofPath(order));
                  console.log('Payment proof URL:', url);
                  setFullscreenUrl(url);
                }}
              >
                <Image 
                  source={{ uri: getFileUrl(getPaymentProofPath(order)) }} 
                  style={{ width: '100%', height: 200 }} 
                  resizeMode="contain" 
                />
                <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}>
                  <Maximize2 color="white" size={12} />
                  <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 4 }}>Perbesar</Text>
                </View>
              </TouchableOpacity>
            ) : (
              <Text className="text-slate-500 italic mb-4">Bukti bayar tidak tersedia.</Text>
            )}

            {order.status === 'payment_verification' ? (
              <View className="flex-row">
                <TouchableOpacity 
                  key="btn-reject-payment"
                  style={{ flex: 1, marginRight: 8, backgroundColor: 'white', borderColor: '#ef4444', borderWidth: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                  onPress={handleRejectPayment}
                  disabled={actionLoading}
                >
                  <Text style={{ color: '#ef4444', fontWeight: 'bold' }}>Tolak Pembayaran</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  key="btn-approve-payment"
                  style={{ flex: 1, marginLeft: 8, backgroundColor: '#22c55e', borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
                  onPress={handleApprovePayment}
                  disabled={actionLoading}
                >
                  <Text style={{ color: 'white', fontWeight: 'bold' }}>Setujui Pembayaran</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="bg-green-50 p-2.5 rounded-lg border border-green-200 items-center">
                <Text className="text-green-700 font-medium text-sm">✓ Pembayaran Telah Disetujui & Diverifikasi</Text>
              </View>
            )}
          </View>
        )}

        {/* 4d. Produksi Section */}
        {order.status === 'printing' && (() => {
          const productionLog = order.production_logs?.[0];
          const hasStarted = !!productionLog?.start_time;
          const hasFinished = !!productionLog?.end_time;

          return (
            <View className="mt-4 bg-white p-5 border-y border-slate-200">
              <View className="flex-row items-center mb-4">
                <Printer color="#1A56E8" size={20} />
                <Text className="text-lg font-bold text-slate-800 ml-2">Status Produksi</Text>
              </View>
              
              {hasStarted ? (
                <View className="bg-green-50 p-4 rounded-xl border border-green-200 mb-4 items-center">
                  <Text className="text-green-800 font-medium mb-1">Durasi Pencetakan</Text>
                  <Text className="text-2xl font-bold text-green-600">Sudah {getElapsed(productionLog.start_time)}</Text>
                </View>
              ) : (
                <View className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-4 items-center">
                  <Text className="text-amber-800 font-medium mb-1">Waktu Antrian</Text>
                  <Text className="text-2xl font-bold text-amber-600">Antri sejak {getQueueTime(order)} lalu</Text>
                </View>
              )}

              {!hasStarted && (
                <TouchableOpacity 
                  className="bg-blue-600 py-3.5 rounded-xl items-center flex-row justify-center"
                  onPress={handleStartProduction}
                  disabled={actionLoading}
                >
                  <Play color="white" size={20} />
                  <Text className="text-white font-bold text-base ml-2">Mulai Cetak</Text>
                </TouchableOpacity>
              )}

              {hasStarted && !hasFinished && (
                <TouchableOpacity 
                  className="bg-green-600 py-3.5 rounded-xl items-center flex-row justify-center"
                  onPress={() => setFinishProdModal(true)}
                  disabled={actionLoading}
                >
                  <CheckCircle color="white" size={20} />
                  <Text className="text-white font-bold text-base ml-2">Tandai Selesai</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })()}
      </ScrollView>

      {/* Fullscreen Image Preview Modal */}
      <Modal visible={!!fullscreenUrl} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
          {/* Top Bar with Close and Download */}
          <View style={{ position: 'absolute', top: 48, left: 16, right: 16, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity 
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
                flexDirection: 'row', alignItems: 'center'
              }}
              onPress={() => {
                if (fullscreenUrl) Linking.openURL(fullscreenUrl);
              }}
            >
              <Download color="white" size={18} />
              <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6 }}>Unduh</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: 20, width: 40, height: 40,
                justifyContent: 'center', alignItems: 'center'
              }}
              onPress={() => setFullscreenUrl(null)}
            >
              <Text style={{ color: '#fff', fontSize: 20 }}>✕</Text>
            </TouchableOpacity>
          </View>
          {fullscreenUrl && (
            <Image source={{ uri: fullscreenUrl }} style={{ width: '100%', height: '80%' }} resizeMode="contain" />
          )}
        </View>
      </Modal>



      {/* Request Revision Modal */}
      <Modal visible={revisionModal} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-lg font-bold text-slate-800 mb-3">Minta Revisi Desain</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 mb-4"
              placeholder="Contoh: Resolusi terlalu rendah, min 300dpi"
              multiline
              numberOfLines={3}
              value={revisionNotes}
              onChangeText={setRevisionNotes}
              textAlignVertical="top"
            />
            <View className="flex-row justify-end">
              <TouchableOpacity className="px-4 py-2" onPress={() => setRevisionModal(false)}>
                <Text className="text-slate-500 font-medium">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className={`px-4 py-2 rounded-lg ml-2 ${revisionNotes.trim() ? 'bg-orange-500' : 'bg-slate-300'}`}
                onPress={handleRequestRevision}
                disabled={!revisionNotes.trim() || actionLoading}
              >
                {actionLoading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold">Kirim Revisi</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Finish Production Modal */}
      <Modal visible={finishProdModal} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center p-5">
          <View className="bg-white w-full rounded-2xl p-5">
            <Text className="text-lg font-bold text-slate-800 mb-3">Selesaikan Produksi</Text>
            <TextInput
              className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 mb-4"
              placeholder="Catatan opsional (misal: mesin sempat macet)"
              multiline
              numberOfLines={3}
              value={prodNotes}
              onChangeText={setProdNotes}
              textAlignVertical="top"
            />
            <View className="flex-row justify-end">
              <TouchableOpacity className="px-4 py-2" onPress={() => setFinishProdModal(false)}>
                <Text className="text-slate-500 font-medium">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="px-4 py-2 rounded-lg ml-2 bg-green-600"
                onPress={handleFinishProduction}
                disabled={actionLoading}
              >
                {actionLoading ? <ActivityIndicator size="small" color="white" /> : <Text className="text-white font-bold">Selesai</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
