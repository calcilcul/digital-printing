import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, UploadCloud, X, CreditCard, MapPin, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { m, AnimatePresence } from 'framer-motion';

import { useCartStore } from '../../store/cartStore';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { useFileUpload } from '../../hooks/useFileUpload';
import BackButton from '../../components/ui/BackButton';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/animations/FadeIn';
import { SlideUp } from '../../components/animations/SlideUp';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getCartTotal } = useCartStore();
  const { checkout } = useOrderStore();
  const { user } = useAuthStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address?.[0]?.fullAddress || '',
    city: user?.address?.[0]?.city || '',
    postalCode: user?.address?.[0]?.postalCode || '',
    pickupInStore: false,
    needsDesign: false
  });

  const { isUploading, uploadProgress, fileData: designFile, handleUpload, clearFile } = useFileUpload('design');

  const steps = [
    { id: 1, title: 'Informasi', icon: MapPin },
    { id: 2, title: 'Upload Desain', icon: ImageIcon },
    { id: 3, title: 'Pembayaran', icon: CreditCard },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileDrop = async (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0] || e.target.files[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  const submitOrder = async () => {
    setIsSubmitting(true);
    const result = await checkout();
    setIsSubmitting(false);

    if (result.success) {
      toast.success('Pesanan berhasil dibuat!');
      navigate(`/pesanan/${result.data.order_id}`);
    } else {
      toast.error(result.error || 'Gagal membuat pesanan');
    }
  };

  if (items.length === 0 && currentStep === 1) {
    navigate('/keranjang');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <BackButton />
        </div>

        <h1 className="text-3xl font-bold text-slate-900 mb-8 text-center">Checkout</h1>

        {/* Stepper */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 -translate-y-1/2 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary-600 -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          
          <div className="flex justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-slate-50 font-bold transition-colors duration-300 shadow-sm ${
                  currentStep > step.id ? 'bg-primary-600 text-white' : 
                  currentStep === step.id ? 'bg-white text-primary-600 border-primary-200' : 
                  'bg-white text-slate-400'
                }`}>
                  {currentStep > step.id ? <Check size={20} /> : <step.icon size={20} />}
                </div>
                <span className={`mt-2 text-sm font-medium ${currentStep >= step.id ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Informasi */}
            {currentStep === 1 && (
              <m.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-bold text-slate-900 mb-6">Informasi Pengiriman</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Nama Lengkap</label>
                    <input type="text" name="name" value={form.name} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Masukkan nama" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">No. HP (WhatsApp)</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="081234..." />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="email@contoh.com" />
                  </div>
                  
                  <div className="md:col-span-2 pt-4 border-t border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="pickupInStore" checked={form.pickupInStore} onChange={handleInputChange} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                      <span className="font-medium text-slate-800">Ambil pesanan langsung di toko</span>
                    </label>
                  </div>

                  {!form.pickupInStore && (
                    <>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-slate-700">Alamat Lengkap</label>
                        <textarea name="address" value={form.address} onChange={handleInputChange} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Nama jalan, gedung, no. rumah..."></textarea>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Kota/Kabupaten</label>
                        <input type="text" name="city" value={form.city} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="Kota" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Kode Pos</label>
                        <input type="text" name="postalCode" value={form.postalCode} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" placeholder="12345" />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-6 flex justify-end">
                  <Button onClick={() => setCurrentStep(2)} disabled={!form.name || !form.phone}>
                    Lanjut ke Upload Desain
                  </Button>
                </div>
              </m.div>
            )}

            {/* Step 2: Upload Desain */}
            {currentStep === 2 && (
              <m.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-end mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Upload File Desain</h2>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="needsDesign" checked={form.needsDesign} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                    <span className="text-sm font-medium text-slate-600">Saya butuh jasa desain</span>
                  </label>
                </div>

                {!form.needsDesign ? (
                  <>
                    {!designFile ? (
                      <div 
                        className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 hover:border-primary-400 transition-colors cursor-pointer relative"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                      >
                        <input type="file" onChange={handleFileDrop} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,.ai,.cdr,.png,.jpg,.jpeg" />
                        
                        <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UploadCloud size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 mb-1">Seret file ke sini atau klik untuk upload</h3>
                        <p className="text-sm text-slate-500">
                          Format didukung: PDF, AI, CDR, PNG, JPG (Maks. 50MB)
                        </p>
                        
                        {isUploading && (
                          <div className="mt-6 max-w-xs mx-auto">
                            <div className="flex justify-between text-xs text-slate-500 mb-1">
                              <span>Mengupload...</span>
                              <span>{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div className="bg-primary-600 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="border border-slate-200 rounded-xl p-4 flex items-center gap-4 bg-slate-50">
                        <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {designFile.type.startsWith('image/') ? (
                            <img src={designFile.base64} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs font-bold text-slate-500 uppercase">{designFile.name.split('.').pop()}</div>
                          )}
                        </div>
                        <div className="flex-grow min-w-0">
                          <div className="font-medium text-slate-900 truncate">{designFile.name}</div>
                          <div className="text-sm text-slate-500">{(designFile.size / 1024 / 1024).toFixed(2)} MB • Berhasil diupload</div>
                        </div>
                        <button onClick={clearFile} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <X size={20} />
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 text-center">
                    <p className="text-primary-800 font-medium mb-2">Tim desainer kami siap membantu!</p>
                    <p className="text-sm text-primary-600 mb-4">Biaya desain akan diinformasikan setelah Anda berdiskusi dengan admin melalui WhatsApp.</p>
                  </div>
                )}

                <div className="pt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setCurrentStep(1)}>Kembali</Button>
                  <Button onClick={() => setCurrentStep(3)} disabled={!form.needsDesign && !designFile && !isUploading}>
                    Lanjut ke Pembayaran
                  </Button>
                </div>
              </m.div>
            )}

            {/* Step 3: Pembayaran */}
            {currentStep === 3 && (
              <m.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Summary */}
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 border-b border-slate-200 pb-2">Ringkasan Pesanan</h3>
                    <div className="space-y-3 text-sm mb-6">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between">
                          <span className="text-slate-600 line-clamp-1 flex-grow pr-4">{item.quantity}x {item.name}</span>
                          <span className="font-medium text-slate-900 whitespace-nowrap">{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                      <span className="font-bold text-slate-900">Total Tagihan</span>
                      <span className="text-2xl font-bold text-primary-600">{formatPrice(getCartTotal())}</span>
                    </div>
                  </div>

                  {/* Right: Payment Instr */}
                  <div>
                    <h3 className="font-bold text-slate-900 mb-4">Instruksi Pembayaran</h3>
                    <p className="text-sm text-slate-600 mb-6">Silakan transfer sesuai dengan nominal total tagihan ke salah satu rekening di bawah ini:</p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="border border-slate-200 rounded-lg p-4 flex items-center gap-4 bg-white shadow-sm">
                        <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-blue-800 text-xs tracking-wider">BCA</div>
                        <div>
                          <div className="font-mono font-bold text-slate-900">1234 5678 90</div>
                          <div className="text-xs text-slate-500 uppercase">a/n Jaya Mandiri Printing</div>
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4 flex items-center gap-4 bg-white shadow-sm">
                        <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center font-bold text-blue-900 text-xs tracking-tighter">MANDIRI</div>
                        <div>
                          <div className="font-mono font-bold text-slate-900">098 765 4321</div>
                          <div className="text-xs text-slate-500 uppercase">a/n Jaya Mandiri Printing</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6">
                      <p className="text-xs text-orange-800 flex gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>Anda memiliki waktu <strong>24 jam</strong> untuk menyelesaikan pembayaran dan mengupload bukti transfer setelah pesanan dibuat.</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 flex justify-between border-t border-slate-100">
                  <Button variant="ghost" onClick={() => setCurrentStep(2)}>Kembali</Button>
                  <Button onClick={submitOrder} size="lg" className="px-8 shadow-md" isLoading={isSubmitting}>
                    Buat Pesanan
                  </Button>
                </div>
              </m.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
