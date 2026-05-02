import React from 'react';
import { FadeIn } from '../../components/animations/FadeIn';
import { MapPin, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSent, setIsSent] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      toast.success('Pesan Anda berhasil terkirim!');
      e.target.reset(); // Clear form
      
      // Reset success state after a few seconds
      setTimeout(() => setIsSent(false), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">Hubungi Kami</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Punya pertanyaan atau butuh bantuan pesanan? Tim kami siap membantu Anda.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <FadeIn delay={0.1} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Kirim Pesan</h2>
            
            {isSent && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-8">
                <m.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"
                >
                  <CheckCircle size={32} />
                </m.div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Terima Kasih!</h3>
                <p className="text-slate-600">Pesan Anda telah kami terima. Tim kami akan segera membalas melalui email Anda.</p>
              </div>
            )}

            <form className="space-y-4 relative" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input required type="text" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input required type="email" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-shadow" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pesan</label>
                <textarea required rows="4" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none transition-shadow" placeholder="Tuliskan pesan Anda..."></textarea>
              </div>
              <Button type="submit" fullWidth disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : 'Kirim Pesan'}
              </Button>
            </form>
          </FadeIn>

          <FadeIn delay={0.2} className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 h-full">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Informasi Kontak</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Alamat Toko</h3>
                    <p className="text-slate-600 text-sm">Jl. Percetakan Negara No. 123,<br/>Jakarta Pusat, 10560</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Telepon / WhatsApp</h3>
                    <p className="text-slate-600 text-sm">+62 812 3456 7890</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Email Support</h3>
                    <p className="text-slate-600 text-sm">halo@jayamandiri.com</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Jam Operasional</h3>
                    <p className="text-slate-600 text-sm">Senin - Sabtu: 08:00 - 17:00 WIB<br/>Minggu: Libur</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
