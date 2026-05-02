import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShieldAlert, BookOpen, MessageCircle, AlertTriangle, ShieldCheck, CreditCard, Truck, RefreshCcw } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/animations/FadeIn';
import { SlideUp } from '../../components/animations/SlideUp';
import BackButton from '../../components/ui/BackButton';

export default function CarePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('faq');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Laporan berhasil dikirim. Tim keamanan kami akan segera menindaklanjuti.');
      e.target.reset();
    }, 1500);
  };

  const categories = [
    { icon: CreditCard, title: 'Pembayaran', desc: 'Cara bayar & konfirmasi' },
    { icon: Truck, title: 'Pengiriman', desc: 'Lacak & metode kurir' },
    { icon: RefreshCcw, title: 'Retur & Refund', desc: 'Syarat & ketentuan' },
    { icon: ShieldCheck, title: 'Akun & Keamanan', desc: 'Password & OTP' },
  ];

  const faqs = [
    { q: 'Bagaimana cara melacak pesanan saya?', a: 'Anda dapat melacak status pesanan melalui menu "Monitoring Pesanan" di profil Anda, atau menggunakan nomor resi yang dikirimkan ke email.' },
    { q: 'Apakah saya bisa mengubah desain setelah pesanan dibayar?', a: 'Perubahan desain hanya dapat dilakukan maksimal 2 jam setelah pembayaran terkonfirmasi, sebelum masuk proses antrean cetak.' },
    { q: 'Metode pembayaran apa saja yang diterima?', a: 'Kami menerima transfer bank (BCA, Mandiri, BNI), e-Wallet (GoPay, OVO, Dana), dan pembayaran instan via QRIS.' },
    { q: 'Berapa lama proses pengerjaan?', a: 'Waktu pengerjaan standar adalah 1-3 hari kerja tergantung jenis produk dan antrean. Layanan express 24 jam tersedia dengan biaya tambahan.' },
  ];

  const filteredFaqs = faqs.filter(faq => faq.q.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <BackButton />
        </div>

        {/* Header */}
        <FadeIn className="text-center mb-12">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
            <MessageCircle size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Jaya Mandiri Care</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Pusat bantuan layanan pelanggan. Temukan jawaban dari pertanyaan Anda atau laporkan kendala yang Anda alami.
          </p>
        </FadeIn>

        {/* Search */}
        <SlideUp className="relative max-w-2xl mx-auto mb-16">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-lg focus:ring-0 focus:border-primary-500 transition-colors shadow-sm"
            placeholder="Ketik topik bantuan yang Anda cari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SlideUp>

        {/* Navigation Tabs */}
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-8 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'faq' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen size={18} /> Pusat Informasi (FAQ)
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'security' ? 'bg-rose-50 text-rose-700' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldAlert size={18} /> Pemulihan & Keamanan
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <AnimatePresence mode="wait">
            
            {activeTab === 'faq' && (
              <m.div
                key="faq"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8"
              >
                {/* Categories */}
                {!searchQuery && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                    {categories.map((cat, idx) => (
                      <div key={idx} className="p-4 border border-slate-200 rounded-2xl hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer text-center">
                        <cat.icon size={24} className="mx-auto mb-3 text-primary-600" />
                        <h4 className="font-bold text-slate-900 text-sm mb-1">{cat.title}</h4>
                        <p className="text-xs text-slate-500">{cat.desc}</p>
                      </div>
                    ))}
                  </div>
                )}

                <h3 className="text-xl font-bold text-slate-900 mb-6">Pertanyaan Populer</h3>
                <div className="space-y-4">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq, idx) => (
                      <div key={idx} className="p-5 border border-slate-200 rounded-xl bg-slate-50">
                        <h4 className="font-bold text-slate-900 mb-2 flex gap-3">
                          <span className="text-primary-500 font-black">Q.</span> {faq.q}
                        </h4>
                        <p className="text-slate-600 pl-7 leading-relaxed">{faq.a}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      Tidak ada hasil ditemukan untuk "{searchQuery}"
                    </div>
                  )}
                </div>
              </m.div>
            )}

            {activeTab === 'security' && (
              <m.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-8"
              >
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Info Panel */}
                  <div className="md:w-1/3">
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
                      <AlertTriangle size={32} className="text-rose-500 mb-4" />
                      <h3 className="font-bold text-rose-900 mb-2">Panduan Keamanan</h3>
                      <ul className="text-sm text-rose-700 space-y-3 list-disc pl-4">
                        <li>Jangan berikan kode OTP Anda kepada siapapun, termasuk staff kami.</li>
                        <li>Pastikan URL website benar sebelum login.</li>
                        <li>Ganti password Anda secara berkala.</li>
                        <li>Hanya transfer ke rekening resmi Jaya Mandiri.</li>
                      </ul>
                    </div>
                  </div>

                  {/* Form Panel */}
                  <div className="md:w-2/3">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Laporan Penipuan / Kendala Akun</h3>
                    <p className="text-slate-600 mb-6">Gunakan form ini jika akun Anda terblokir, diretas, atau terdapat transaksi yang mencurigakan.</p>
                    
                    <form className="space-y-5" onSubmit={handleReportSubmit}>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Kategori Masalah</label>
                        <select className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                          <option>Akun Diretas / Suspend</option>
                          <option>Indikasi Penipuan Transaksi</option>
                          <option>Kendala Login & OTP</option>
                          <option>Lainnya</option>
                        </select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Email Terdaftar</label>
                          <input required type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">No. HP Terdaftar</label>
                          <input required type="tel" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Detail Kronologi</label>
                        <textarea required rows="4" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Ceritakan secara detail kendala yang dialami..."></textarea>
                      </div>

                      <Button type="submit" variant="danger" className="bg-rose-500 hover:bg-rose-600 w-full md:w-auto" disabled={isSubmitting}>
                        {isSubmitting ? 'Mengirim...' : 'Kirim Laporan Keamanan'}
                      </Button>
                    </form>
                  </div>
                </div>
              </m.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
