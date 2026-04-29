import React from 'react';
import { FadeIn } from '../../components/animations/FadeIn';
import { Building, Users, Target, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Tentang Jaya Mandiri</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Mitra terpercaya Anda untuk segala kebutuhan digital printing, menghadirkan kualitas premium dengan layanan cepat.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-16">
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Cerita Kami</h2>
              <div className="text-slate-600 leading-relaxed space-y-4">
                <p>
                  Didirikan pada tahun 2015, Jaya Mandiri Digital Printing bermula dari sebuah bengkel cetak kecil di sudut kota. Seiring dengan tingginya permintaan terhadap hasil cetak berkualitas yang cepat dan terjangkau, kami terus berkembang dan mengadopsi teknologi mesin cetak terbaru.
                </p>
                <p>
                  Kini, kami melayani ribuan pelanggan dari berbagai sektor—mulai dari UMKM lokal, instansi pemerintahan, hingga perusahaan multinasional—untuk memenuhi kebutuhan branding dan promosi mereka.
                </p>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building, title: 'Fasilitas Modern', desc: 'Dilengkapi mesin cetak high-res terkini.' },
              { icon: Users, title: 'Tim Profesional', desc: 'Tenaga ahli yang berdedikasi tinggi.' },
              { icon: Target, title: 'Tepat Waktu', desc: 'Komitmen pada deadline pelanggan.' },
              { icon: ShieldCheck, title: 'Garansi Kualitas', desc: 'Hasil cetak tajam dan tahan lama.' },
            ].map((item, idx) => (
              <FadeIn key={idx} delay={0.2 + (idx * 0.1)}>
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center h-full">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 mx-auto mb-4">
                    <item.icon size={24} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
