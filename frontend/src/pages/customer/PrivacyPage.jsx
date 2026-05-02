import React from 'react';
import { FadeIn } from '../../components/animations/FadeIn';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Kebijakan Privasi</h1>
            <p className="text-lg text-slate-600">
              Bagaimana kami melindungi dan mengelola data Anda.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 prose prose-slate max-w-none">
            <p>Terakhir diperbarui: 25 April 2026</p>
            
            <h3>1. Pengumpulan Informasi Personal</h3>
            <p>Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami saat mendaftar akun, melakukan pemesanan, atau menghubungi layanan pelanggan. Informasi ini meliputi nama, alamat email, nomor telepon, alamat pengiriman, dan file desain cetak.</p>
            
            <h3>2. Penggunaan Informasi</h3>
            <p>Kami menggunakan informasi yang kami kumpulkan untuk:</p>
            <ul>
              <li>Memproses dan menyelesaikan pesanan percetakan Anda.</li>
              <li>Berkomunikasi dengan Anda mengenai status pesanan, revisi desain, atau kendala pengiriman.</li>
              <li>Mengirimkan informasi teknis, pembaruan keamanan, dan dukungan operasional.</li>
            </ul>

            <h3>3. Perlindungan File Desain</h3>
            <p>File desain yang Anda unggah murni digunakan untuk keperluan cetak pesanan Anda. Kami menjamin kerahasiaan kekayaan intelektual (HAKI) dari desain tersebut dan tidak akan memperjualbelikannya kepada pihak ketiga atau menggunakannya sebagai sampel promosi tanpa izin tertulis dari Anda.</p>

            <h3>4. Penyimpanan Data</h3>
            <p>Kami menyimpan informasi profil Anda selama akun Anda aktif. Untuk file desain resolusi tinggi, kami akan menghapusnya dari server kami 30 hari setelah pesanan selesai untuk menghemat ruang penyimpanan, kecuali Anda memintanya untuk disimpan lebih lama.</p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
