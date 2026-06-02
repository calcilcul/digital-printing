import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ChevronLeft, Download, FileText } from 'lucide-react-native';
import { axiosClient } from '../../api/axiosClient';
import { useAuthStore } from '../../store/authStore';
import StaffStatusBadge from '../../components/StaffStatusBadge';
import Toast from 'react-native-toast-message';

const BASE_URL = axiosClient.defaults.baseURL || 'http://10.0.2.2:8080';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n ?? 0);

const formatTanggal = (dateStr: string) => {
  try {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'long',
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
};

const OrderStatusBadge = ({ status }: { status: string }) => (
  <StaffStatusBadge status={status} />
);

export default function InvoiceDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { orderId } = route.params;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const token = useAuthStore((s) => s.token);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(`/api/orders/${orderId}`);
      const data = res.data.data ?? res.data;
      setOrder(data);

      // LOG DATA FOR DEBUGGING AS REQUESTED
      console.log('=== ORDER FULL DATA ===');
      console.log(JSON.stringify(data, null, 2));
      console.log('Order user data:', JSON.stringify(data.user ?? data.customer ?? null));
      console.log('Full order keys:', Object.keys(data));
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Gagal memuat data invoice',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1A56E8" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Gagal memuat data invoice</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={fetchInvoice}>
          <Text style={styles.retryBtnText}>Coba Lagi</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Guard status tidak valid ──────────────────────────────────────────────
  const status = order.status ?? '';
  const hasApprovedPayment = order.payment_transactions?.some(
    (t: any) => t.status === 'approved' || t.payment_status === 'approved'
  ) ?? false;
  const isInvalidStatus = !hasApprovedPayment || status === 'cancelled';

  if (isInvalidStatus) {
    return (
      <View style={styles.centerContainer}>
        <FileText size={48} color="#94A3B8" style={{ marginBottom: 16 }} />
        <Text style={styles.guardTitle}>Invoice belum tersedia.</Text>
        <Text style={styles.guardSubtitle}>Pembayaran perlu diverifikasi terlebih dahulu.</Text>
        <TouchableOpacity style={styles.backBtnGuard} onPress={() => navigation.goBack()}>
          <ChevronLeft size={16} color="#FFFFFF" />
          <Text style={styles.backBtnGuardText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── Payment Status Badge Config ───────────────────────────────────────────
  const isLunas = hasApprovedPayment;

  // Fallback chain for customer info as requested
  const customerName = order.customer_name
    ?? order.user?.name
    ?? order.customer?.name
    ?? order.user_name
    ?? '-';
  const customerEmail = order.customer_email
    ?? order.user?.email
    ?? order.customer?.email
    ?? order.email
    ?? '-';
  const customerPhone = order.customer_phone
    ?? order.user?.phone
    ?? order.customer?.phone
    ?? order.phone
    ?? '-';

  // Billing subtotal calculation
  const subtotal = order?.items?.reduce(
    (sum: number, item: any) => sum + (item.price * item.quantity), 0
  ) ?? 0;

  const handleDownload = async () => {
    if (downloading) return;
    try {
      setDownloading(true);
      if (Platform.OS === 'web') {
        // Fetch base64 JSON to completely bypass IDM interception (which only intercepts PDF content-type)
        const response = await axiosClient.get(`/api/orders/${orderId}/invoice/pdf?base64=true`);
        const base64Data = response.data.pdf;
        
        // Decode base64 to byte array
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const file = new Blob([byteArray], { type: 'application/pdf' });
        
        if (typeof window !== 'undefined') {
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL, '_blank');
        }
      } else {
        const url = `${BASE_URL}/api/orders/${orderId}/invoice/pdf?token=${token}`;
        await Linking.openURL(url);
      }
    } catch (e) {
      console.error(e);
      Toast.show({
        type: 'error',
        text1: 'Gagal membuka PDF',
      });
    } finally {
      // Delay reset agar tidak bisa double tap
      setTimeout(() => setDownloading(false), 2000);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header screen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lihat Invoice</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Screen body layout structure as requested */}
      <View style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, backgroundColor: '#F0F2F5' }} showsVerticalScrollIndicator={false}>
          {/* Kertas Invoice */}
          <View style={styles.invoicePaper}>
            
            {/* SECTION 1 — Header invoice (stripe biru + info toko) */}
            <View style={styles.stripeHeader}>
              {/* Inisial toko sebagai logo placeholder */}
              <View style={styles.logoCircle}>
                <Text style={styles.logoText}>JM</Text>
              </View>

              <Text style={styles.shopName}>
                Jaya Mandiri Digital Printing
              </Text>
              <Text style={styles.shopDetail}>
                Jl. Percetakan No. 1, Kota, Indonesia
              </Text>
              <Text style={styles.shopDetail}>
                admin@jayamandiri.com
              </Text>
            </View>

            {/* SECTION 2 — Badge status + nomor invoice */}
            <View style={{ padding: 20 }}>
              
              {/* Badge LUNAS / BELUM LUNAS — berbentuk stamp dokumen resmi */}
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <View style={{
                  borderWidth: 2.5,
                  borderColor: isLunas ? '#3B6D11' : '#A32D2D',
                  borderRadius: 6,
                  paddingHorizontal: 24,
                  paddingVertical: 10,
                  backgroundColor: isLunas ? '#EAF3DE' : '#FCEBEB',
                  transform: [{ rotate: '-3deg' }],
                }}>
                  <Text style={{
                    color: isLunas ? '#27500A' : '#791F1F',
                    fontSize: 18,
                    fontWeight: '500',
                    letterSpacing: 4,
                  }}>
                    {isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                  </Text>
                </View>
                {!isLunas && (
                  <Text style={{
                    fontSize: 11,
                    color: '#999999',
                    marginTop: 8,
                    textAlign: 'center',
                  }}>
                    Pembayaran diterima · Pesanan sedang diproses
                  </Text>
                )}
              </View>

              {/* Info metadata 2 kolom */}
              {[
                ['No. Invoice', order.order_code],
                ['Tanggal', formatTanggal(order.created_at)],
                ['Status', null],  // render badge terpisah
              ].map(([label, value], i) => (
                <View key={i} style={styles.metaRow}>
                  <Text style={{ fontSize: 13, color: '#888' }}>
                    {label}
                  </Text>
                  {label === 'Status'
                    ? <OrderStatusBadge status={order.status} />
                    : <Text style={{ fontSize: 13, fontWeight: '500', color: '#222', maxWidth: '60%', textAlign: 'right' }}>
                        {value}
                      </Text>
                  }
                </View>
              ))}
            </View>

            {/* SECTION 3 — Info pelanggan */}
            <View style={styles.customerBox}>
              <Text style={styles.customerBoxTitle}>
                Kepada
              </Text>
              <Text style={styles.customerName}>
                {customerName}
              </Text>
              <Text style={styles.customerDetail}>
                {customerEmail}
              </Text>
              <Text style={styles.customerDetail}>
                {customerPhone}
              </Text>
            </View>

            {/* SECTION 4 — Tabel item pesanan (compact, mobile-friendly) */}
            <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
              <Text style={styles.sectionHeaderTitle}>
                Item Pesanan
              </Text>

              {order.items?.map((item: any, i: number) => (
                <View key={i} style={styles.itemCard}>
                  {/* Baris 1: nama produk + subtotal */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '500', color: '#222' }}>
                        {item.product?.name ?? item.product_name}
                      </Text>
                      <Text style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                        {item.variant?.name ?? item.variant_name}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: '#1A56E8' }}>
                      {formatRupiah(item.price * item.quantity)}
                    </Text>
                  </View>

                  {/* Baris 2: qty × harga satuan */}
                  <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center' }}>
                    <View style={styles.qtyBadge}>
                      <Text style={{ fontSize: 11, color: '#666' }}>
                        {item.quantity}x
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: '#888', marginLeft: 6 }}>
                      @ {formatRupiah(item.price)}
                    </Text>
                  </View>

                  {/* Baris 3: Catatan revisi jika ada */}
                  {(item.design_status === 'revision_requested' || item.design_status === 'revision' || item.design_review?.status === 'revision_requested') && (
                    <View style={{
                      backgroundColor: '#FAEEDA',
                      borderRadius: 4,
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      marginTop: 6,
                    }}>
                      <Text style={{ fontSize: 10, color: '#633806' }}>
                        Desain sedang direvisi — tidak mempengaruhi pembayaran
                      </Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* SECTION 5 — Ringkasan billing */}
            <View style={styles.billingSummary}>
              {/* Subtotal */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: '#888' }}>
                  Subtotal
                </Text>
                <Text style={{ fontSize: 13, color: '#222' }}>
                  {formatRupiah(subtotal)}
                </Text>
              </View>

              {/* Pengiriman */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text style={{ fontSize: 13, color: '#888' }}>
                  Pengiriman
                </Text>
                <Text style={{ fontSize: 13, color: '#27500A' }}>
                  Gratis (ambil di toko)
                </Text>
              </View>

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: '#E8E8E8', marginBottom: 14 }} />

              {/* Total */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 15, fontWeight: '500', color: '#222' }}>
                  Total
                </Text>
                <Text style={{ fontSize: 18, fontWeight: '500', color: '#1A56E8' }}>
                  {formatRupiah(order.total_price)}
                </Text>
              </View>
            </View>

            {/* Catatan kaki dalam kertas */}
            <View style={styles.footerNoteContainer}>
              <Text style={styles.footerNoteText}>
                Terima kasih telah mempercayakan kebutuhan cetak Anda kepada Jaya Mandiri Digital Printing.
              </Text>
            </View>

          </View>

          {/* Spacer bottom agar konten ScrollView tidak tertutup tombol sticky */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* TOMBOL DI LUAR SCROLLVIEW — selalu terlihat di bawah screen */}
        <View style={styles.bottomStickyBar}>
          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            style={[styles.downloadBtn, { backgroundColor: downloading ? '#94B8F5' : '#1A56E8' }]}
          >
            {downloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Download size={18} color="#fff" />
            )}
            <Text style={styles.downloadBtnText}>
              {downloading
                ? 'Membuka PDF...'
                : isLunas
                ? 'Unduh Invoice'
                : 'Unduh Invoice (Belum Lunas)'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F2F5',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: '#1A56E8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  guardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  guardSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
  },
  backBtnGuard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A56E8',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backBtnGuardText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 4,
  },
  header: {
    height: Platform.OS === 'ios' ? 88 : 72,
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  invoicePaper: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  stripeHeader: {
    backgroundColor: '#1A56E8',
    padding: 24,
    alignItems: 'center',
  },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  shopName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  shopDetail: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F0F0F0',
    alignItems: 'center',
  },
  customerBox: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  customerBoxTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222222',
    marginBottom: 4,
  },
  customerDetail: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  itemCard: {
    borderWidth: 0.5,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  qtyBadge: {
    backgroundColor: '#F0F2F5',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  billingSummary: {
    marginHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 14,
    marginBottom: 8,
  },
  footerNoteContainer: {
    borderTopWidth: 0.5,
    borderTopColor: '#F0F0F0',
    padding: 16,
    alignItems: 'center',
  },
  footerNoteText: {
    fontSize: 11,
    color: '#BBBBBB',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomStickyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 0.5,
    borderTopColor: '#E8E8E8',
  },
  downloadBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});
