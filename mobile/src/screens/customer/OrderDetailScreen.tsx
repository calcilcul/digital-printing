import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useOrderStore } from '../../store/orderStore';
import { axiosClient } from '../../api/axiosClient';

// ─── Status mapping ──────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
  pending_design:       '⏳ Menunggu Upload Desain',
  design_uploaded:      '📤 Desain Diupload, Menunggu Pembayaran',
  payment_verification: '🔍 Verifikasi Pembayaran',
  payment_rejected:     '❌ Pembayaran Ditolak',
  design_review:        '🎨 Review Desain oleh Staff',
  revision_requested:   '✏️ Revisi Desain Diminta',
  printing:             '🖨️ Sedang Dicetak',
  ready:                '✅ Siap Diambil',
  completed:            '🎉 Selesai',
  cancelled:            '🚫 Dibatalkan',
  // legacy
  waiting_payment:      '⏳ Menunggu Pembayaran',
  paid:                 '🔍 Verifikasi Pembayaran',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending_design:       { bg: '#FFF9EC', text: '#B45309', border: '#FDE68A' },
  design_uploaded:      { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  payment_verification: { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  payment_rejected:     { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' },
  design_review:        { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
  revision_requested:   { bg: '#FFF7ED', text: '#C2410C', border: '#FED7AA' },
  printing:             { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
  ready:                { bg: '#ECFDF5', text: '#047857', border: '#A7F3D0' },
  completed:            { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
  cancelled:            { bg: '#F9FAFB', text: '#6B7280', border: '#E5E7EB' },
};

export default function OrderDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params || {};

  const { currentOrder, isLoading, fetchOrderDetail } = useOrderStore();

  useEffect(() => {
    if (orderId) fetchOrderDetail(orderId);
  }, [orderId, fetchOrderDetail]);

  const handleMarkCompleted = async () => {
    try {
      await axiosClient.put(`/api/orders/${orderId}/complete`);
      Alert.alert('Sukses', 'Pesanan telah diselesaikan. Terima kasih!');
      fetchOrderDetail(orderId);
    } catch {
      Alert.alert('Gagal', 'Gagal menyelesaikan pesanan');
    }
  };

  if (isLoading || !currentOrder) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F12', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#A78BFA" />
      </SafeAreaView>
    );
  }

  const status = currentOrder.status || 'pending_design';
  const statusStyle = STATUS_COLORS[status] || STATUS_COLORS.cancelled;
  const statusLabel = STATUS_LABELS[status] || status;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F12' }} edges={['top']}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E1E24' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1C1C22', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, marginLeft: 12, color: '#fff', fontSize: 17, fontWeight: '700' }}>Detail Pesanan</Text>
        <Text style={{ color: '#666', fontSize: 12 }}>{currentOrder.order_code}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 140 }}>

        {/* Status Card */}
        <View style={{ backgroundColor: '#16161E', borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#222' }}>
          <Text style={{ color: '#888', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 10 }}>STATUS PESANAN</Text>
          <View style={{ backgroundColor: statusStyle.bg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: statusStyle.border }}>
            <Text style={{ color: statusStyle.text, fontWeight: '800', fontSize: 15 }}>{statusLabel}</Text>
          </View>

          <View style={{ marginTop: 14, flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: '#555', fontSize: 11 }}>Total Pembayaran</Text>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18, marginTop: 4 }}>
                Rp {(currentOrder.total_price || 0).toLocaleString('id-ID')}
              </Text>
            </View>
            {(currentOrder.revision_count || 0) > 0 && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#555', fontSize: 11 }}>Revisi</Text>
                <Text style={{ color: '#F59E0B', fontWeight: '700', fontSize: 14, marginTop: 4 }}>
                  {currentOrder.revision_count}/3 kali
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── BANNER: Payment Rejected ──────────────────────────────────────── */}
        {status === 'payment_rejected' && currentOrder.payment_rejected_reason && (
          <View style={{ backgroundColor: '#1C0A0A', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#7F1D1D' }}>
            <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 14, marginBottom: 6 }}>⚠️ Pembayaran Ditolak</Text>
            <Text style={{ color: '#FCA5A5', fontSize: 13, lineHeight: 20 }}>
              <Text style={{ fontWeight: '700' }}>Alasan: </Text>{currentOrder.payment_rejected_reason}
            </Text>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
              Silakan upload ulang bukti transfer yang valid.
            </Text>
          </View>
        )}

        {/* ── BANNER: Revision Requested ────────────────────────────────────── */}
        {status === 'revision_requested' && currentOrder.revision_notes && (
          <View style={{ backgroundColor: '#1C120A', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#7C2D12' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: '#F97316', fontWeight: '800', fontSize: 14 }}>✏️ Revisi ke-{currentOrder.revision_count}</Text>
              <Text style={{ color: '#555', fontSize: 12 }}>Sisa: {3 - (currentOrder.revision_count || 0)}x</Text>
            </View>
            <Text style={{ color: '#FED7AA', fontSize: 13, lineHeight: 20 }}>
              <Text style={{ fontWeight: '700' }}>Catatan Staff: </Text>{currentOrder.revision_notes}
            </Text>
          </View>
        )}

        {/* ── BANNER: Payment Verification (info) ──────────────────────────── */}
        {status === 'payment_verification' && (
          <View style={{ backgroundColor: '#0A1C14', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#14532D' }}>
            <Text style={{ color: '#4ADE80', fontWeight: '700', fontSize: 13 }}>
              🔍 Pembayaran sedang diverifikasi staff dalam 1x24 jam hari kerja.
            </Text>
          </View>
        )}

        {/* ── Order Items ────────────────────────────────────────────────────── */}
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Daftar Item</Text>
        {currentOrder.items?.map((item: any, index: number) => (
          <View key={index} style={{ backgroundColor: '#16161E', borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#222' }}>
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{item.product_name}</Text>
            <Text style={{ color: '#888', fontSize: 12, marginTop: 3 }}>
              {item.variant_name} · x{item.quantity}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
              <Text style={{ color: '#666', fontSize: 12 }}>
                {item.quantity} × Rp {(item.price || 0).toLocaleString('id-ID')}
              </Text>
              <Text style={{ color: '#A78BFA', fontWeight: '700', fontSize: 13 }}>
                Rp {(item.subtotal || item.price * item.quantity || 0).toLocaleString('id-ID')}
              </Text>
            </View>
          </View>
        ))}

        {/* ── Status Logs ───────────────────────────────────────────────────── */}
        {(() => {
          const logs = currentOrder.status_logs;
          if (!logs || logs.length === 0) return null;
          return (
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 15, marginBottom: 12 }}>Riwayat Status</Text>
              {logs.map((log: any, index: number) => (
                <View key={log.id || index} style={{ flexDirection: 'row', marginBottom: 16 }}>
                  <View style={{ alignItems: 'center', marginRight: 12 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#A78BFA', marginTop: 4 }} />
                    {index < logs.length - 1 && (
                      <View style={{ width: 1, flex: 1, backgroundColor: '#2A2A3A', marginTop: 4 }} />
                    )}
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#16161E', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#222', marginBottom: 4 }}>
                    <Text style={{ color: '#A78BFA', fontWeight: '700', fontSize: 12 }}>
                      {STATUS_LABELS[log.status] || log.status}
                    </Text>
                    {log.notes ? (
                      <Text style={{ color: '#888', fontSize: 12, marginTop: 4, lineHeight: 18 }}>{log.notes}</Text>
                    ) : null}
                    <Text style={{ color: '#444', fontSize: 10, marginTop: 6 }}>
                      {new Date(log.created_at).toLocaleString('id-ID')}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          );
        })()}

      </ScrollView>

      {/* ── Bottom Action Buttons ─────────────────────────────────────────── */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0F0F12', borderTopWidth: 1, borderTopColor: '#1E1E24' }}>

        {/* Upload Desain (status: pending_design) */}
        {status === 'pending_design' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('UploadDesign', {
              orderId: currentOrder.id,
              orderItems: currentOrder.items || [],
              totalPrice: currentOrder.total_price,
            })}
            style={{ backgroundColor: '#A78BFA', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Upload Desain 🎨</Text>
          </TouchableOpacity>
        )}

        {/* Upload Pembayaran (status: design_uploaded) */}
        {status === 'design_uploaded' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('UploadPayment', {
              orderId: currentOrder.id,
              totalPrice: currentOrder.total_price,
            })}
            style={{ backgroundColor: '#F59E0B', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#000', fontWeight: '800', fontSize: 15 }}>Upload Bukti Transfer 💳</Text>
          </TouchableOpacity>
        )}

        {/* Upload Ulang Pembayaran (status: payment_rejected) */}
        {status === 'payment_rejected' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('UploadPayment', {
              orderId: currentOrder.id,
              totalPrice: currentOrder.total_price,
              isReupload: true,
            })}
            style={{ backgroundColor: '#EF4444', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>Upload Ulang Bukti Transfer 🔄</Text>
          </TouchableOpacity>
        )}

        {/* Upload Ulang Desain (status: revision_requested) */}
        {status === 'revision_requested' && (
          <TouchableOpacity
            onPress={() => navigation.navigate('UploadDesign', {
              orderId: currentOrder.id,
              orderItems: currentOrder.items || [],
              totalPrice: currentOrder.total_price,
              isReupload: true,
            })}
            style={{ backgroundColor: '#F97316', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>
              Upload Ulang Desain ({3 - (currentOrder.revision_count || 0)}x tersisa) 🔄
            </Text>
          </TouchableOpacity>
        )}

        {/* Selesaikan Pesanan (status: ready) */}
        {status === 'ready' && (
          <TouchableOpacity
            onPress={handleMarkCompleted}
            style={{ backgroundColor: '#10B981', borderRadius: 16, paddingVertical: 16, alignItems: 'center' }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>✅ Pesanan Sudah Saya Terima</Text>
          </TouchableOpacity>
        )}

      </View>
    </SafeAreaView>
  );
}
