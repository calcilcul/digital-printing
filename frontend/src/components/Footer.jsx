import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Camera } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 lg:py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Brand & Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                J
              </div>
              <span className="font-bold text-xl text-white">
                Jaya Mandiri
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Percetakan & Advertising terpercaya untuk solusi visual bisnis Anda. Mengubah ide menjadi karya nyata dengan kualitas premium.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <Camera size={20} />
              </a>
              <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-colors">
                <MapPin size={20} />
              </a>
            </div>
          </div>

          {/* Links - Kategori */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Kategori Produk</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/katalog?cat=banner" className="hover:text-primary-400 transition-colors">Banner Outdoor</Link></li>
              <li><Link to="/katalog?cat=spanduk" className="hover:text-primary-400 transition-colors">Spanduk</Link></li>
              <li><Link to="/katalog?cat=sticker" className="hover:text-primary-400 transition-colors">Sticker Custom</Link></li>
              <li><Link to="/katalog?cat=kartunama" className="hover:text-primary-400 transition-colors">Kartu Nama</Link></li>
              <li><Link to="/katalog?cat=display" className="hover:text-primary-400 transition-colors">Display Promo</Link></li>
            </ul>
          </div>

          {/* Links - Informasi */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Informasi</h3>
            <ul className="space-y-3 text-sm">
              <li><Link to="/cara-order" className="hover:text-primary-400 transition-colors">Cara Pemesanan</Link></li>
              <li><Link to="/care" className="hover:text-primary-400 transition-colors">Jaya Mandiri Care</Link></li>
              <li><Link to="/syarat-ketentuan" className="hover:text-primary-400 transition-colors">Syarat & Ketentuan</Link></li>
              <li><Link to="/kebijakan-privasi" className="hover:text-primary-400 transition-colors">Kebijakan Privasi</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Hubungi Kami</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin size={20} className="text-primary-500 shrink-0" />
                <span className="text-slate-400 leading-relaxed">
                  Jl. Percetakan Negara No. 123,<br />
                  Cempaka Putih, Jakarta Pusat 10560
                </span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone size={20} className="text-primary-500 shrink-0" />
                <span className="text-slate-400">0812-3456-7890</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail size={20} className="text-primary-500 shrink-0" />
                <span className="text-slate-400">halo@jayamandiri.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Oversized Wordmark / Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-black text-4xl md:text-6xl text-slate-800 tracking-tighter select-none">
            JAYA MANDIRI.
          </div>
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Jaya Mandiri Digital Printing. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
