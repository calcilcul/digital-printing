import React from 'react';
import { FadeIn } from '../../components/animations/FadeIn';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Syarat & Ketentuan</h1>
            <p className="text-lg text-slate-600">
              Syarat dan Ketentuan layanan Jaya Mandiri Digital Printing.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 prose prose-slate max-w-none">
            <p>Terakhir diperbarui: 25 April 2026</p>
            
            <h3>1. Ketentuan Umum</h3>
            <p>Dengan mengakses dan menggunakan layanan pemesanan melalui website Jaya Mandiri Digital Printing, Anda dianggap telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang berlaku.</p>
            
            <h3>2. Proses Pemesanan & Desain</h3>
            <ul>
              <li>Pesanan baru akan diproses setelah pembayaran lunas atau uang muka (DP) minimal 50% diterima.</li>
              <li>Pelanggan bertanggung jawab penuh atas hak cipta desain yang diunggah.</li>
              <li>Jika menggunakan jasa desain dari kami, pelanggan berhak mendapatkan maksimal 3 kali revisi minor.</li>
            </ul>

            <h3>3. Ketentuan Produksi & Warna</h3>
            <ul>
              <li>Warna pada monitor (RGB) tidak akan sama 100% dengan hasil cetak aktual (CMYK). Penurunan akurasi warna sekitar 10-15% adalah hal yang wajar dalam industri percetakan digital.</li>
              <li>Waktu pengerjaan yang tertera adalah estimasi. Keterlambatan produksi yang disebabkan oleh force majeure tidak dapat dijadikan alasan pembatalan pesanan.</li>
            </ul>

            <h3>4. Pengiriman & Pengambilan</h3>
            <ul>
              <li>Jika memilih pengiriman ekspedisi, kerusakan selama di perjalanan bukan tanggung jawab Jaya Mandiri. Kami memastikan packing dilakukan seaman mungkin.</li>
              <li>Barang yang diambil di toko (Pickup) dapat diambil setelah mendapatkan notifikasi pesanan "Selesai".</li>
            </ul>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
