import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { m } from 'framer-motion';

import { Button } from '../../components/ui/Button';
import { ProductCard } from '../../components/ProductCard';
import { FadeIn } from '../../components/animations/FadeIn';
import { SlideUp } from '../../components/animations/SlideUp';
import { StaggerContainer } from '../../components/animations/StaggerContainer';
import { useProductStore } from '../../store/productStore';

export default function LandingPage() {
  const { products } = useProductStore();
  const popularProducts = products.slice(0, 4);

  const categories = [
    { id: 1, name: 'Banner Outdoor', bg: 'bg-blue-500' },
    { id: 2, name: 'Spanduk', bg: 'bg-indigo-500' },
    { id: 3, name: 'Sticker Custom', bg: 'bg-emerald-500' },
    { id: 4, name: 'Kartu Nama', bg: 'bg-rose-500' },
  ];

  const features = [
    "Gratis Konsultasi Desain",
    "Garansi Kualitas 100%",
    "Pengerjaan Super Cepat",
    "Bahan Baku Premium"
  ];

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden bg-slate-900">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=2071&auto=format&fit=crop" 
            alt="Printing Machine" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-primary-300 text-sm font-medium mb-6 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                </span>
                Percetakan Digital Modern
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
                Cetak Impian Anda <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                  Jadi Nyata
                </span>
              </h1>
            </FadeIn>
            
            <FadeIn delay={0.3}>
              <p className="text-lg lg:text-xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
                Solusi digital printing berkualitas tinggi dengan harga terjangkau untuk kebutuhan bisnis, event, dan personal Anda.
              </p>
            </FadeIn>
            
            <FadeIn delay={0.4} className="flex flex-col sm:flex-row gap-4">
              <Link to="/katalog">
                <Button size="lg" className="w-full sm:w-auto text-lg shadow-lg shadow-primary-500/25">
                  Mulai Order Sekarang
                </Button>
              </Link>
              <Link to="/tentang">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg text-white border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm">
                  Tentang Kami
                </Button>
              </Link>
            </FadeIn>

            <FadeIn delay={0.6} className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-300 text-sm">
                  <CheckCircle2 size={16} className="text-secondary-400 shrink-0" />
                  <span className="leading-tight">{feature}</span>
                </div>
              ))}
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 2. Popular Products */}
      <section className="py-20 bg-slate-50 relative -mt-10 rounded-t-[3rem] z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <SlideUp>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Produk Populer</h2>
              <p className="text-slate-500 mt-2">Pilihan terbaik dari pelanggan kami</p>
            </SlideUp>
            <SlideUp delay={0.1}>
              <Link to="/katalog" className="hidden sm:flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors">
                Lihat Semua <ArrowRight size={16} className="ml-1" />
              </Link>
            </SlideUp>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </StaggerContainer>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/katalog">
              <Button variant="outline" className="w-full">
                Lihat Semua Produk
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Brand Story */}
      <section className="py-24 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-3xl overflow-hidden relative shadow-2xl">
            <div className="absolute inset-0">
              <img 
                src="https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop" 
                alt="Our Story" 
                className="w-full h-full object-cover opacity-40 mix-blend-overlay"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-transparent"></div>
            </div>
            
            <div className="relative p-10 lg:p-20 max-w-3xl">
              <SlideUp>
                <div className="w-16 h-1 bg-primary-500 mb-8 rounded-full"></div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                  "Kami percaya setiap bisnis layak tampil <i className="text-primary-400 font-serif">profesional</i> dengan visual berkualitas tinggi."
                </h2>
                <p className="text-lg text-slate-300 leading-relaxed">
                  Lebih dari sekadar percetakan, kami adalah partner pertumbuhan bisnis Anda. Dengan mesin teknologi terkini dan tim yang berdedikasi, kami memastikan setiap detail pesanan Anda sempurna.
                </p>
              </SlideUp>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Category Carousel (Simplified Grid for now) */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SlideUp className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Jelajahi Kategori</h2>
            <p className="text-slate-500 mt-2">Temukan produk sesuai kebutuhan Anda</p>
          </SlideUp>

          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/katalog?cat=${cat.id}`} className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex flex-col items-center justify-center text-center aspect-square relative overflow-hidden">
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${cat.bg}`}></div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 relative z-10 group-hover:text-primary-600 transition-colors">
                  {cat.name}
                </h3>
                <div className="flex items-center text-primary-600 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 relative z-10">
                  Belanja <ArrowRight size={16} className="ml-1" />
                </div>
              </Link>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 5. Testimonials */}
      <section className="py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <SlideUp className="md:w-1/3 space-y-6">
              <h2 className="text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Dipercaya oleh Ribuan Pelanggan
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex">
                  {[1,2,3,4,5].map(i => <Star key={i} className="text-yellow-400 fill-yellow-400 w-6 h-6" />)}
                </div>
                <span className="font-bold text-xl">4.9/5</span>
              </div>
              <p className="text-slate-600">
                Dari 25,000+ review positif pelanggan kami dari seluruh Indonesia.
              </p>
            </SlideUp>

            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <SlideUp delay={0.2} className="glass-card bg-slate-50 p-8 rounded-2xl relative">
                <div className="text-primary-200 absolute top-4 right-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                </div>
                <p className="text-slate-700 italic mb-6 relative z-10">
                  "Hasil cetak bannernya sangat memuaskan, warnanya tajam dan bahannya tebal. Pengerjaan juga tepat waktu. Mantap Jaya Mandiri!"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                    AS
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Ahmad Setiawan</h4>
                    <p className="text-sm text-slate-500">Pemilik Cafe</p>
                  </div>
                </div>
              </SlideUp>
              
              <SlideUp delay={0.3} className="glass-card bg-slate-50 p-8 rounded-2xl relative sm:translate-y-8">
                <div className="text-primary-200 absolute top-4 right-4">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg>
                </div>
                <p className="text-slate-700 italic mb-6 relative z-10">
                  "Desain kartu namanya elegan banget. Timnya kooperatif ngasih saran revisi desain. Packing rapi dan aman sampai tujuan."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary-100 text-secondary-600 rounded-full flex items-center justify-center font-bold">
                    ND
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Nadia Putri</h4>
                    <p className="text-sm text-slate-500">Creative Agency</p>
                  </div>
                </div>
              </SlideUp>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
