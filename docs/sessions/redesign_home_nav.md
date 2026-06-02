# Session Log: Redesign Beranda & Update Bottom Navigation

**Date:** 28 Mei 2026
**Role:** Customer
**Target File:** `mobile/src/screens/customer/HomeScreen.tsx`, `mobile/src/navigation/MainNavigator.tsx`
**PRD Ref:** Section 4.2 (Out of Scope) & Peningkatan UX

## Deskripsi Pekerjaan
Melakukan perombakan besar (Redesign) pada halaman Beranda (*Home*) agar terasa lebih modern, elegan, dan sepenuhnya menggunakan **Light Mode** (Tailwind). Selain itu, menambahkan integrasi tab navigasi baru khusus untuk memudahkan pelacakan pesanan pengguna.

## Detail Perubahan

### 1. Perombakan Navigasi (`MainNavigator.tsx`)
- **Penambahan Tab Pesanan**: Menambahkan tab baru bernama "Pesanan" yang merujuk langsung ke layar `OrderListScreen.tsx`.
- **Pengurutan Tab**: Tab sekarang tersusun rapi dengan urutan: *Beranda -> Katalog -> Keranjang -> Pesanan -> Profil*.
- **Ikonografi**: Tab "Pesanan" menggunakan ikon `Package` dari pustaka `lucide-react-native` untuk menekankan kemudahan *order tracking*.

### 2. Redesign Layar Beranda (`HomeScreen.tsx`)
- **Hero Section (Light Mode)**: 
  - Background gelap diubah menjadi bernuansa terang (`bg-slate-50`).
  - Overlay gradient yang lebih *soft* (dari putih ke transparan) ditambahkan pada navbar.
  - Tipografi judul *"Wujudkan Idemu Jadi Nyata"* dipertegas dengan warna gelap (`text-slate-900`) dan *tracking tight*.
- **USP Cards**: 
  - Menghapus klaim *"Gratis Ongkir"* dan *"Selesai 24 Jam"*.
  - Menggantinya dengan penawaran nilai yang relevan sesuai spesifikasi aplikasi: **Cek Kualitas AI** (Aman dari blur) dan **Ambil di Toko** (Cepat selesai).
- **Katalog Produk (Quick Add)**: 
  - Padding dirapikan agar card produk tidak menempel pada sudut layar.
  - Penambahan efek bayangan (*shadow-sm*, *shadow-slate-200*) untuk memberi dimensi ruang.
  - Tombol **+** (Quick Add) diperbesar dan dibuat lebih mencolok menggunakan warna utama (`bg-indigo-600`) dengan bayangan elevasi (*shadow-lg*).
- **Section Cara Kerja**: 
  - Kontainer gelap dihilangkan dan diganti dengan desain kartu putih modern.
  - Teks Langkah ke-3 direvisi dari *"mengirim langsung ke alamat Anda"* menjadi *"Pesanan siap diambil di toko kami"* sesuai dengan PRD ketiadaan kurir.

## Update Dokumen
- Penyelarasan di **GAP-ANALYSIS.md** pada tabel navigasi agar selaras dengan penambahan `Orders` di dalam Customer Tab Navigator.
