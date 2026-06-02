# Session Log: Modularisasi & Refactoring Komponen Beranda (Home Screen)

**Date:** 28 Mei 2026
**Role:** Customer
**Target Directory:** `mobile/src/components/customer/home/` & `mobile/src/screens/customer/HomeScreen.tsx`
**PRD Ref:** Redesign UI Halaman Beranda (Modern & Modular)

## Deskripsi Pekerjaan
Melakukan perombakan *under-the-hood* (refactor) pada berkas `HomeScreen.tsx` yang bersifat monolitik (~400+ baris) menjadi arsitektur berbasis komponen (component-based). Tujuan utama adalah memisahkan kode tampilan menjadi blok-blok UI yang rapi, *clean*, dan mudah di-*maintain* layaknya arsitektur pada aplikasi *startup* / *e-commerce* tingkat mahir.

## Detail Perubahan (Arsitektur Komponen)

### 1. Ekstraksi Komponen ke `mobile/src/components/customer/home/`
Satu file raksasa dipecah menjadi 6 komponen kecil dan fungsional:
- **`Header.tsx`**: Mengelola *Search Bar* melayang (*Sticky*) dengan integrasi tombol ikon keranjang (*badge*) dan tombol autentikasi/Profil pengguna.
- **`HeroSection.tsx`**: Menangani presentasi komidi putar (*Carousel*) dengan efek transisi (*Crossfade*) via modul `react-native-reanimated`. Teks dibuat lebih tajam dan menggunakan palet `bg-slate-50` yang jernih.
- **`UspCards.tsx`**: Mengemas *Unique Selling Proposition* ("Cek Kualitas AI" dan "Ambil di Toko") dalam blok *Clean Card* dengan elevasi bayangan ringan (`shadow-sm`).
- **`CategoryList.tsx`**: Komponen geser horizontal (*ScrollView Horizontal*) yang terenkapsulasi mandiri untuk mengatur navigasi kategori.
- **`ProductList.tsx`**: Modul yang me-*render* tampilan *Skeleton Loading* maupun kisi-kisi Produk dengan gaya modern (Apple/Shopify-like styling). Area ini memiliki tombol *"Quick Add"* terisolasi yang mengembalikan ID produk ke komponen induk.
- **`HowItWorks.tsx`**: Membungkus tata cara alur berbelanja ke dalam satu kartu elegan tanpa menyita *logic* berlebih.

### 2. Refactoring Induk (`HomeScreen.tsx`)
- Mengubah fungsi `HomeScreen` murni menjadi lapisan pengendali (*Controller* / *Container*).
- Menghapus 300+ baris kode UI (JSX) statis dan menggantinya dengan struktur deklaratif memanggil komponen eksternal (misal `<Header />`, `<HeroSection />`, `<ProductList />`).
- Semua *State*, *Fetch Action* (lewat Zustand Store), dan parameter *React Navigation* dipertahankan dengan aman di dalam *Container* ini lalu dilempar (di-*pass*) ke bawah menggunakan *Props*.

## Dampak (Impact)
1. **Peningkatan Kualitas Kode (*Clean Code*)**: Ukuran `HomeScreen.tsx` berkurang lebih dari 60%, membuatnya kini luar biasa mudah dibaca (*Highly Readable*).
2. **Kinerja (UX)**: Interaksi pengguliran animasi (seperti transisi *Header*) tidak lagi membebani komponen berjenjang karena isolasi di *layer* teratas via React Native Reanimated. Layout kini identik dengan *feel* premium.
3. **Penyelarasan Bisnis**: Logic pemanggilan keranjang dan *fetching* data rekomendasi sama sekali tak berubah—memastikan *Business Logic* berstatus stabil.
