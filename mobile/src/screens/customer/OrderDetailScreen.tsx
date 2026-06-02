import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Image,
  StyleSheet,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  Upload,
  CreditCard,
  FileText,
  XCircle,
  CheckCircle,
  Check,
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react-native';
import { axiosClient } from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import Toast from 'react-native-toast-message';
import OrderTimeline from '../../components/OrderTimeline';

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  pending_design:        { bg: '#F1F5F9', text: '#64748B', label: 'Belum Upload Desain' },
  design_uploaded:       { bg: '#E6F1FB', text: '#0C447C', label: 'Desain Diunggah' },
  waiting_payment:       { bg: '#D3D1C7', text: '#444441', label: 'Menunggu Pembayaran' },
  payment_verification:  { bg: '#FAEEDA', text: '#633806', label: 'Menunggu Verifikasi' },
  payment_rejected:      { bg: '#FCEBEB', text: '#791F1F', label: 'Pembayaran Ditolak' },
  paid:                  { bg: '#EAF3DE', text: '#27500A', label: 'Pembayaran Diverifikasi' },
  design_review:         { bg: '#E6F1FB', text: '#0C447C', label: 'Review Desain' },
  revision_requested:    { bg: '#FEF3C7', text: '#92400E', label: 'Desain Perlu Revisi' },
  printing:              { bg: '#1A56E8', text: '#FFFFFF', label: 'Sedang Dicetak' },
  ready:                 { bg: '#EAF3DE', text: '#27500A', label: 'Siap Diambil' },
  completed:             { bg: '#27500A', text: '#FFFFFF', label: 'Selesai' },
  cancelled:             { bg: '#FCEBEB', text: '#791F1F', label: 'Dibatalkan' },
};

const PAYMENT_METHODS = [
  {
    id: 'bca',
    label: 'BCA Transfer',
    details: { bank: 'BCA', account: '1234567890', name: 'Jaya Mandiri Digital Printing' },
  },
  {
    id: 'mandiri',
    label: 'Mandiri Transfer',
    details: { bank: 'Mandiri', account: '0987654321', name: 'Jaya Mandiri Digital Printing' },
  },
  { id: 'qris', label: 'QRIS', details: null },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDateTime = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const OrderStatusBadge = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? { bg: '#EEEEEE', text: '#666666', label: status ?? 'Unknown' };
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
};

const SectionCard = ({ children, style }: { children: React.ReactNode; style?: any }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const RowInfo = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.rowInfo}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);



// ─── Design Status per Item ───────────────────────────────────────────────────

const DesignStatusSection = ({
  item,
  orderId,
  uploadingItemId,
  onUpload,
  onReupload,
  onReplace,
  orderStatus,
  revisionNotes,
}: {
  item: any;
  orderId: number;
  uploadingItemId: number | null;
  onUpload: (itemId: number) => void;
  onReupload: (itemId: number) => void;
  onReplace: (itemId: number) => void;
  orderStatus: string;
  revisionNotes?: string;
}) => {
  const isPrintingReadyCompletedCancelled = ['printing', 'ready', 'completed', 'cancelled'].includes(orderStatus);

  if (isPrintingReadyCompletedCancelled) {
    if (orderStatus === 'cancelled') {
      return (
        <View style={{ marginTop: 10 }}>
          <View style={[styles.designBadge, { backgroundColor: '#F1F5F9', alignSelf: 'flex-start' }]}>
            <Text style={[styles.designBadgeText, { color: '#64748B' }]}>Pesanan Dibatalkan</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={{ marginTop: 10 }}>
        <View style={[styles.designBadge, { backgroundColor: '#EAF3DE', alignSelf: 'flex-start' }]}>
          <Check size={12} color="#27500A" />
          <Text style={[styles.designBadgeText, { color: '#27500A', marginLeft: 5 }]}>Desain Disetujui</Text>
        </View>
      </View>
    );
  }

  const hasDesign = item.design_file_path && item.design_file_path !== '';
  const isApproved = item.design_status === 'approved';
  const isRevisionRequested = item.design_status === 'revision_requested' || item.design_status === 'revision';
  const isWaitingReview = hasDesign && item.design_status === 'pending';

  if (!hasDesign) {
    // Kondisi A — Belum ada desain
    return (
      <View style={{ marginTop: 10 }}>
        <View style={[styles.designBadge, { backgroundColor: '#F1F5F9' }]}>
          <Text style={[styles.designBadgeText, { color: '#64748B' }]}>Belum Upload Desain</Text>
        </View>
        <TouchableOpacity
          onPress={() => onUpload(item.id)}
          disabled={uploadingItemId === item.id}
          style={[styles.uploadBtn, uploadingItemId === item.id && { opacity: 0.6 }]}
        >
          {uploadingItemId === item.id ? (
            <ActivityIndicator size="small" color="#1A56E8" />
          ) : (
            <Upload size={16} color="#1A56E8" />
          )}
          <Text style={styles.uploadBtnText}>Upload Desain (Maks 10MB)</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isWaitingReview) {
    // Kondisi B — Sudah upload, menunggu review
    return (
      <View style={{ marginTop: 10 }}>
        <View style={[styles.designBadge, { backgroundColor: '#E6F1FB' }]}>
          <Clock size={12} color="#0C447C" />
          <Text style={[styles.designBadgeText, { color: '#0C447C', marginLeft: 5 }]}>Menunggu Review Staff</Text>
        </View>
        <TouchableOpacity
          onPress={() => onReplace(item.id)}
          disabled={uploadingItemId === item.id}
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 8,
              borderWidth: 0.5,
              borderColor: '#B5D4F4',
              backgroundColor: '#F0F7FF',
              alignSelf: 'flex-start',
              marginTop: 8,
            },
            uploadingItemId === item.id && { opacity: 0.6 }
          ]}
        >
          {uploadingItemId === item.id ? (
            <ActivityIndicator size="small" color="#1A56E8" />
          ) : (
            <RefreshCw size={14} color="#1A56E8" />
          )}
          <Text style={{ fontSize: 12, color: '#1A56E8' }}>Ganti Desain</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
          Desain bisa diganti selama belum direview staff
        </Text>
      </View>
    );
  }

  if (isApproved) {
    // Kondisi C — Desain disetujui
    return (
      <View style={{ marginTop: 10 }}>
        <View style={[styles.designBadge, { backgroundColor: '#EAF3DE' }]}>
          <Check size={12} color="#27500A" />
          <Text style={[styles.designBadgeText, { color: '#27500A', marginLeft: 5 }]}>Desain Disetujui</Text>
        </View>
      </View>
    );
  }

  if (isRevisionRequested) {
    // Kondisi D — Perlu revisi
    const notes = item.design_notes || revisionNotes || 'Silakan hubungi admin atau upload desain baru.';
    return (
      <View style={{ marginTop: 10 }}>
        <View style={{
          backgroundColor: '#FAEEDA',
          borderRadius: 8,
          padding: 12,
          marginTop: 8,
          borderLeftWidth: 3,
          borderLeftColor: '#EF9F27',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <AlertTriangle size={14} color="#BA7517" />
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#633806' }}>
              Desain Perlu Direvisi
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#633806' }}>
            Catatan staff: {notes}
          </Text>
          <Text style={{ fontSize: 11, color: '#854F0B', marginTop: 4 }}>
            Upload desain baru untuk item ini.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onReupload(item.id)}
          disabled={uploadingItemId === item.id}
          style={[
            styles.uploadBtn,
            { borderColor: '#EF9F27', backgroundColor: '#FFFDF9', marginTop: 8 },
            uploadingItemId === item.id && { opacity: 0.6 }
          ]}
        >
          {uploadingItemId === item.id ? (
            <ActivityIndicator size="small" color="#BA7517" />
          ) : (
            <RefreshCw size={16} color="#BA7517" />
          )}
          <Text style={[styles.uploadBtnText, { color: '#BA7517' }]}>Upload Ulang Desain</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function OrderDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const orderId = route.params?.orderId;
  const { token } = useAuthStore();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingItemId, setUploadingItemId] = useState<number | null>(null);
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  // ─── API (unchanged) ────────────────────────────────────────────────────

  const fetchOrderDetail = async () => {
    try {
      const res = await axiosClient.get(`/api/orders/${orderId}`);
      setOrder(res.data.data || res.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal mengambil detail pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetail();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOrderDetail();
    });

    const sub = DeviceEventEmitter.addListener('order_updated', (data: any) => {
      if (Number(data.orderId) === Number(orderId)) {
        fetchOrderDetail();
      }
    });

    return () => {
      unsubscribe();
      sub.remove();
    };
  }, [navigation, orderId]);

  const uploadFile = async (
    endpoint: string,
    uri: string,
    fieldName: string,
    setLoadingState: (loading: boolean) => void
  ) => {
    setLoadingState(true);
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        // On web: fetch the blob from the blob: URL, then append to FormData
        const blobResponse = await fetch(uri);
        const blob = await blobResponse.blob();
        const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
        formData.append(fieldName, blob, `upload.${ext}`);

        // Use native fetch (NOT axios) so the browser sets Content-Type with boundary automatically
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jwt_token') : null;
        const baseURL = axiosClient.defaults.baseURL ?? 'http://localhost:8000';
        const fetchRes = await fetch(`${baseURL}${endpoint}`, {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
          // No Content-Type — browser sets multipart/form-data; boundary=... automatically
        });

        const json = await fetchRes.json().catch(() => ({}));
        if (!fetchRes.ok) {
          throw { response: { data: json } };
        }
        if (json?.warning) {
          Alert.alert(
            'Peringatan Kualitas Gambar',
            'Gambar Anda mungkin buram. Apakah Anda yakin ingin lanjut cetak?',
            [{ text: 'Lanjut Cetak', style: 'default' }, { text: 'Upload Ulang', style: 'cancel' }]
          );
        } else {
          Toast.show({ type: 'success', text1: '✅ Berhasil diupload!' });
        }
      } else {
        // Native (iOS/Android): use React Native's { uri, name, type } shorthand via axios
        const filename = uri.split('/').pop() || 'upload.jpg';
        const match = /\.([\w]+)$/.exec(filename);
        const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
        formData.append(fieldName, { uri, name: filename, type } as any);

        const res = await axiosClient.post(endpoint, formData, {
          timeout: 60000,
          transformRequest: (data) => data, // Prevent axios from serializing FormData
        });

        if (res.data?.warning) {
          Alert.alert(
            'Peringatan Kualitas Gambar',
            'Gambar Anda mungkin buram. Apakah Anda yakin ingin lanjut cetak?',
            [{ text: 'Lanjut Cetak', style: 'default' }, { text: 'Upload Ulang', style: 'cancel' }]
          );
        } else {
          Toast.show({ type: 'success', text1: '✅ Berhasil diupload!' });
        }
      }

      await fetchOrderDetail();
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Periksa koneksi dan coba lagi';
      Toast.show({
        type: 'error',
        text1: 'Upload Gagal',
        text2: errMsg,
      });
    } finally {
      setLoadingState(false);
    }
  };


  const pickAndUpload = async (
    endpoint: string,
    fieldName: string,
    setLoadingState: (loading: boolean) => void,
    quality = 1,
    isReplace = false
  ) => {
    // On web, permissions are not needed
    if (Platform.OS !== 'web') {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Perhatian', 'Izin akses galeri dibutuhkan.');
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 10 * 1024 * 1024) {
        Alert.alert('Error', 'Ukuran gambar maksimal 10MB.');
        return;
      }

      if (isReplace) {
        if (Platform.OS === 'web') {
          const confirmed = window.confirm('Desain sebelumnya akan digantikan dengan file baru. Lanjutkan?');
          if (confirmed) {
            uploadFile(endpoint, asset.uri, fieldName, setLoadingState);
          }
        } else {
          Alert.alert(
            'Ganti Desain',
            'Desain sebelumnya akan digantikan dengan file baru. Lanjutkan?',
            [
              { text: 'Batal', style: 'cancel' },
              {
                text: 'Ganti',
                onPress: () => uploadFile(endpoint, asset.uri, fieldName, setLoadingState),
              },
            ]
          );
        }
        return;
      }

      uploadFile(endpoint, asset.uri, fieldName, setLoadingState);
    }
  };

  const handleUploadDesign = (orderItemId: number) =>
    pickAndUpload(`/api/orders/${orderId}/items/${orderItemId}/design`, 'design_file', (v) => setUploadingItemId(v ? orderItemId : null));

  const handleReuploadDesign = (orderItemId: number) =>
    pickAndUpload(`/api/orders/${orderId}/items/${orderItemId}/design/reupload`, 'design_file', (v) => setUploadingItemId(v ? orderItemId : null));

  const handleReplaceDesign = (orderItemId: number) => {
    pickAndUpload(
      `/api/orders/${orderId}/items/${orderItemId}/design/reupload`,
      'design_file',
      (v) => setUploadingItemId(v ? orderItemId : null),
      1,
      true // isReplace = true
    );
  };

  const handlePayment = () =>
    pickAndUpload(`/api/orders/${orderId}/payment`, 'payment_proof', setUploadingPayment, 0.8);

  const handleReuploadPayment = () =>
    pickAndUpload(`/api/orders/${orderId}/payment/reupload`, 'payment_proof', setUploadingPayment, 0.8);

  const getWarningMessage = (status: string): string => {
    switch (status) {
      case 'waiting_payment':
        return 'Pesanan akan dibatalkan dan stok dikembalikan.';
      case 'payment_verification':
        return 'Bukti pembayaran yang sudah diupload akan diabaikan. Pesanan akan dibatalkan.';
      case 'payment_rejected':
        return 'Pesanan akan dibatalkan.';
      case 'pending_design':
      case 'design_uploaded':
        return 'Pembayaran sudah diverifikasi. Jika dibatalkan, Anda perlu menghubungi admin untuk proses refund.';
      case 'design_review':
        return 'Desain sedang direview staff. Jika dibatalkan, Anda perlu menghubungi admin untuk proses refund.';
      case 'revision_requested':
        return 'Desain Anda diminta revisi. Jika dibatalkan, Anda perlu menghubungi admin untuk proses refund.';
      default:
        return 'Apakah Anda yakin ingin membatalkan pesanan ini?';
    }
  };

  const handleCancelOrder = () => {
    const warningMsg = getWarningMessage(order?.status);

    const executeCancel = async () => {
      try {
        setCancelling(true);
        await axiosClient.put(`/api/orders/${orderId}/cancel`, {
          reason: 'Dibatalkan oleh customer',
        });
        Toast.show({ type: 'success', text1: 'Pesanan dibatalkan', text2: 'Stok material telah dikembalikan.' });
        fetchOrderDetail();
      } catch (error: any) {
        const msg = error?.response?.data?.message ?? 'Gagal membatalkan pesanan. Coba lagi.';
        Toast.show({ type: 'error', text1: 'Gagal Membatalkan', text2: msg });
      } finally {
        setCancelling(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Batalkan Pesanan?\n\n${warningMsg}`);
      if (confirmed) {
        executeCancel();
      }
    } else {
      Alert.alert('Batalkan Pesanan?', warningMsg, [
        { text: 'Tidak', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: executeCancel,
        },
      ]);
    }
  };

  const handleCompleteOrder = async () => {
    try {
      await axiosClient.put(`/api/orders/${orderId}/complete`);
      Toast.show({ type: 'success', text1: 'Terima kasih! Pesanan ditandai selesai.' });
      fetchOrderDetail();
    } catch {
      Toast.show({ type: 'error', text1: 'Gagal mengkonfirmasi' });
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────

  if (loading || !order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
        <ActivityIndicator size="large" color="#1A56E8" />
      </View>
    );
  }

  const status = order.status ?? '';
  const needsPayment = status === 'waiting_payment';
  const isCancelled = status === 'cancelled';
  const isCompleted = status === 'completed';
  const isReady = status === 'ready';

  const cancellableStatuses = [
    'waiting_payment', 'pending_design', 'design_uploaded',
    'payment_verification', 'payment_rejected',
    'design_review', 'revision_requested'
  ];
  const canCancel = cancellableStatuses.includes(status);
  const hasApprovedPayment = order.payment_transactions?.some((t: any) => t.status === 'approved' || t.payment_status === 'approved') ?? false;
  const canViewInvoice = hasApprovedPayment && status !== 'cancelled';

  const paymentTx = order.payment || order.payment_transactions?.[0] || null;
  const paymentStatus = paymentTx?.payment_status || paymentTx?.status || null;
  const rawFileUrl = paymentTx?.payment_proof || paymentTx?.file_url;
  const paymentFileUrl = rawFileUrl
    ? encodeURI(rawFileUrl.startsWith('http')
      ? rawFileUrl
      : `${axiosClient.defaults.baseURL}${rawFileUrl}`)
    : null;

  const canUploadPayment =
    order.status === 'waiting_payment' &&
    (!paymentTx || paymentStatus === 'rejected');

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail Pesanan</Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Order Info Card ─────────────────────────────────────── */}
        <SectionCard style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <View>
              <Text style={styles.orderCode}>{order.order_code}</Text>
              <Text style={styles.orderDate}>
                {formatDateTime(order.created_at)}
              </Text>
            </View>
            <OrderStatusBadge status={status} />
          </View>
          <View style={styles.divider} />
          <RowInfo label="Total Item" value={`${order.items?.length ?? 0} item`} />
        </SectionCard>

        {/* ── 2. Status Timeline ─────────────────────────────────────── */}
        <OrderTimeline order={order} />

        {/* ── 3. Item Pesanan ────────────────────────────────────────── */}
        <Text style={styles.sectionHeader}>Item Pesanan</Text>
        {order.items?.map((item: any) => (
          <SectionCard key={item.id} style={{ marginBottom: 10 }}>
            {/* Product info */}
            <Text style={styles.itemName}>{item.product_name || item.product?.name}</Text>
            <Text style={styles.itemVariant}>{item.variant_name || item.variant?.name}</Text>
            <View style={styles.rowInfo}>
              <Text style={styles.rowLabel}>{item.quantity}x {formatCurrency(item.price)}</Text>
              <Text style={[styles.rowValue, { color: '#0F172A', fontWeight: '700' }]}>
                {formatCurrency(item.quantity * item.price)}
              </Text>
            </View>

            {/* Design preview thumbnail if exists */}
            {item.design_file_path ? (
              <View style={styles.designPreview}>
                <Image
                  source={{
                    uri: encodeURI(item.design_file_path.startsWith('http')
                      ? item.design_file_path
                      : `${axiosClient.defaults.baseURL}${item.design_file_path}`),
                  }}
                  style={styles.designThumb}
                  resizeMode="cover"
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>File desain terupload</Text>
                </View>
              </View>
            ) : null}

            {/* Design status (Perubahan 3) */}
            <DesignStatusSection
              item={item}
              orderId={orderId}
              uploadingItemId={uploadingItemId}
              onUpload={handleUploadDesign}
              onReupload={handleReuploadDesign}
              onReplace={handleReplaceDesign}
              orderStatus={status}
              revisionNotes={order.revision_notes}
            />
          </SectionCard>
        ))}

        {/* ── 4. Pembayaran ──────────────────────────────────────────── */}
        {needsPayment && (
          <SectionCard style={{ marginBottom: 12, marginTop: 8 }}>
            <SectionTitle title="Pembayaran" />

            {/* 4a — Pilihan metode */}
            <View style={styles.methodRow}>
              {PAYMENT_METHODS.map((m) => {
                const isActive = selectedMethod === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setSelectedMethod(m.id)}
                    style={[
                      styles.methodChip,
                      isActive && styles.methodChipActive,
                    ]}
                  >
                    <Text style={[styles.methodChipText, isActive && styles.methodChipTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Payment details based on method */}
            {selectedMethod === 'bca' || selectedMethod === 'mandiri' ? (() => {
              const m = PAYMENT_METHODS.find((x) => x.id === selectedMethod)!;
              const d = m.details!;
              return (
                <View style={styles.bankInfo}>
                  <Text style={styles.bankInfoLabel}>Bank {d.bank}</Text>
                  <Text style={styles.bankInfoAccount}>{d.account}</Text>
                  <Text style={styles.bankInfoName}>a.n. {d.name}</Text>
                </View>
              );
            })() : null}

            {selectedMethod === 'qris' && (
              <View style={styles.qrisBox}>
                <Text style={{ fontSize: 28, marginBottom: 6 }}>📱</Text>
                <Text style={styles.qrisText}>Scan QR di kasir saat pengambilan</Text>
              </View>
            )}

            {/* Info Box sesuai status */}
            {status === 'waiting_payment' && (
              <View style={[styles.warningBox, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>ℹ️</Text>
                <Text style={[styles.warningBoxText, { color: '#0369A1' }]}>
                  Silakan upload desain dan bukti pembayaran. Staff akan memverifikasi pembayaran terlebih dahulu, kemudian mereview desain Anda.
                </Text>
              </View>
            )}

            {status === 'payment_verification' && (
              <View style={[styles.warningBox, { backgroundColor: '#FEF9C3', borderColor: '#FEF08A' }]}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>ℹ️</Text>
                <Text style={[styles.warningBoxText, { color: '#A16207' }]}>
                  Bukti pembayaran sedang diverifikasi oleh admin. Anda masih bisa mengupload/mengubah desain.
                </Text>
              </View>
            )}

            {status === 'design_review' && (
              <View style={[styles.warningBox, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                <Text style={{ fontSize: 18, marginRight: 8 }}>ℹ️</Text>
                <Text style={[styles.warningBoxText, { color: '#0369A1' }]}>
                  Pembayaran telah diverifikasi. Desain Anda sedang direview oleh staff.
                </Text>
              </View>
            )}

            {/* 4c — Payment already uploaded */}
            {paymentTx && (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.paymentStatusLabel}>Status Pembayaran:</Text>
                <View style={styles.paymentStatusRow}>
                  {paymentStatus === 'approved' && (
                    <View style={[styles.paymentBadge, { backgroundColor: '#EAF3DE' }]}>
                      <Check size={12} color="#27500A" />
                      <Text style={[styles.paymentBadgeText, { color: '#27500A', marginLeft: 4 }]}>Disetujui</Text>
                    </View>
                  )}
                  {paymentStatus === 'pending' && (
                    <View style={[styles.paymentBadge, { backgroundColor: '#FAEEDA' }]}>
                      <Clock size={12} color="#633806" />
                      <Text style={[styles.paymentBadgeText, { color: '#633806', marginLeft: 4 }]}>Menunggu Verifikasi</Text>
                    </View>
                  )}
                  {paymentStatus === 'rejected' && (
                    <View style={[styles.paymentBadge, { backgroundColor: '#FCEBEB' }]}>
                      <XCircle size={12} color="#791F1F" />
                      <Text style={[styles.paymentBadgeText, { color: '#791F1F', marginLeft: 4 }]}>Ditolak</Text>
                    </View>
                  )}
                </View>

                {paymentFileUrl && (
                  <Image
                    source={{ uri: paymentFileUrl }}
                    style={styles.paymentProofThumb}
                    resizeMode="cover"
                  />
                )}

                {paymentStatus === 'rejected' && (
                  <TouchableOpacity
                    onPress={handleReuploadPayment}
                    disabled={uploadingPayment}
                    style={[styles.primaryBtn, { backgroundColor: '#EF4444', marginTop: 10 }, uploadingPayment && { opacity: 0.6 }]}
                  >
                    {uploadingPayment ? <ActivityIndicator color="white" /> : <RefreshCw size={18} color="white" />}
                    <Text style={styles.primaryBtnText}>Upload Ulang Bukti Bayar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Upload bukti bayar button */}
            {canUploadPayment && !paymentTx && (
              <TouchableOpacity
                onPress={handlePayment}
                disabled={uploadingPayment}
                style={[
                  styles.primaryBtn,
                  { marginTop: 16 },
                  uploadingPayment && { opacity: 0.6 }
                ]}
              >
                {uploadingPayment ? <ActivityIndicator color="white" /> : <CreditCard size={18} color="white" />}
                <Text style={styles.primaryBtnText}>Upload Bukti Bayar</Text>
              </TouchableOpacity>
            )}
          </SectionCard>
        )}

        {/* Payment info for non-waiting_payment (readonly) */}
        {!needsPayment && paymentTx && (
          <SectionCard style={{ marginBottom: 12 }}>
            <SectionTitle title="Bukti Pembayaran" />
            
            {paymentStatus === 'rejected' && (
              <View style={{
                backgroundColor: '#FCEBEB',
                borderRadius: 8,
                padding: 12,
                marginBottom: 12,
                borderLeftWidth: 3,
                borderLeftColor: '#A32D2D',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <XCircle size={14} color="#A32D2D" />
                  <Text style={{ fontSize: 12, fontWeight: '500', color: '#791F1F' }}>
                    Pembayaran Ditolak
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: '#A32D2D' }}>
                  Alasan: {order.payment_rejected_reason || 'Bukti pembayaran tidak valid.'}
                </Text>
                <Text style={{ fontSize: 11, color: '#A32D2D', marginTop: 4 }}>
                  Silakan upload ulang bukti pembayaran yang benar.
                </Text>
              </View>
            )}

            {paymentFileUrl && (
              paymentStatus === 'rejected' ? (
                <View style={{ position: 'relative', marginBottom: 12 }}>
                  <Image
                    source={{ uri: paymentFileUrl }}
                    style={{ width: '100%', height: 160, borderRadius: 8, opacity: 0.6 }}
                    resizeMode="cover"
                  />
                  <View style={{
                    position: 'absolute', top: 8, right: 8,
                    backgroundColor: '#A32D2D',
                    borderRadius: 4, paddingVertical: 2, paddingHorizontal: 6,
                  }}>
                    <Text style={{ color: '#fff', fontSize: 10 }}>
                      Ditolak
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.designPreview}>
                  <Image
                    source={{ uri: paymentFileUrl }}
                    style={styles.designThumb}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ fontSize: 11, color: '#64748B' }}>File bukti pembayaran terupload</Text>
                  </View>
                </View>
              )
            )}

            <View style={{ marginTop: 10 }}>
              {paymentStatus === 'approved' && (
                <View style={[styles.designBadge, { backgroundColor: '#EAF3DE' }]}>
                  <Check size={12} color="#27500A" />
                  <Text style={[styles.designBadgeText, { color: '#27500A', marginLeft: 4 }]}>Disetujui</Text>
                </View>
              )}
              {paymentStatus === 'pending' && (
                <View style={[styles.designBadge, { backgroundColor: '#FAEEDA' }]}>
                  <Clock size={12} color="#633806" />
                  <Text style={[styles.designBadgeText, { color: '#633806', marginLeft: 4 }]}>Menunggu Verifikasi</Text>
                </View>
              )}
              {paymentStatus === 'rejected' && (
                <View style={[styles.designBadge, { backgroundColor: '#FCEBEB' }]}>
                  <XCircle size={12} color="#791F1F" />
                  <Text style={[styles.designBadgeText, { color: '#791F1F', marginLeft: 4 }]}>Ditolak</Text>
                </View>
              )}

              {paymentStatus === 'rejected' ? (
                <View style={{ marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={handleReuploadPayment}
                    disabled={uploadingPayment}
                    style={[styles.primaryBtn, { backgroundColor: '#1A56E8' }, uploadingPayment && { opacity: 0.6 }]}
                  >
                    {uploadingPayment ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <RefreshCw size={14} color="white" />
                    )}
                    <Text style={[styles.primaryBtnText, { color: '#fff' }]}>Upload Ulang Bukti Bayar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                paymentStatus === 'pending' && (
                  <View style={{ marginTop: 2 }}>
                    <TouchableOpacity
                      onPress={handleReuploadPayment}
                      disabled={uploadingPayment}
                      style={[
                        {
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 8,
                          borderWidth: 0.5,
                          borderColor: '#B5D4F4',
                          backgroundColor: '#F0F7FF',
                          alignSelf: 'flex-start',
                        },
                        uploadingPayment && { opacity: 0.6 }
                      ]}
                    >
                      {uploadingPayment ? (
                        <ActivityIndicator size="small" color="#1A56E8" />
                      ) : (
                        <RefreshCw size={14} color="#1A56E8" />
                      )}
                      <Text style={{ fontSize: 12, color: '#1A56E8' }}>Ganti Bukti Bayar</Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                      Bukti bayar bisa diganti selama belum diverifikasi staff
                    </Text>
                  </View>
                )
              )}
            </View>
          </SectionCard>
        )}

        {/* ── 5. Total ───────────────────────────────────────────────── */}
        <SectionCard style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={styles.totalLabel}>Total Pembayaran</Text>
          <Text style={styles.totalAmount}>{formatCurrency(order.total_price || 0)}</Text>
        </SectionCard>

        {/* ── 6. Action Buttons (Perubahan 5) ───────────────────────── */}

        {/* waiting_payment → Batalkan */}
        {canCancel && (
          <TouchableOpacity
            onPress={handleCancelOrder}
            disabled={uploadingItemId !== null || uploadingPayment || cancelling}
            style={[
              {
                backgroundColor: cancelling ? '#F7C1C1' : '#FCEBEB',
                borderWidth: 1.5,
                borderColor: cancelling ? '#F09595' : '#791F1F',
                borderRadius: 12,
                paddingVertical: 14,
                paddingHorizontal: 20,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8,
                opacity: (uploadingItemId !== null || uploadingPayment) ? 0.6 : (cancelling ? 0.7 : 1),
              }
            ]}
          >
            {cancelling ? (
              <ActivityIndicator size="small" color="#A32D2D" />
            ) : (
              <XCircle size={18} color="#791F1F" />
            )}
            <Text style={{
              color: '#791F1F',
              fontSize: 14,
              fontWeight: '700',
              marginLeft: 6
            }}>
              {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
            </Text>
          </TouchableOpacity>
        )}

        {/* ready → Konfirmasi Diambil */}
        {isReady && (
          <TouchableOpacity
            onPress={handleCompleteOrder}
            disabled={uploadingItemId !== null || uploadingPayment}
            style={[styles.primaryBtn, { backgroundColor: '#27500A' }]}
          >
            <CheckCircle size={18} color="white" />
            <Text style={styles.primaryBtnText}>Konfirmasi Sudah Diambil</Text>
          </TouchableOpacity>
        )}

        {/* Lihat Invoice */}
        {canViewInvoice && (
          <TouchableOpacity
            onPress={() => navigation.navigate('InvoiceDetail', { orderId: order.id })}
            style={styles.outlineBtn}
          >
            <FileText size={18} color="#1A56E8" />
            <Text style={styles.outlineBtnText}>Lihat Invoice</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  header: {
    paddingTop: 52,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', flex: 1 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#EEEEEE',
    marginHorizontal: 0,
    padding: 16,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.4 },
  sectionHeader: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 8, marginTop: 4 },

  rowInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 },
  rowLabel: { fontSize: 13, color: '#64748B' },
  rowValue: { fontSize: 13, color: '#334155', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },

  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  orderCode: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#64748B' },

  // Timeline
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 3 },
  timelineLine: { width: 1, flex: 1, backgroundColor: '#CBD5E1', marginTop: 2 },
  timelineLabel: { fontSize: 13, fontWeight: '600', color: '#1E293B' },
  timelineDate: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  timelineNotes: { fontSize: 11, color: '#64748B', marginTop: 3, fontStyle: 'italic' },

  // Item
  itemName: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  itemVariant: { fontSize: 12, color: '#3B82F6', marginBottom: 8 },

  // Design
  designBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, marginBottom: 6 },
  designBadgeText: { fontSize: 11, fontWeight: '700' },
  uploadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1A56E8', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginTop: 6 },
  uploadBtnText: { color: '#1A56E8', fontWeight: '700', fontSize: 13, marginLeft: 6 },
  revisionBox: { backgroundColor: '#FAEEDA', borderLeftWidth: 3, borderLeftColor: '#EF9F27', padding: 10, borderRadius: 6, marginVertical: 8 },
  revisionBoxTitle: { fontSize: 11, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  revisionBoxText: { fontSize: 12, color: '#7C2D12', lineHeight: 18 },

  designPreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, padding: 8, marginTop: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  designThumb: { width: 48, height: 48, borderRadius: 6, backgroundColor: '#E2E8F0' },

  // Payment methods
  methodRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  methodChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#EEEEEE' },
  methodChipActive: { backgroundColor: '#E8F0FE', borderColor: '#1A56E8' },
  methodChipText: { fontSize: 12, fontWeight: '600', color: '#666666' },
  methodChipTextActive: { color: '#1A56E8' },

  bankInfo: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 14, marginBottom: 8 },
  bankInfoLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 4 },
  bankInfoAccount: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: 1, marginBottom: 2 },
  bankInfoName: { fontSize: 12, color: '#64748B' },

  qrisBox: { backgroundColor: '#F8FAFC', borderRadius: 10, padding: 20, alignItems: 'center', marginBottom: 8 },
  qrisText: { fontSize: 13, color: '#475569', fontWeight: '600', textAlign: 'center' },

  warningBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FAEEDA', borderLeftWidth: 3, borderLeftColor: '#EF9F27', padding: 10, borderRadius: 6, marginTop: 8, gap: 8 },
  warningBoxText: { flex: 1, fontSize: 12, color: '#7C2D12', lineHeight: 18 },

  paymentStatusLabel: { fontSize: 12, color: '#64748B', fontWeight: '600', marginBottom: 8 },
  paymentStatusRow: { flexDirection: 'row', marginBottom: 10 },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  paymentBadgeText: { fontSize: 11, fontWeight: '700' },
  paymentProofThumb: { width: '100%', height: 180, borderRadius: 10, backgroundColor: '#E2E8F0', marginTop: 8 },

  // Total
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  totalAmount: { fontSize: 18, fontWeight: '800', color: '#1A56E8' },

  // Action buttons
  primaryBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1A56E8', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, gap: 8 },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14, marginLeft: 6 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#1A56E8', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, gap: 8, backgroundColor: '#FFFFFF' },
  outlineBtnText: { color: '#1A56E8', fontWeight: '700', fontSize: 14, marginLeft: 6 },
  outlineDangerBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#791F1F', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, gap: 8, backgroundColor: '#FCEBEB' },
  outlineDangerBtnText: { color: '#791F1F', fontWeight: '700', fontSize: 14, marginLeft: 6 },
});
