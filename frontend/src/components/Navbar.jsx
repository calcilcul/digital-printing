import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, Heart } from 'lucide-react';
import { m, AnimatePresence } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const cartItems = useCartStore((state) => state.items);
  const { isAuthenticated, user } = useAuthStore();

  const cartItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Katalog', path: '/katalog' },
    { name: 'Kontak', path: '/kontak' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                J
              </div>
              <span className="font-bold text-xl text-slate-900 hidden sm:block">
                Jaya Mandiri
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary-600 ${
                  location.pathname === link.path ? 'text-primary-600' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/wishlist" className="text-slate-500 hover:text-primary-600 transition-colors hidden sm:block">
              <Heart size={20} />
            </Link>
            
            <Link to="/keranjang" className="text-slate-500 hover:text-primary-600 transition-colors relative">
              <ShoppingCart size={20} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            <div className="hidden sm:block">
              {isAuthenticated ? (
                <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-primary-600">
                  <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                    {user?.name?.charAt(0) || <User size={16} />}
                  </div>
                </Link>
              ) : (
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary-600 flex items-center gap-1">
                  <User size={20} />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden text-slate-500 hover:text-primary-600"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 pt-2 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              
              <div className="border-t border-slate-200 mt-4 pt-4">
                {isAuthenticated ? (
                  <Link 
                    to="/profile" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 text-base font-medium text-slate-600"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                      {user?.name?.charAt(0) || <User size={16} />}
                    </div>
                    <span>{user?.name || 'Profile Saya'}</span>
                  </Link>
                ) : (
                  <Link 
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 bg-primary-50"
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
