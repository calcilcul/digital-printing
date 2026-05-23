import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useStaffStore } from '../../store/staffStore';
import { axiosClient } from '../../api/axiosClient';

// Helper to get image full URL
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/^\//, '');
  const baseURL = axiosClient.defaults.baseURL || 'http://192.168.51.238:8080';
  return `${baseURL}/${cleanPath}`;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending_design:       { label: 'Menunggu Desain', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  design_uploaded:      { label: 'Desain Diupload (Belum Bayar)', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  payment_verification: { label: 'Verifikasi Pembayaran', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  payment_rejected:     { label: 'Pembayaran Ditolak', color: 'bg-red-50 text-red-700 border-red-200' },
  design_review:        { label: 'Review Desain', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  revision_requested:   { label: 'Revisi Desain', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  printing:             { label: 'Sedang Dicetak', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  ready:                { label: 'Siap Diambil', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed:            { label: 'Selesai', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  cancelled:            { label: 'Dibatalkan', color: 'bg-red-50 text-red-600 border-red-200' },
  // legacy
  waiting_payment:      { label: 'Menunggu Pembayaran', color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  paid:                 { label: 'Menunggu Review', color: 'bg-purple-50 text-purple-700 border-purple-200' },
};

export default function StaffOrderVerificationScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params || {};
  const {
    orders,
    approvePayment,
    rejectPayment,
    approveDesign,
    requestRevision,
    finishProduction,
    fetchOrders
  } = useStaffStore();

  const [orderDetail, setOrderDetail] = useState<any>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(true);

  // Modal: Payment Rejection
  const [isPaymentRejectModalVisible, setIsPaymentRejectModalVisible] = useState(false);
  const [paymentRejectReason, setPaymentRejectReason] = useState('');

  // Modal: Design Revision
  const [isRevisionModalVisible, setIsRevisionModalVisible] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Modal: Image Zoom
  const [zoomImageUri, setZoomImageUri] = useState<string | null>(null);

  const fetchDetail = async () => {
    setIsLoadingDetail(true);
    try {
      const res = await axiosClient.get(`/api/orders/${orderId}`);
      setOrderDetail(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil detail pesanan staff:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [orderId]);

  const order = orderDetail || orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  const handleApprovePayment = async () => {
    Alert.alert('Konfirmasi', 'Setujui bukti pembayaran ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Setujui', onPress: async () => {
          const res = await approvePayment(order.id);
          if (res.success) {
            Alert.alert('Sukses', 'Pembayaran berhasil diverifikasi. Status pesanan kini Review Desain.', [
              { text: 'OK', onPress: () => {
                fetchOrders();
                fetchDetail();
              }}
            ]);
          } else {
            Alert.alert('Gagal', res.error);
          }
        }
      }
    ]);
  };

  const handleRejectPaymentSubmit = async () => {
    if (!paymentRejectReason.trim()) {
      Alert.alert('Peringatan', 'Silakan masukkan alasan penolakan terlebih dahulu.');
      return;
    }
    const res = await rejectPayment(order.id, paymentRejectReason);
    if (res.success) {
      setIsPaymentRejectModalVisible(false);
      Alert.alert('Sukses', 'Pembayaran ditolak. Alasan dikirim ke customer.', [
        { text: 'OK', onPress: () => {
          fetchOrders();
          fetchDetail();
        }}
      ]);
    } else {
      Alert.alert('Gagal', res.error);
    }
  };

  const handleApproveDesignSubmit = async () => {
    Alert.alert('Konfirmasi', 'Setujui seluruh desain dan kirim ke antrean mesin cetak?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Setujui', onPress: async () => {
          const res = await approveDesign(order.id);
          if (res.success) {
            Alert.alert('Sukses', 'Desain disetujui! Pesanan masuk antrean cetak.', [
              { text: 'OK', onPress: () => {
                fetchOrders();
                fetchDetail();
              }}
            ]);
          } else {
            Alert.alert('Gagal', res.error);
          }
        }
      }
    ]);
  };

  const handleRequestRevisionSubmit = async () => {
    if (!revisionNotes.trim()) {
      Alert.alert('Peringatan', 'Silakan masukkan detail catatan revisi desain.');
      return;
    }
    const res = await requestRevision(order.id, revisionNotes);
    if (res.success) {
      setIsRevisionModalVisible(false);
      Alert.alert('Sukses', 'Permintaan revisi berhasil dikirim ke customer.', [
        { text: 'OK', onPress: () => {
          fetchOrders();
          fetchDetail();
        }}
      ]);
    } else {
      Alert.alert('Gagal', res.error);
    }
  };

  const handleFinishProductionSubmit = async () => {
    Alert.alert('Konfirmasi', 'Tandai produksi selesai dan barang siap diambil?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Cetak Selesai', onPress: async () => {
          const res = await finishProduction(order.id, 'Cetak selesai, siap diambil');
          if (res.success) {
            Alert.alert('Sukses', 'Status pesanan diupdate ke Siap Diambil.', [
              { text: 'OK', onPress: () => {
                fetchOrders();
                fetchDetail();
              }}
            ]);
          } else {
            Alert.alert('Gagal', res.error);
          }
        }
      }
    ]);
  };

  // Status flags
  const isPaymentVerification = order.status === 'payment_verification';
  const isDesignReview = order.status === 'design_review';
  const isPrinting = order.status === 'printing';
  const isReady = order.status === 'ready';
  const isCompleted = order.status === 'completed';
  const isCancelled = order.status === 'cancelled';
  const isRevisionRequested = order.status === 'revision_requested';
  const isPaymentRejected = order.status === 'payment_rejected';

  const sLabel = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-600 border-gray-200' };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 bg-white flex-row items-center justify-between shadow-sm border-b border-gray-100 z-10">
        <View className="flex-row items-center flex-1">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-50 border border-gray-100 mr-3">
            <Text className="text-xl font-bold text-gray-700">←</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="font-bold text-lg text-gray-900 mr-2">{order.order_code}</Text>
              <View className={`px-2.5 py-0.5 rounded-full border ${sLabel.color}`}>
                <Text className="text-[10px] font-bold">{sLabel.label}</Text>
              </View>
            </View>
            <Text className="text-gray-500 text-xs mt-0.5">Pemesan: {order.user_name || order.customer_name}</Text>
          </View>
        </View>
        <Text className="text-blue-600 font-extrabold text-base">Rp {order.total_price?.toLocaleString('id-ID') || 0}</Text>
      </View>

      {isLoadingDetail ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
          <Text className="text-gray-500 text-sm mt-3">Mengambil data transaksi terbaru...</Text>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>

          {/* 💰 1. VERIFIKASI PEMBAYARAN */}
          {isPaymentVerification && (
            <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100">
              <Text className="font-bold text-gray-900 text-base mb-3">💰 Verifikasi Bukti Transfer</Text>

              {order.payment && (
                <View className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4">
                  <Text className="text-blue-800 font-bold mb-2">Rincian Pengirim:</Text>
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-gray-500 text-xs">Nominal Transfer:</Text>
                    <Text className="text-blue-600 text-xs font-extrabold">Rp {order.payment.amount?.toLocaleString('id-ID') || order.total_price?.toLocaleString('id-ID') || 0}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-500 text-xs">Bukti Upload:</Text>
                    <Text className="text-gray-800 text-xs font-bold">{order.payment.payment_proof ? 'Ada' : 'Tidak Ada'}</Text>
                  </View>
                </View>
              )}

              {/* Payment Proof Image */}
              {order.payment_proof_url || (order.payment && order.payment.payment_proof) ? (
                <View className="mb-4">
                  <Text className="text-gray-500 text-xs mb-1.5 font-semibold">Bukti Gambar (Klik untuk memperbesar):</Text>
                  <TouchableOpacity 
                    onPress={() => setZoomImageUri(getImageUrl(order.payment_proof_url || order.payment?.payment_proof))}
                    className="rounded-2xl overflow-hidden border border-gray-200"
                    activeOpacity={0.9}
                  >
                    <Image 
                      source={{ uri: getImageUrl(order.payment_proof_url || order.payment?.payment_proof) }} 
                      className="w-full h-56" 
                      resizeMode="cover" 
                    />
                    <View className="absolute bottom-2 right-2 bg-black/60 px-3 py-1 rounded-full">
                      <Text className="text-white text-[10px] font-bold">🔍 Zoom</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-4">
                  <Text className="text-amber-700 font-medium text-sm text-center">
                    Gambar bukti transfer belum diunggah.
                  </Text>
                </View>
              )}

              {/* Action buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={() => {
                    setPaymentRejectReason('');
                    setIsPaymentRejectModalVisible(true);
                  }}
                  className="flex-1 bg-red-50 py-3.5 rounded-xl items-center border border-red-200 mr-2 active:bg-red-100"
                >
                  <Text className="text-red-600 font-bold">✕ Tolak Pembayaran</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleApprovePayment}
                  className="flex-1 bg-green-500 py-3.5 rounded-xl items-center shadow-sm shadow-green-500/20 active:bg-green-600"
                >
                  <Text className="text-white font-bold">✓ Verifikasi Sukses</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 🎨 2. REVIEW DESAIN */}
          {isDesignReview && (
            <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100">
              <Text className="font-bold text-gray-900 text-base mb-2">🎨 Tindakan Review Desain</Text>
              <Text className="text-gray-500 text-xs mb-4">
                Periksa kesesuaian file desain untuk semua item di bawah. Jika ok, klik Setujui. Jika ada revisi (maks 3x), berikan catatan revisi detail.
              </Text>

              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={() => {
                    setRevisionNotes('');
                    setIsRevisionModalVisible(true);
                  }} 
                  className="flex-1 bg-orange-50 py-3.5 rounded-xl items-center border border-orange-200 mr-2 active:bg-orange-100"
                >
                  <Text className="text-orange-600 font-bold">✕ Minta Revisi Desain</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleApproveDesignSubmit} 
                  className="flex-1 bg-green-500 py-3.5 rounded-xl items-center shadow-sm shadow-green-500/20 active:bg-green-600"
                >
                  <Text className="text-white font-bold">✓ Setujui Desain</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 🖨️ 3. PROSES PRODUKSI */}
          {isPrinting && (
            <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100">
              <Text className="font-bold text-gray-900 text-base mb-3">🖨️ Proses Cetak / Produksi</Text>
              <View className="bg-blue-50 p-4 rounded-2xl border border-blue-100 mb-4 flex-row items-center">
                <Text className="text-blue-700 font-bold text-xs flex-1 text-center">
                  Desain disetujui, pesanan dalam proses cetak mesin. Tekan tombol di bawah jika seluruh cetakan sudah selesai diproduksi.
                </Text>
              </View>
              <TouchableOpacity onPress={handleFinishProductionSubmit} className="bg-indigo-600 py-3.5 rounded-xl items-center shadow-md shadow-indigo-500/20 active:bg-indigo-700">
                <Text className="text-white font-bold text-sm">✓ Selesai Cetak & Siap Diambil</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* 🔄 INFO STATUS KUSTOM */}
          {isRevisionRequested && (
            <View className="bg-orange-50 p-5 rounded-3xl mb-4 shadow-sm border border-orange-100">
              <Text className="font-bold text-orange-800 text-sm mb-2">✏️ Desain Meminta Revisi</Text>
              <Text className="text-orange-700 text-xs leading-relaxed">
                Staff telah mengirim catatan revisi ke customer. Menunggu customer mengunggah ulang file desain baru (Revisi ke-{order.revision_count}/3).
              </Text>
              {order.revision_notes ? (
                <View className="mt-3 bg-white p-3 rounded-xl border border-orange-200">
                  <Text className="text-gray-500 text-[10px] font-black uppercase">Catatan Revisi Terakhir:</Text>
                  <Text className="text-gray-800 text-xs font-semibold mt-1">{order.revision_notes}</Text>
                </View>
              ) : null}
            </View>
          )}

          {isPaymentRejected && (
            <View className="bg-red-50 p-5 rounded-3xl mb-4 shadow-sm border border-red-100">
              <Text className="font-bold text-red-800 text-sm mb-2">❌ Pembayaran Ditolak</Text>
              <Text className="text-red-700 text-xs leading-relaxed">
                Staf menolak pembayaran ini. Menunggu customer melakukan upload ulang bukti transfer baru yang sah.
              </Text>
              {order.payment_rejected_reason ? (
                <View className="mt-3 bg-white p-3 rounded-xl border border-red-200">
                  <Text className="text-gray-500 text-[10px] font-black uppercase">Alasan Penolakan:</Text>
                  <Text className="text-gray-800 text-xs font-semibold mt-1">{order.payment_rejected_reason}</Text>
                </View>
              ) : null}
            </View>
          )}

          {/* ℹ️ DETAIL ITEM PESANAN */}
          <View className="bg-white p-5 rounded-3xl mb-6 shadow-sm border border-gray-100">
            <Text className="font-bold text-gray-900 text-base mb-4">🛒 Rincian Item Pesanan</Text>
            {order.items?.map((item: any, idx: number) => {
              return (
                <View key={item.id || idx} className="pb-5 mb-5 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                  <View className="flex-row items-center mb-3">
                    <View className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden mr-3 border border-gray-100 items-center justify-center">
                      <Text style={{ fontSize: 24 }}>📦</Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-gray-900 text-sm">{item.product_name}</Text>
                      <Text className="text-gray-500 text-[11px] mt-0.5">Varian: {item.variant_name} · Qty: {item.quantity}</Text>
                      <View className="flex-row mt-1 items-center justify-between">
                        <Text className="text-blue-600 text-xs font-extrabold">Rp {(item.price * item.quantity || item.subtotal || 0).toLocaleString('id-ID')}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Design File info */}
                  {item.design_file_path ? (
                    <View className="bg-gray-50 p-3 rounded-2xl border border-gray-100 mt-2">
                      <Text className="font-bold text-gray-800 text-xs mb-2">🎨 File Desain Pelanggan:</Text>
                      <TouchableOpacity 
                        onPress={() => setZoomImageUri(getImageUrl(item.design_file_path))}
                        className="rounded-xl overflow-hidden border border-gray-200 bg-white mb-2"
                        activeOpacity={0.9}
                      >
                        <Image 
                          source={{ uri: getImageUrl(item.design_file_path) }} 
                          className="w-full h-40" 
                          resizeMode="contain" 
                        />
                        <View className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded-full">
                          <Text className="text-white text-[9px] font-bold">🔍 Zoom Desain</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View className="bg-gray-50 p-3 rounded-xl border border-gray-100 mt-2 items-center">
                      <Text className="text-gray-400 text-xs font-medium">⚠️ File desain belum diunggah oleh customer</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* 🕒 AUDIT LOGS */}
          {order.status_logs && order.status_logs.length > 0 && (
            <View className="mb-8">
              <Text className="text-[15px] font-bold text-gray-900 mb-3 ml-2">Riwayat Audit & Status</Text>
              <View className="bg-white py-5 px-4 rounded-3xl shadow-sm border border-gray-100">
                {order.status_logs.map((log: any, index: number) => (
                  <View key={log.id || index} className="flex-row mb-5 last:mb-0 relative">
                    {index !== order.status_logs.length - 1 && (
                      <View className="absolute left-[9px] top-6 bottom-[-24px] w-[2px] bg-blue-100" />
                    )}
                    <View className="w-5 h-5 rounded-full bg-blue-600 border-4 border-blue-100 mt-1 z-10" />
                    <View className="ml-4 flex-1 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                      <Text className="font-bold text-gray-900 text-[14px] mb-1">
                        {STATUS_LABELS[log.status]?.label || log.status}
                      </Text>
                      {log.notes ? (
                        <Text className="text-gray-700 text-xs leading-5 mb-2">{log.notes}</Text>
                      ) : null}
                      <View className="flex-row justify-between items-center mt-1 pt-2 border-t border-gray-200/60">
                        <Text className="text-gray-500 text-[10px]">Oleh: {log.changed_name || 'System'}</Text>
                        <Text className="text-gray-400 text-[10px]">{new Date(log.created_at).toLocaleString('id-ID')}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View className="h-10" />
        </ScrollView>
      )}

      {/* MODAL: REJECT PAYMENT */}
      <Modal
        visible={isPaymentRejectModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPaymentRejectModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full rounded-3xl p-6 shadow-xl">
            <Text className="font-extrabold text-gray-900 text-base mb-2"> Tulis Alasan Penolakan</Text>
            <Text className="text-gray-500 text-xs mb-4">
              Berikan alasan yang jelas mengapa bukti pembayaran ini ditolak agar customer dapat memperbaiki.
            </Text>

            <TextInput
              multiline
              numberOfLines={4}
              value={paymentRejectReason}
              onChangeText={setPaymentRejectReason}
              placeholder="Contoh: Nominal transfer kurang, gambar struk buram/tidak terbaca..."
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 text-gray-900 text-xs p-4 rounded-2xl border border-gray-200 mb-6 h-28"
              style={{ textAlignVertical: 'top' }}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={() => setIsPaymentRejectModalVisible(false)} 
                className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center mr-2 active:bg-gray-200"
              >
                <Text className="text-gray-600 font-bold text-xs">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleRejectPaymentSubmit} 
                className="flex-1 bg-red-500 py-3.5 rounded-xl items-center active:bg-red-600"
              >
                <Text className="text-white font-bold text-xs">Tolak Pembayaran</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: REQUEST REVISION DESIGN */}
      <Modal
        visible={isRevisionModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRevisionModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50 px-6">
          <View className="bg-white w-full rounded-3xl p-6 shadow-xl">
            <Text className="font-extrabold text-gray-900 text-base mb-2">✏️ Tulis Alasan Revisi Desain</Text>
            <Text className="text-gray-500 text-xs mb-4">
              Jelaskan bagian mana dari desain yang perlu direvisi agar customer tahu apa yang harus diperbaiki.
            </Text>

            <TextInput
              multiline
              numberOfLines={4}
              value={revisionNotes}
              onChangeText={setRevisionNotes}
              placeholder="Contoh: Desain beresolusi rendah/pecah, harap unggah kembali format PDF vector..."
              placeholderTextColor="#9ca3af"
              className="bg-gray-50 text-gray-900 text-xs p-4 rounded-2xl border border-gray-200 mb-6 h-28"
              style={{ textAlignVertical: 'top' }}
            />

            <View className="flex-row space-x-3">
              <TouchableOpacity 
                onPress={() => setIsRevisionModalVisible(false)} 
                className="flex-1 bg-gray-100 py-3.5 rounded-xl items-center mr-2 active:bg-gray-200"
              >
                <Text className="text-gray-600 font-bold text-xs">Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={handleRequestRevisionSubmit} 
                className="flex-1 bg-orange-500 py-3.5 rounded-xl items-center active:bg-orange-600"
              >
                <Text className="text-white font-bold text-xs">Kirim Catatan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: ZOOM IMAGE */}
      <Modal
        visible={zoomImageUri !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setZoomImageUri(null)}
      >
        <View className="flex-1 justify-center items-center bg-black/95">
          <TouchableOpacity 
            onPress={() => setZoomImageUri(null)}
            className="absolute top-12 right-6 w-10 h-10 bg-white/10 border border-white/20 items-center justify-center rounded-full z-10"
          >
            <Text className="text-white text-lg font-bold">✕</Text>
          </TouchableOpacity>
          
          {zoomImageUri && (
            <Image 
              source={{ uri: zoomImageUri }} 
              className="w-full h-[80%]" 
              resizeMode="contain" 
            />
          )}
          
          <Text className="text-gray-400 text-xs mt-4">Ketuk di mana saja untuk menutup</Text>
          <TouchableOpacity 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
            onPress={() => setZoomImageUri(null)} 
          />
        </View>
      </Modal>

    </SafeAreaView>
  );
}
