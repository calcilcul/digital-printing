import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, Alert, Platform,
  ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { axiosClient } from '../../api/axiosClient';

// ─── Types ───────────────────────────────────────────────────────────────────
interface OrderItem {
  id: number;
  product_name: string;
  variant_name: string;
  quantity: number;
  notes?: string;
  design_file_path?: string;
  design_status?: string;
}

interface ItemUploadState {
  file: DocumentPicker.DocumentPickerAsset | null;
  isUploading: boolean;
  progress: number;
  uploaded: boolean;
}

// ─── AI Blur Check (client-side heuristic) ──────────────────────────────────
// Hanya berlaku untuk gambar yang bisa dibaca — analisis sederhana via ukuran
function checkBlurHeuristic(file: DocumentPicker.DocumentPickerAsset): boolean {
  // File gambar < 50KB = kemungkinan resolusi rendah atau blur
  if (file.mimeType?.startsWith('image/') && file.size && file.size < 50 * 1024) {
    return false; // kemungkinan blur
  }
  return true; // OK
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function UploadDesignScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId, orderItems, totalPrice, isReupload } = route.params as {
    orderId: number;
    orderItems: OrderItem[];
    totalPrice: number;
    isReupload?: boolean;
  };

  const [itemStates, setItemStates] = useState<Record<number, ItemUploadState>>(
    () => Object.fromEntries(
      (orderItems || []).map((item: OrderItem) => [
        item.id,
        { file: null, isUploading: false, progress: 0, uploaded: !!item.design_file_path }
      ])
    )
  );
  const [blurWarningItems, setBlurWarningItems] = useState<Set<number>>(new Set());

  const allUploaded = (orderItems || []).every(
    (item: OrderItem) => itemStates[item.id]?.uploaded
  );

  const pickFile = useCallback(async (itemId: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'application/postscript'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const picked = result.assets[0];

        // AI blur check heuristic
        if (!checkBlurHeuristic(picked)) {
          setBlurWarningItems(prev => new Set(prev).add(itemId));
        } else {
          setBlurWarningItems(prev => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
        }

        setItemStates(prev => ({
          ...prev,
          [itemId]: { ...prev[itemId], file: picked, progress: 0 }
        }));
      }
    } catch (err) {
      console.log('Error picking file:', err);
    }
  }, []);

  const uploadFile = useCallback(async (item: OrderItem) => {
    const state = itemStates[item.id];
    if (!state?.file) {
      Alert.alert('Peringatan', 'Pilih file desain terlebih dahulu');
      return;
    }

    setItemStates(prev => ({ ...prev, [item.id]: { ...prev[item.id], isUploading: true, progress: 0 } }));

    const formData = new FormData();
    formData.append('design_file', {
      uri: Platform.OS === 'ios' ? state.file.uri.replace('file://', '') : state.file.uri,
      type: state.file.mimeType || 'application/octet-stream',
      name: state.file.name,
    } as any);

    try {
      const endpoint = isReupload
        ? `/api/orders/${orderId}/items/${item.id}/design/reupload`
        : `/api/orders/${orderId}/items/${item.id}/design`;

      await axiosClient.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const progress = e.total ? Math.round((e.loaded * 100) / e.total) : 50;
          setItemStates(prev => ({ ...prev, [item.id]: { ...prev[item.id], progress } }));
        },
      });

      setItemStates(prev => ({
        ...prev,
        [item.id]: { ...prev[item.id], isUploading: false, uploaded: true, progress: 100 }
      }));
    } catch (error: any) {
      setItemStates(prev => ({ ...prev, [item.id]: { ...prev[item.id], isUploading: false, progress: 0 } }));
      Alert.alert('Upload Gagal', error.response?.data?.message || 'Terjadi kesalahan saat upload');
    }
  }, [itemStates, orderId, isReupload]);

  const handleNext = () => {
    if (!allUploaded) {
      Alert.alert('Belum Lengkap', 'Upload desain untuk semua item terlebih dahulu');
      return;
    }
    navigation.navigate('UploadPayment', { orderId, totalPrice });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0F0F12' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1E1E24' }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1C1C22', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>
            {isReupload ? 'Upload Ulang Desain' : 'Upload Desain'}
          </Text>
          <Text style={{ color: '#666', fontSize: 12, marginTop: 2 }}>
            Order #{orderId} · {orderItems?.length} item
          </Text>
        </View>
        {/* Progress indicator */}
        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700' }}>
            {(orderItems || []).filter((i: OrderItem) => itemStates[i.id]?.uploaded).length}/{orderItems?.length}
          </Text>
          <Text style={{ color: '#555', fontSize: 10 }}>Selesai</Text>
        </View>
      </View>

      {/* Step Indicator */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 14, alignItems: 'center' }}>
        <StepDot num={1} active label="Desain" />
        <View style={{ flex: 1, height: 1, backgroundColor: '#222', marginHorizontal: 6 }} />
        <StepDot num={2} active={false} label="Bayar" />
        <View style={{ flex: 1, height: 1, backgroundColor: '#222', marginHorizontal: 6 }} />
        <StepDot num={3} active={false} label="Selesai" />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        {/* Info banner */}
        <View style={{ backgroundColor: '#1A1A2E', borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#2A2A40' }}>
          <Text style={{ color: '#A78BFA', fontWeight: '700', fontSize: 13, marginBottom: 4 }}>📋 Format yang Diterima</Text>
          <Text style={{ color: '#888', fontSize: 12, lineHeight: 18 }}>
            JPG, PNG, PDF, AI, PSD, CDR · Maks 10MB per file{'\n'}
            Resolusi minimum: 300 DPI untuk hasil cetak terbaik
          </Text>
        </View>

        {/* Per-item upload */}
        {(orderItems || []).map((item: OrderItem, index: number) => {
          const state = itemStates[item.id] || { file: null, isUploading: false, progress: 0, uploaded: false };
          const hasBlurWarning = blurWarningItems.has(item.id);

          return (
            <View key={item.id} style={{ backgroundColor: '#16161E', borderRadius: 18, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: state.uploaded ? '#10B981' : '#222' }}>
              {/* Item header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{item.product_name}</Text>
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 2 }}>
                    {item.variant_name} · x{item.quantity}
                    {item.notes ? ` · ${item.notes}` : ''}
                  </Text>
                </View>
                {state.uploaded ? (
                  <View style={{ backgroundColor: '#10B981', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✓ Uploaded</Text>
                  </View>
                ) : (
                  <View style={{ backgroundColor: '#F59E0B22', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ color: '#F59E0B', fontSize: 11, fontWeight: '700' }}>Belum</Text>
                  </View>
                )}
              </View>

              {/* Blur warning */}
              {hasBlurWarning && (
                <View style={{ backgroundColor: '#F59E0B15', borderRadius: 10, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: '#F59E0B33' }}>
                  <Text style={{ color: '#F59E0B', fontSize: 12, fontWeight: '600' }}>
                    ⚠️ File mungkin memiliki resolusi rendah. Anda masih bisa melanjutkan, tapi hasil cetak bisa kurang optimal.
                  </Text>
                </View>
              )}

              {/* File picker area */}
              {!state.uploaded && (
                <TouchableOpacity
                  onPress={() => pickFile(item.id)}
                  disabled={state.isUploading}
                  style={{
                    borderWidth: 1.5,
                    borderStyle: 'dashed',
                    borderColor: state.file ? '#A78BFA' : '#333',
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    backgroundColor: state.file ? '#1E1830' : '#111118',
                    marginBottom: 10,
                  }}
                >
                  {state.file ? (
                    <>
                      <Text style={{ color: '#A78BFA', fontSize: 22, marginBottom: 6 }}>📄</Text>
                      <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13, textAlign: 'center' }}>{state.file.name}</Text>
                      <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>
                        {((state.file.size || 0) / (1024 * 1024)).toFixed(2)} MB · Tap untuk ganti
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={{ color: '#555', fontSize: 28, marginBottom: 8 }}>📤</Text>
                      <Text style={{ color: '#888', fontSize: 13, fontWeight: '600' }}>Tap untuk pilih file</Text>
                      <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>JPG · PNG · PDF · AI · PSD · CDR</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}

              {/* Upload progress */}
              {state.isUploading && (
                <View style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#888', fontSize: 12 }}>Mengunggah...</Text>
                    <Text style={{ color: '#A78BFA', fontSize: 12, fontWeight: '700' }}>{state.progress}%</Text>
                  </View>
                  <View style={{ height: 4, backgroundColor: '#222', borderRadius: 4 }}>
                    <View style={{ height: 4, backgroundColor: '#A78BFA', borderRadius: 4, width: `${state.progress}%` }} />
                  </View>
                </View>
              )}

              {/* Upload button */}
              {!state.uploaded && (
                <TouchableOpacity
                  onPress={() => uploadFile(item)}
                  disabled={!state.file || state.isUploading}
                  style={{
                    backgroundColor: (!state.file || state.isUploading) ? '#222' : '#A78BFA',
                    borderRadius: 12,
                    paddingVertical: 12,
                    alignItems: 'center',
                  }}
                >
                  {state.isUploading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: !state.file ? '#555' : '#fff', fontWeight: '700', fontSize: 14 }}>
                      Upload Desain Item {index + 1}
                    </Text>
                  )}
                </TouchableOpacity>
              )}

              {/* Success state */}
              {state.uploaded && (
                <View style={{ backgroundColor: '#10B98115', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#10B981', fontSize: 13, fontWeight: '700' }}>✅ Desain berhasil diupload</Text>
                  <Text style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Staff akan mereview desain Anda</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, backgroundColor: '#0F0F12', borderTopWidth: 1, borderTopColor: '#1E1E24' }}>
        <TouchableOpacity
          onPress={handleNext}
          style={{
            backgroundColor: allUploaded ? '#fff' : '#1C1C22',
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: allUploaded ? '#000' : '#555', fontWeight: '800', fontSize: 15, letterSpacing: 0.5 }}>
            {allUploaded ? 'Lanjut ke Pembayaran →' : `Upload ${(orderItems || []).filter((i: OrderItem) => !itemStates[i.id]?.uploaded).length} desain lagi dulu`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Step Indicator Component ─────────────────────────────────────────────────
function StepDot({ num, active, label }: { num: number; active: boolean; label: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <View style={{
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: active ? '#A78BFA' : '#1C1C22',
        alignItems: 'center', justifyContent: 'center',
        borderWidth: active ? 0 : 1, borderColor: '#333'
      }}>
        <Text style={{ color: active ? '#fff' : '#555', fontSize: 12, fontWeight: '700' }}>{num}</Text>
      </View>
      <Text style={{ color: active ? '#A78BFA' : '#555', fontSize: 10, marginTop: 4, fontWeight: active ? '700' : '400' }}>{label}</Text>
    </View>
  );
}
