import React from 'react';
import { FadeIn } from '../../components/animations/FadeIn';

export default function CaraPemesananPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Cara Pemesanan</h1>
            <p className="text-lg text-slate-600">Panduan lengkap langkah demi langkah memesan produk.</p>
          </div>
        </FadeIn>
        
        <FadeIn delay={0.1}>
          <div className="space-y-6">
            {[
              { step: 1, title: 'Pilih Produk', desc: 'Buka halaman Katalog, cari produk yang Anda inginkan (misal: Banner, Spanduk, Kartu Nama).' },
              { step: 2, title: 'Atur Spesifikasi', desc: 'Masukkan ukuran (panjang & lebar), pilih jenis bahan, dan jumlah yang akan dicetak. Harga akan otomatis terhitung.' },
              { step: 3, title: 'Upload Desain / Minta Jasa Desain', desc: 'Pada tahap checkout, Anda bisa mengunggah file desain siap cetak Anda, atau mencentang opsi "Butuh Jasa Desain" jika belum punya desain.' },
              { step: 4, title: 'Checkout & Pembayaran', desc: 'Selesaikan pesanan dan transfer ke rekening yang tertera sebelum batas waktu 24 jam.' },
              { step: 5, title: 'Upload Bukti Bayar', desc: 'Setelah transfer, buka menu "Pesanan Saya", klik detail pesanan, dan upload foto bukti transfer Anda.' },
              { step: 6, title: 'Produksi & Pengiriman', desc: 'Staff kami akan memverifikasi dan memproses pesanan Anda. Anda akan menerima notifikasi resi jika sudah dikirim.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xl shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
