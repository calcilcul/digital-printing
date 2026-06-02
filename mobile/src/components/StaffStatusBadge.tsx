import React from 'react';
import { View, Text } from 'react-native';

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending_design:       { label: 'Belum Upload Desain', bg: '#F1F5F9', text: '#64748B' },
  design_uploaded:      { label: 'Desain Diunggah',      bg: '#E6F1FB', text: '#0C447C' },
  waiting_payment:      { label: 'Menunggu Bayar',   bg: '#D3D1C7', text: '#444441' },
  payment_verification: { label: 'Verifikasi Bayar', bg: '#FAEEDA', text: '#633806' },
  payment_rejected:     { label: 'Bayar Ditolak',    bg: '#FCEBEB', text: '#791F1F' },
  paid:                 { label: 'Lunas',            bg: '#EAF3DE', text: '#27500A' },
  design_review:        { label: 'Review Desain',    bg: '#E6F1FB', text: '#0C447C' },
  revision_requested:   { label: 'Revisi Desain',    bg: '#FEF3C7', text: '#92400E' },
  printing:             { label: 'Dicetak',          bg: '#1A56E8', text: '#FFFFFF' },
  ready:                { label: 'Siap Ambil',       bg: '#EAF3DE', text: '#27500A' },
  completed:            { label: 'Selesai',          bg: '#27500A', text: '#FFFFFF' },
  cancelled:            { label: 'Dibatalkan',       bg: '#FCEBEB', text: '#791F1F' },
};

interface StaffStatusBadgeProps {
  status: string;
}

export default function StaffStatusBadge({ status }: StaffStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    bg: '#eee',
    text: '#666',
  };

  return (
    <View style={{ backgroundColor: cfg.bg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 }}>
      <Text style={{ color: cfg.text, fontSize: 11, fontWeight: '500' }}>
        {cfg.label}
      </Text>
    </View>
  );
}
