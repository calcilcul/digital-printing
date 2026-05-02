import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/animations/FadeIn';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Semua field wajib diisi');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Password tidak cocok');
      return;
    }

    setIsLoading(true);

    // Simulate API
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock Login
    const userData = { 
      id: `cust-${Date.now()}`, 
      name: form.name, 
      email: form.email, 
      role: 'customer' 
    };

    login(userData);
    toast.success('Pendaftaran berhasil!');
    setIsLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary-200/50 blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-200/50 blur-[100px]"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/30">
            J
          </div>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">
            Jaya Mandiri
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
          Buat Akun Baru
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Sudah punya akun? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">Masuk di sini</Link>
        </p>
      </div>

      <FadeIn delay={0.1} className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-5" onSubmit={handleRegister}>
            
            <div>
              <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 border outline-none transition-colors hover:bg-white focus:bg-white"
                  placeholder="Nama lengkap Anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Alamat Email</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 border outline-none transition-colors hover:bg-white focus:bg-white"
                  placeholder="anda@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 border outline-none transition-colors hover:bg-white focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Konfirmasi Password</label>
              <div className="mt-1 relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleInputChange}
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 bg-slate-50 border outline-none transition-colors hover:bg-white focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" fullWidth size="lg" isLoading={isLoading} className="shadow-lg shadow-primary-500/20">
                {!isLoading && <UserPlus size={20} className="mr-2" />}
                Daftar Akun
              </Button>
            </div>
          </form>

        </div>
      </FadeIn>
    </div>
  );
}
