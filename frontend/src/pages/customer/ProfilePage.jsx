import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Settings, MapPin, Package, Bell, ChevronRight } from 'lucide-react';
import { m } from 'framer-motion';
import toast from 'react-hot-toast';

import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/ui/Button';
import { FadeIn } from '../../components/animations/FadeIn';

// Dummy Tab Components
function EditProfileTab({ user }) {
  const [isSaving, setIsSaving] = React.useState(false);
  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profil berhasil diperbarui!');
    }, 1000);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Edit Profile</h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
          <input required type="text" defaultValue={user?.name} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input required type="email" defaultValue={user?.email} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Telepon</label>
          <input type="tel" defaultValue="081234567890" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </div>
  );
}

function AlamatTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">Alamat Tersimpan</h3>
        <Button size="sm">Tambah Alamat</Button>
      </div>
      <div className="space-y-4">
        <div className="p-4 rounded-xl border-2 border-primary-100 bg-primary-50 relative">
          <div className="absolute top-4 right-4 bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded">Utama</div>
          <h4 className="font-bold text-slate-900 mb-1">Rumah</h4>
          <p className="text-sm text-slate-600 mb-3">Jl. Percetakan Negara No. 123, Cempaka Putih, Jakarta Pusat 10560</p>
          <div className="flex gap-3 text-sm">
            <button className="text-primary-600 font-medium hover:underline">Edit</button>
            <button className="text-red-500 font-medium hover:underline">Hapus</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotifikasiTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Pengaturan Notifikasi</h3>
      <div className="space-y-6">
        {[
          { title: 'Status Pesanan', desc: 'Pemberitahuan saat pesanan diproses, dikirim, atau selesai.' },
          { title: 'Promo & Diskon', desc: 'Informasi penawaran spesial dan potongan harga.' },
          { title: 'Newsletter', desc: 'Berita terbaru seputar layanan percetakan kami.' }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-slate-900">{item.title}</h4>
              <p className="text-sm text-slate-500">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked={idx === 0} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

function PengaturanTab() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-xl font-bold text-slate-900 mb-6">Keamanan Akun</h3>
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-slate-900 mb-2">Ubah Password</h4>
          <form className="space-y-4 max-w-sm" onSubmit={(e) => { e.preventDefault(); toast.success('Password diperbarui'); }}>
            <input required type="password" placeholder="Password Lama" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <input required type="password" placeholder="Password Baru" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
            <Button size="sm" type="submit">Update Password</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.success('Berhasil keluar');
    navigate('/login');
  };

  const [activeTab, setActiveTab] = React.useState('menu');

  const menuItems = [
    { id: 'pesanan', icon: Package, label: 'Pesanan Saya', desc: 'Lihat riwayat dan status pesanan' },
    { id: 'alamat', icon: MapPin, label: 'Alamat Tersimpan', desc: 'Atur alamat pengiriman Anda' },
    { id: 'notifikasi', icon: Bell, label: 'Notifikasi', desc: 'Pengaturan pemberitahuan' },
    { id: 'pengaturan', icon: Settings, label: 'Pengaturan Akun', desc: 'Ubah password dan data diri' },
  ];

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-12 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-8">Profile Saya</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* User Card */}
          <div className="md:col-span-1">
            <FadeIn className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
              <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold shadow-inner">
                {user.name?.charAt(0) || <User size={32} />}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{user.name}</h2>
              <p className="text-sm text-slate-500 mb-6">{user.email}</p>
              
              <div className="space-y-3">
                <Button variant={activeTab === 'edit' ? 'primary' : 'outline'} fullWidth onClick={() => setActiveTab('edit')}>Edit Profile</Button>
                <Button variant="danger" fullWidth onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 border-red-100">
                  <LogOut size={18} className="mr-2" /> Keluar
                </Button>
              </div>
            </FadeIn>
          </div>

          {/* Menu / Content */}
          <div className="md:col-span-2 space-y-4">
            
            {activeTab !== 'menu' && activeTab !== 'edit' && (
              <button 
                onClick={() => setActiveTab('menu')}
                className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-4 transition-colors"
              >
                <ChevronRight size={16} className="rotate-180 mr-1" /> Kembali ke Menu
              </button>
            )}

            {activeTab === 'menu' && menuItems.map((item, idx) => (
              <FadeIn key={idx} delay={idx * 0.1}>
                <div 
                  onClick={() => {
                    if (item.id === 'pesanan') navigate('/pesanan');
                    else setActiveTab(item.id);
                  }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center gap-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors shrink-0">
                    <item.icon size={24} />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{item.label}</h3>
                    <p className="text-sm text-slate-500">{item.desc}</p>
                  </div>
                  <ChevronRight size={20} className="text-slate-400 group-hover:text-primary-500" />
                </div>
              </FadeIn>
            ))}

            {activeTab === 'edit' && <FadeIn><EditProfileTab user={user} /></FadeIn>}
            {activeTab === 'alamat' && <FadeIn><AlamatTab /></FadeIn>}
            {activeTab === 'notifikasi' && <FadeIn><NotifikasiTab /></FadeIn>}
            {activeTab === 'pengaturan' && <FadeIn><PengaturanTab /></FadeIn>}

            <FadeIn delay={0.4} className="mt-8 pt-8 border-t border-slate-200">
              <div className="bg-primary-50 rounded-xl p-6 border border-primary-100 flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-bold text-primary-900 mb-2">Butuh Bantuan?</h3>
                  <p className="text-sm text-primary-700">Tim CS kami siap membantu Anda setiap hari kerja, pukul 08:00 - 17:00 WIB.</p>
                </div>
                <Button className="shrink-0 whitespace-nowrap shadow-md shadow-primary-500/20" onClick={() => navigate('/care')}>
                  Pusat Bantuan
                </Button>
              </div>
            </FadeIn>
          </div>

        </div>

      </div>
    </div>
  );
}
