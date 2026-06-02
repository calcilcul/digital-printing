import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Clock, XCircle, AlertTriangle } from 'lucide-react-native';

const STATUS_LABELS: Record<string, string> = {
  waiting_payment:      'Pesanan Dibuat',
  payment_verification: 'Bukti Bayar Diunggah',
  payment_rejected:     'Pembayaran Ditolak',
  pending_design:       'Menunggu Upload Desain',
  design_uploaded:      'Desain Diunggah',
  design_review:        'Pembayaran Diverifikasi',
  revision_requested:   'Revisi Desain Diminta',
  printing:             'Sedang Dicetak',
  ready:                'Siap Diambil',
  completed:            'Pesanan Selesai ✓',
  cancelled:            'Pesanan Dibatalkan',
};

const formatDateTime = (dtStr: any) => {
  if (!dtStr) return '-';
  try {
    const d = new Date(dtStr);
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(d);
  } catch {
    return dtStr;
  }
};

interface TimelineEntry {
  type: 'status' | 'payment_rejected' | 'design_revision';
  status?: string;
  label: string;
  timestamp: string;
  notes?: string;
  color: 'blue' | 'yellow' | 'red' | 'amber' | 'gray';
}

export default function OrderTimeline({ order }: { order: any }) {
  if (!order) return null;

  const currentStatus = order.status;

  const buildTimelineEntries = (): TimelineEntry[] => {
    const entries: TimelineEntry[] = [];

    // 1. Tambah dari status_logs (urutan normal)
    order.status_logs?.forEach((log: any) => {
      // Find out if this is the last log matching the current order status
      const matchingLogs = order.status_logs.filter((l: any) => l.status === log.status);
      const isLatestOfThisStatus = matchingLogs[matchingLogs.length - 1]?.id === log.id;
      
      const isCurrent = log.status === currentStatus && isLatestOfThisStatus;
      
      let dotColor: 'blue' | 'yellow' | 'red' | 'gray' = 'blue';
      if (log.status === 'cancelled') {
        dotColor = 'red';
      } else if (isCurrent) {
        dotColor = 'yellow';
      }

      let labelText = STATUS_LABELS[log.status] || log.status;
      if (log.status === 'printing' && log.notes?.toLowerCase().includes('desain disetujui')) {
        labelText = 'Desain diverifikasi ✓';
      }

      entries.push({
        type: 'status',
        status: log.status,
        label: labelText,
        timestamp: log.created_at,
        notes: log.notes,
        color: dotColor,
      });
    });

    // 2. Tambah payment rejection jika ada
    order.payment_transactions?.forEach((pt: any) => {
      if (pt.status === 'rejected' || pt.payment_status === 'rejected') {
        entries.push({
          type: 'payment_rejected',
          label: 'Pembayaran Ditolak',
          timestamp: pt.updated_at || pt.created_at || order.updated_at || order.created_at,
          notes: pt.reject_reason ?? pt.notes ?? 'Bukti pembayaran tidak valid.',
          color: 'red',
        });
      }
    });

    // 3. Tambah design revision per item jika ada
    order.items?.forEach((item: any) => {
      // Check design_review on item
      const review = item.design_review;
      if (review?.status === 'revision_requested' || item.design_status === 'revision_requested') {
        entries.push({
          type: 'design_revision',
          label: `Revisi Desain: ${item.product_name || item.product?.name || 'Produk'}`,
          timestamp: review?.updated_at || review?.created_at || order.updated_at || order.created_at,
          notes: review?.notes || item.design_notes || 'Upload desain baru untuk item ini.',
          color: 'amber',
        });
      }
    });

    // 4. Urutkan semua entries berdasarkan timestamp
    const sorted = entries.sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Fallback jika database logs kosong (misal data dummy lama)
    if (sorted.length === 0 && order.status) {
      sorted.push({
        type: 'status',
        status: 'pending_design',
        label: STATUS_LABELS['pending_design'] || 'Pesanan dibuat',
        timestamp: order.created_at,
        notes: 'Pesanan berhasil dibuat.',
        color: order.status === 'pending_design' ? 'yellow' : 'blue',
      });

      if (order.status !== 'pending_design' && order.status !== 'waiting_payment') {
        sorted.push({
          type: 'status',
          status: order.status,
          label: STATUS_LABELS[order.status] || order.status,
          timestamp: order.updated_at || order.created_at,
          notes: 'Status pesanan saat ini.',
          color: 'yellow',
        });
      }
    }

    if (order.status === 'cancelled') {
      const cancelEntryIndex = sorted.findIndex(e => e.status === 'cancelled');
      if (cancelEntryIndex !== -1) {
        sorted[cancelEntryIndex].color = 'red';
        sorted[cancelEntryIndex].label = 'Pesanan Dibatalkan';
        sorted[cancelEntryIndex].notes = sorted[cancelEntryIndex].notes ?? 'Dibatalkan oleh customer';
      }
    }

    return sorted;
  };

  const entries = buildTimelineEntries();
  if (entries.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Riwayat Status Pesanan</Text>
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1;
        
        let dotBgColor = '#D3D1C7';
        if (entry.color === 'blue') dotBgColor = '#1A56E8';
        else if (entry.color === 'yellow') dotBgColor = '#EF9F27';
        else if (entry.color === 'red') dotBgColor = '#A32D2D';
        else if (entry.color === 'amber') dotBgColor = '#BA7517';

        return (
          <View key={index} style={{ flexDirection: 'row' }}>
            {/* Left line and dot */}
            <View style={{ alignItems: 'center', marginRight: 12, width: 20 }}>
              <View style={[styles.timelineDot, { backgroundColor: dotBgColor }]} />
              {!isLast && <View style={styles.timelineLine} />}
            </View>
            
            {/* Right content */}
            <View style={{ flex: 1, paddingBottom: isLast ? 0 : 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {entry.type === 'payment_rejected' && <XCircle size={14} color="#A32D2D" />}
                {entry.type === 'design_revision' && <AlertTriangle size={14} color="#BA7517" />}
                <Text style={[
                  styles.timelineLabel, 
                  entry.color === 'red' && { color: '#A32D2D' },
                  entry.color === 'amber' && { color: '#BA7517' }
                ]}>
                  {entry.label}
                </Text>
              </View>
              <Text style={styles.timelineDate}>{formatDateTime(entry.timestamp)}</Text>
              {entry.notes ? (
                <Text style={[
                  styles.timelineNotes,
                  entry.color === 'red' && { color: '#791F1F' },
                  entry.color === 'amber' && { color: '#633806' }
                ]}>
                  {entry.notes}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: '#EEEEEE',
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
    marginTop: 4,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  timelineDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  timelineNotes: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
    fontStyle: 'italic',
  },
});
