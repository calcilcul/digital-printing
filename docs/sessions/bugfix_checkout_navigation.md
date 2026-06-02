# Session Log: Bug Fix Navigation Checkout

**Date:** 28 Mei 2026
**Role:** Customer
**Target File:** `mobile/src/screens/customer/CheckoutScreen.tsx`
**PRD Ref:** F-ORDER-01 (Checkout dari Keranjang)

## Deskripsi Masalah
Pengguna mengalami masalah (bug) navigasi di mana aplikasi terasa "stuck" atau menahan pengguna di layar Checkout setelah tombol "Buat Pesanan" diklik. Hal ini disebabkan karena aplikasi menampilkan layar sukses statis selama beberapa detik (`setTimeout`) dan menggunakan metode navigasi standar (`navigation.navigate`) yang masih memungkinkan pengguna untuk menekan tombol *back* kembali ke keranjang yang sudah kosong.

## Analisis & Perbaikan (Fix)

Bagian kode yang menyebabkan masalah:
```typescript
// Kode Lama (Menyebabkan Stuck & Back Stack Issue)
setTimeout(() => {
  setIsSuccess(false);
  navigation.navigate('OrderList');
}, 2000);
```

Perbaikan yang diterapkan pada `CheckoutScreen.tsx`:
1. **Menghapus State Timer**: Menghapus blok kode `setTimeout` dan layar sukses internal (`isSuccess`) dari `CheckoutScreen.tsx` untuk menghilangkan waktu tunggu fiktif.
2. **Force Replace Navigation**: Mengganti `navigation.navigate('OrderList')` dengan `navigation.replace('OrderDetail', { orderId })`. Metode `replace` di React Navigation akan membuang riwayat tumpukan (stack) halaman Checkout saat ini, sehingga tombol "kembali" (back button) secara natif di Android/iOS akan langsung mengarah ke halaman sebelum Checkout (seperti Home/Cart) tanpa harus melewati layar Checkout yang kadaluarsa.
3. **Pembersihan Keranjang Aman**: Pemanggilan fungsi `clearCart()` tetap dipertahankan persis setelah `orderId` tervalidasi ada, membuktikan bahwa API Golang membalas status transaksi berhasil.
4. **Fix Kesalahan Mapping order_id**: Pada `orderStore.ts`, ternyata kode lama mencoba mengekstrak id dengan struktur `res.data.data.order_id`. Padahal backend Golang mengirimkannya di *root* JSON objek (`res.data.order_id`). Akibatnya, nilai selalu balikan `null` dan terlempar ke *Alert Checkout Gagal* yang menyebabkannya mentok di layar. Ini telah diperbaiki dengan penambahan fallback *safety* (`res.data?.order_id`).
5. **Error Handling Visual**: Jika transaksi gagal dilempar dari Store (`catch`), aplikasi akan menghentikan `ActivityIndicator` dan langsung melempar `Alert.alert` sehingga pengguna paham ada isu jaringan/sistem.

## Status PRD (GAP-ANALYSIS)
Fitur **F-ORDER-01 (Checkout dari Keranjang)** tetap berada dalam status **✅ DONE** pada `GAP-ANALYSIS.md` dengan performa navigasi yang kini tersinkronisasi 100% tanpa adanya jebakan flow UX (Dead-end Navigation).
