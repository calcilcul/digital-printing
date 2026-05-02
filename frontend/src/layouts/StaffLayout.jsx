import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Printer, 
  LogOut, 
  Menu, 
  X, 
  Bell,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuthStore } from '../store/authStore';

export default function StaffLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/staff/dashboard' },
    { name: 'Verifikasi Pesanan', icon: PackageSearch, path: '/staff/verifikasi' },
    { name: 'Antrean Produksi', icon: Printer, path: '/staff/produksi' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 shrink-0">
          <Link to="/staff/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-lg text-white">Staff Portal</span>
          </Link>
          <button 
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Info (Sidebar) */}
        <div className="px-6 py-6 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-blue-400">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Staff User'}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user?.role || 'staff'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Menu Utama</p>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <item.icon size={18} className={isActive ? 'text-white' : 'text-slate-500'} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden text-slate-500 hover:text-slate-900"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            {/* Search Bar (Mock) */}
            <div className="hidden sm:flex items-center relative">
              <Search size={18} className="absolute left-3 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari ID pesanan..." 
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/staff/notifikasi" className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}
