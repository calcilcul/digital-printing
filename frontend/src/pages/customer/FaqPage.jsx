import React, { useState } from 'react';
import { FadeIn } from '../../components/animations/FadeIn';
import { ChevronDown } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'Bagaimana cara melakukan pemesanan?',
      a: 'Anda bisa melakukan pemesanan langsung melalui website ini. Pilih produk di halaman Katalog, masukkan ukuran dan spesifikasi, klik Tambah Keranjang, lalu ikuti proses Checkout hingga mengunggah desain dan bukti pembayaran.'
    },
    {
      q: 'Berapa lama proses pengerjaan?',
      a: 'Proses pengerjaan bervariasi tergantung produk dan antrean. Umumnya untuk Spanduk dan Banner memakan waktu 1-2 hari kerja setelah desain disetujui. Untuk produk kompleks seperti Kartu Nama atau Sticker Die Cut bisa memakan waktu 2-3 hari kerja.'
    },
    {
      q: 'Format file apa saja yang diterima untuk desain?',
      a: 'Kami menyarankan format file resolusi tinggi (min 300dpi) seperti PDF, AI (Adobe Illustrator), CDR (Corel Draw), atau format gambar seperti JPG dan PNG. Pastikan warna dalam format CMYK untuk hasil cetak terbaik.'
    },
    {
      q: 'Apakah bisa dibantu buatkan desain?',
      a: 'Bisa. Saat checkout, Anda bisa memilih opsi "Saya butuh jasa desain". Tim desain kami akan menghubungi Anda via WhatsApp untuk mendiskusikan kebutuhan desain Anda. Dikenakan biaya tambahan untuk jasa desain.'
    },
    {
      q: 'Apakah ada garansi jika hasil cetak jelek/cacat?',
      a: 'Ya, kami memberikan garansi cetak ulang 100% gratis jika kesalahan murni berasal dari pihak mesin atau operator kami (misal: warna luntur ekstrim, bergaris, atau material sobek saat diterima). Klaim maksimal 1x24 jam setelah barang diterima.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Tanya Jawab (FAQ)</h1>
            <p className="text-lg text-slate-600">
              Pertanyaan yang paling sering diajukan oleh pelanggan kami.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <button 
                  className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
                  onClick={() => setOpenIdx(openIdx === idx ? -1 : idx)}
                >
                  <span className="font-bold text-slate-900">{faq.q}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-slate-400 transition-transform duration-300 ${openIdx === idx ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence>
                  {openIdx === idx && (
                    <m.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 pt-2 text-slate-600 border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
