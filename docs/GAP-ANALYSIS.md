# 📊 Gap Analysis — Kode vs PRD
# Jaya Mandiri Digital Printing Management System

> **Terakhir diperbarui**: 28 Mei 2026  
> **Versi PRD**: v2.0.0  
> **Analisis oleh**: AI Assistant

---

## 🟢 Legenda Status

| Simbol | Status | Arti |
|--------|--------|------|
| ✅ | DONE | Sudah diimplementasikan & sesuai PRD |
| 🔄 | PARTIAL | Sudah ada tapi belum lengkap/ada bug |
| ❌ | MISSING | Belum diimplementasikan sama sekali |
| ⚠️ | MISMATCH | Implementasi ada tapi tidak sesuai spesifikasi PRD |

---

## 1. BACKEND — Golang API

### 1.1 Autentikasi (F-AUTH)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Login | F-AUTH-02 | ✅ DONE | `POST /login` — rate limit aktif |
| Register Customer | F-AUTH-01 | ✅ DONE | `POST /register` |
| Logout | F-AUTH-04 | ✅ DONE | `POST /api/logout` — dicatat di login_logs |
| Register Staff (Owner) | F-AUTH-03 | ✅ DONE | `POST /api/admin/staff` |
| Update Profil | F-AUTH-05 | ✅ DONE | `PUT /api/profile` |
| Manajemen User (Owner) | F-AUTH-06 | ✅ DONE | `GET/PUT /api/admin/users` |

### 1.2 Produk & Katalog (F-PROD)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Lihat Katalog | F-PROD-01 | ✅ DONE | `GET /products` — public |
| Detail Produk | F-PROD-02 | ⚠️ PARTIAL | Endpoint ada tapi tidak di routes (`/products/:id` belum ada terpisah) |
| CRUD Produk (Owner) | F-PROD-03 | ✅ DONE | `POST/PUT/DELETE /api/admin/products` |
| Manajemen Kategori | F-PROD-04 | ❌ MISSING | Endpoint `/api/admin/categories` belum ada di routes |

### 1.3 Keranjang (F-CART)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Tambah ke Keranjang | F-CART-01 | ✅ DONE | `POST /api/cart` |
| Lihat Keranjang | F-CART-02 | ✅ DONE | `GET /api/cart` |
| Update Item | F-CART-03 | ✅ DONE | `PUT /api/cart` |
| Hapus Item | F-CART-04 | ✅ DONE | `DELETE /api/cart` |

### 1.4 Pesanan (F-ORDER)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Checkout dari Keranjang | F-ORDER-01 | ✅ DONE | `POST /api/checkout` |
| Buy Now | F-ORDER-02 | ✅ DONE | `POST /api/buy-now` |
| Lihat Daftar Pesanan | F-ORDER-03 | ✅ DONE | `GET /api/orders` |
| Detail Pesanan | F-ORDER-04 | ✅ DONE | `GET /api/orders/:id` |
| Batalkan Pesanan | F-ORDER-05 | ✅ DONE | `PUT /api/orders/:id/cancel` |
| Konfirmasi Terima | F-ORDER-06 | ✅ DONE | `PUT /api/orders/:id/complete` |
| Download Invoice PDF | — | ✅ DONE | `GET /api/orders/:id/invoice/pdf` |
| Auto-Cancel Cron | F-ORDER-08 | 🔄 PARTIAL | Logika ada di backend tapi perlu verifikasi schedule |

### 1.5 Upload Desain (F-DESIGN)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Upload Desain | F-DESIGN-01 | ✅ DONE | `POST /api/orders/:id/items/:item_id/design` |
| Reupload Desain | F-DESIGN-04 | ✅ DONE | `POST /api/orders/:id/items/:item_id/design/reupload` |
| AI Blur Detection | F-DESIGN-02 | ✅ DONE | Terintegrasi ke Python AI |
| Review Desain Staff | F-DESIGN-03 | ✅ DONE | `PUT /api/staff/orders/:id/design/approve` & `/revision` |

### 1.6 Pembayaran (F-PAY)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Upload Bukti Bayar | F-PAY-01 | ✅ DONE | `POST /api/orders/:id/payment` |
| Reupload Bukti Bayar | F-PAY-03 | ✅ DONE | `POST /api/orders/:id/payment/reupload` |
| Approve Pembayaran | F-PAY-02 | ✅ DONE | `PUT /api/staff/orders/:id/payment/approve` |
| Reject Pembayaran | F-PAY-02 | ✅ DONE | `PUT /api/staff/orders/:id/payment/reject` |

### 1.7 Produksi (F-PROD-FLOW)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Lihat Antrian Produksi | F-PROD-FLOW-01 | ✅ DONE | `GET /api/staff/orders` |
| Mulai Cetak | F-PROD-FLOW-02 | ✅ DONE | `PUT /api/staff/production/:id/start` |
| Selesai Cetak | F-PROD-FLOW-03 | ✅ DONE | `PUT /api/staff/production/:id/finish` |

### 1.8 Material (F-MAT)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Lihat Material | F-MAT-01 | ✅ DONE | `GET /api/admin/materials` |
| Tambah Material | F-MAT-02 | ✅ DONE | `POST /api/admin/materials` |
| Adjust Stok | F-MAT-03 | ✅ DONE | `POST /api/admin/materials/:id/adjust` |
| Pengurangan Stok Otomatis | F-MAT-04 | ✅ DONE | Di dalam logika checkout |

### 1.9 Laporan (F-REPORT)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Laporan Revenue | F-REPORT-01 | ✅ DONE | `GET /api/admin/reports/revenue` |
| Top Produk | F-REPORT-02 | ✅ DONE | `GET /api/admin/reports/products` |
| Audit Log | F-REPORT-03 | ✅ DONE | `GET /api/admin/logs/audit` |
| Login Log | F-REPORT-04 | ✅ DONE | `GET /api/admin/logs/login` |
| Production Log | — | ✅ DONE | `GET /api/admin/logs/production` |

### 1.10 WebSocket (F-NOTIF)

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Koneksi WebSocket | F-NOTIF-01 | ✅ DONE | `GET /ws` — Hub tersedia |
| Event Notifikasi | F-NOTIF-02 | ✅ DONE | Terintegrasi penuh di Mobile Customer (Order Tracking) |

---

## 2. PYTHON AI SERVICE

| Fitur | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| Blur Detection (MobileNetV2) | S11.2 | ✅ DONE | `model.h5` ada, 21MB |
| Laplacian Variance | S11.3 | ✅ DONE | Ensemble logic ada di `main.py` |
| Bypass Mode (AI down) | S11.4 | ✅ DONE | Default `sharp` jika model tidak ada |
| Health Check | S11.5 | ✅ DONE | `GET /` |
| Predict Blur | S11.5 | ✅ DONE | `POST /predict-blur` |

**✅ Python AI — 100% Sesuai PRD**

---

## 3. MOBILE APP — Expo React Native

### 3.1 Navigasi & Struktur

| Komponen | PRD Ref | Status | Keterangan |
|----------|---------|--------|------------|
| Guest Navigator | — | ✅ DONE | `GuestNavigator.tsx` → LandingScreen |
| Auth Navigator (Login/Register) | F-AUTH | ✅ DONE | `auth/LoginScreen`, `auth/RegisterScreen` |
| Customer Tab Navigator | — | ✅ DONE | Home, Shop, Cart, Orders, Profile |
| Staff Navigator | — | ✅ DONE | Dashboard, Bayar, Desain, Cetak, Profil |
| Manager/Owner Navigator | — | 🔄 PARTIAL | Laporan, Produk, Stok — BELUM ada: User Mgmt, Audit Log |

### 3.2 Customer Screens

| Screen | PRD Ref | Status | Keterangan |
|--------|---------|--------|------------|
| LandingScreen (Guest) | — | ✅ DONE | `guest/LandingScreen.tsx` |
| LoginScreen | F-AUTH-02 | ✅ DONE | `auth/LoginScreen.tsx` |
| RegisterScreen | F-AUTH-01 | ✅ DONE | `auth/RegisterScreen.tsx` |
| HomeScreen | — | ✅ DONE | `customer/HomeScreen.tsx` |
| CatalogScreen | F-PROD-01 | ✅ DONE | `customer/CatalogScreen.tsx` |
| ProductDetailScreen | F-PROD-02 | ✅ DONE | `customer/ProductDetailScreen.tsx` |
| CartScreen | F-CART | ✅ DONE | `customer/CartScreen.tsx` |
| CheckoutScreen | F-ORDER-01 | ✅ DONE | `customer/CheckoutScreen.tsx` |
| PaymentScreen | F-PAY-01 | ✅ DONE | `customer/PaymentScreen.tsx` |
| UploadDesignScreen | F-DESIGN-01 | ✅ DONE | `customer/UploadDesignScreen.tsx` |
| UploadPaymentScreen | F-PAY-01 | ✅ DONE | `customer/UploadPaymentScreen.tsx` |
| OrderListScreen | F-ORDER-03 | ✅ DONE | `customer/OrderListScreen.tsx` |
| OrderDetailScreen | F-ORDER-04 | ✅ DONE | `customer/OrderDetailScreen.tsx` |
| ProfileScreen | F-AUTH-05 | ✅ DONE | `customer/ProfileScreen.tsx` |

### 3.3 Staff Screens

| Screen | PRD Ref | Status | Keterangan |
|--------|---------|--------|------------|
| StaffDashboardScreen | — | ✅ DONE | `staff/StaffDashboardScreen.tsx` |
| StaffPaymentVerificationScreen | F-PAY-02 | ✅ DONE | `staff/StaffPaymentVerificationScreen.tsx` |
| StaffDesignReviewScreen | F-DESIGN-03 | ✅ DONE | `staff/StaffDesignReviewScreen.tsx` |
| StaffProductionScreen | F-PROD-FLOW | ✅ DONE | `staff/StaffProductionScreen.tsx` |
| StaffOrderVerificationScreen | — | ✅ DONE | `staff/StaffOrderVerificationScreen.tsx` |
| StaffProfileScreen | F-AUTH-05 | ✅ DONE | `staff/StaffProfileScreen.tsx` |

### 3.4 Manager/Owner Screens

| Screen | PRD Ref | Status | Keterangan |
|--------|---------|--------|------------|
| ManagerDashboardScreen | F-REPORT | 🔄 PARTIAL | Ada tapi basic — perlu revenue chart & filter |
| ProductManagementScreen | F-PROD-03 | 🔄 PARTIAL | Ada tapi CRUD produk belum lengkap (Add/Edit/Delete product) |
| ManagerMaterialScreen | F-MAT | ✅ DONE | Adjust stok tersedia |
| **User Management Screen** | F-AUTH-06 | ❌ MISSING | Belum ada screen untuk kelola user/staff |
| **Audit Log Screen** | F-REPORT-03 | ❌ MISSING | Belum ada screen audit log |
| **Login Log Screen** | F-REPORT-04 | ❌ MISSING | Belum ada screen login log |
| **Production Log Screen** | — | ❌ MISSING | Belum ada screen production log |

### 3.5 State Management (Zustand Stores)

| Store | PRD Ref | Status | Keterangan |
|-------|---------|--------|------------|
| authStore.ts | F-AUTH | ✅ DONE | Login, logout, token, role |
| cartStore.ts | F-CART | ✅ DONE | Add, remove, update, clear |
| orderStore.ts | F-ORDER | ✅ DONE | Fetch, checkout, upload design/payment |
| productStore.ts | F-PROD | ✅ DONE | Fetch products |
| staffStore.ts | Staff features | ✅ DONE | Semua aksi staff |
| adminStore.ts | Owner features | 🔄 PARTIAL | Revenue & material — BELUM: users, audit log |

### 3.6 API Integration

| API Client | PRD Ref | Status | Keterangan |
|------------|---------|--------|------------|
| axiosClient.ts | — | ✅ DONE | JWT interceptor, base URL |
| customerApi.ts | Customer | ✅ DONE | Semua endpoint customer |
| Supabase Client | — | ⚠️ MISMATCH | Ada supabaseClient.ts tapi PRD tidak menggunakan Supabase |

---

## 4. RINGKASAN GAP

### 4.1 Skor Kepatuhan PRD

| Layer | Total Fitur | ✅ Done | 🔄 Partial | ❌ Missing |
|-------|-------------|---------|------------|------------|
| Backend Golang | 38 | 35 | 2 | 1 |
| Python AI | 5 | 5 | 0 | 0 |
| Mobile Customer | 14 | 14 | 0 | 0 |
| Mobile Staff | 6 | 6 | 0 | 0 |
| Mobile Manager | 8 | 1 | 2 | 5 |
| **TOTAL** | **71** | **61** | **4** | **6** |

**Skor Kepatuhan PRD: 86% (61/71 fitur selesai)**

### 4.2 Prioritas Perbaikan

#### 🔴 HIGH PRIORITY (Segera)

1. **❌ User Management Screen** (Manager) — PRD: F-AUTH-06
   - Belum ada screen untuk melihat/nonaktifkan user
   - API sudah tersedia: `GET /api/admin/users`, `PUT /api/admin/users/:id/status`

2. **❌ Audit Log Screen** (Manager) — PRD: F-REPORT-03
   - API sudah tersedia: `GET /api/admin/logs/audit`

3. **❌ Login Log Screen** (Manager) — PRD: F-REPORT-04
   - API sudah tersedia: `GET /api/admin/logs/login`

#### 🟡 MEDIUM PRIORITY

4. **🔄 ManagerDashboardScreen** — Perlu chart revenue & filter periode

5. **🔄 ProductManagementScreen** — CRUD produk belum lengkap (tambah/edit/hapus)

6. **⚠️ supabaseClient.ts** — File ini tidak sesuai PRD (PRD tidak pakai Supabase)

7. **❌ Manajemen Kategori** — `POST/GET/PUT/DELETE /api/admin/categories` belum ada

#### 🟢 LOW PRIORITY

8. **❌ Production Log Screen** — API tersedia tapi belum ada screen

---

## 5. REKOMENDASI PROMPT

Gunakan format berikut saat minta bantuan pengembangan:

```
[TASK] Implementasi [Nama Fitur]
[PRD REF] F-XXXXX
[FILE TARGET] mobile/src/screens/manager/UserManagementScreen.tsx
[API] GET /api/admin/users | PUT /api/admin/users/:id/status
[PRIORITY] HIGH/MEDIUM/LOW
```

---

*Dokumen ini diperbarui otomatis setiap ada perubahan signifikan pada codebase.*
