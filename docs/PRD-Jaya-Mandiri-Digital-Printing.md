# 🖨️ Product Requirements Document (PRD)
# Jaya Mandiri — Digital Printing Management System

---

| Metadata | Detail |
|----------|--------|
| **Nama Proyek** | Jaya Mandiri Digital Printing Management System |
| **Versi Dokumen** | v2.0.0 — FINAL |
| **Status** | ✅ Approved |
| **Tanggal Dibuat** | 28 Mei 2026 |
| **Terakhir Diperbarui** | 28 Mei 2026 |
| **Penulis** | Tim Pengembang Jaya Mandiri |
| **Berlaku untuk** | Seluruh Tim Pengembang, QA, dan Stakeholder |

> [!IMPORTANT]
> Dokumen ini adalah **versi FINAL** yang telah disetujui. Setiap perubahan pada dokumen ini wajib melalui proses review ulang dan pembaruan versi.

---

## Daftar Isi

1. [Ringkasan Eksekutif](#1-ringkasan-eksekutif)
2. [Latar Belakang & Permasalahan](#2-latar-belakang--permasalahan)
3. [Tujuan Produk](#3-tujuan-produk)
4. [Ruang Lingkup (Scope)](#4-ruang-lingkup-scope)
5. [Target Pengguna (User Personas)](#5-target-pengguna-user-personas)
6. [Arsitektur Sistem](#6-arsitektur-sistem)
7. [Spesifikasi Fitur](#7-spesifikasi-fitur)
8. [Alur Bisnis & Use Case](#8-alur-bisnis--use-case)
9. [Spesifikasi API & Integrasi](#9-spesifikasi-api--integrasi)
10. [Skema Database](#10-skema-database)
11. [Spesifikasi AI Service](#11-spesifikasi-ai-service)
12. [Keamanan & Autentikasi](#12-keamanan--autentikasi)
13. [Kriteria Keberhasilan (Success Metrics)](#13-kriteria-keberhasilan-success-metrics)
14. [Asumsi & Batasan](#14-asumsi--batasan)
15. [Risiko & Mitigasi](#15-risiko--mitigasi)
16. [Timeline & Milestone](#16-timeline--milestone)
17. [Peran Tim & Tanggung Jawab](#17-peran-tim--tanggung-jawab)
18. [Glosarium](#18-glosarium)
19. [Data Pengujian (Test Credentials & Seed Data)](#19-data-pengujian-test-credentials--seed-data)
20. [Riwayat Versi (Changelog)](#20-riwayat-versi-changelog)
21. [Persetujuan Dokumen (Approval Sign-off)](#21-persetujuan-dokumen-approval-sign-off)

---

## 1. Ringkasan Eksekutif

**Jaya Mandiri Digital Printing Management System** adalah platform manajemen percetakan digital berbasis **mobile-first** yang dibangun untuk mengotomasi dan mendigitalisasi seluruh alur operasional bisnis percetakan — mulai dari penerimaan pesanan, verifikasi pembayaran, review desain, proses produksi, hingga penyelesaian dan pelaporan bisnis.

Platform ini menggantikan alur manual (via WhatsApp, kertas bon, dan pencatatan manual) dengan sistem terpadu yang real-time, transparan, dan terukur.

### Stack Teknologi

| Layer | Teknologi | Peran |
|-------|-----------|-------|
| **Mobile Client** | Expo React Native (TypeScript) + NativeWind | Aplikasi mobile iOS & Android untuk Customer, Staff, dan Owner |
| **Backend API** | Golang (Gin Framework) | REST API utama, logika bisnis, JWT Auth, WebSocket |
| **AI Microservice** | Python (FastAPI + TensorFlow/MobileNetV2) | Deteksi kualitas gambar (Blur Detection) dengan Ensemble Method |
| **Database** | PostgreSQL 15 | Penyimpanan data persisten dengan ENUM types |
| **State Management** | Zustand | Client-side state management di mobile |
| **HTTP Client** | Axios + React Query | API fetching & caching di mobile |

---

## 2. Latar Belakang & Permasalahan

### 2.1 Kondisi Saat Ini

Bisnis percetakan digital seperti **Jaya Mandiri** umumnya masih beroperasi secara manual:

- Pesanan diterima melalui WhatsApp atau datang langsung ke toko
- Desain dikirim via WhatsApp, Google Drive, atau USB
- Pembayaran dilakukan tunai atau transfer manual tanpa sistem verifikasi
- Pemilik tidak memiliki visibilitas real-time terhadap status produksi
- Laporan dibuat manual di Excel di akhir bulan
- Tidak ada tracking pesanan yang bisa diakses oleh pelanggan

### 2.2 Permasalahan Utama (Problem Statement)

| # | Masalah | Dampak |
|---|---------|--------|
| P1 | Pelanggan tidak bisa memantau status pesanan secara mandiri | Banyak pertanyaan masuk ke WhatsApp admin |
| P2 | Desain yang blur/berkualitas rendah sering lolos ke produksi | Menghasilkan cetakan buruk dan komplain pelanggan |
| P3 | Verifikasi pembayaran dilakukan manual dan lambat | Keterlambatan proses produksi |
| P4 | Tidak ada sistem stok material yang terintegrasi | Kehabisan bahan saat order masuk |
| P5 | Laporan bisnis tidak tersedia real-time | Owner tidak bisa mengambil keputusan cepat |
| P6 | Proses produksi tidak tertracking | Tidak bisa mengestimasi waktu selesai dengan akurat |

### 2.3 Peluang

- Pertumbuhan demand percetakan digital UMKM meningkat pasca-pandemi
- Pelanggan generasi muda mengharapkan pengalaman pemesanan digital
- AI untuk quality control desain dapat mengurangi waste material secara signifikan
- Otomasi notifikasi real-time meningkatkan kepuasan pelanggan

---

## 3. Tujuan Produk

### 3.1 Tujuan Bisnis

1. **Meningkatkan efisiensi operasional** — Mengurangi waktu proses pesanan dari rata-rata 2 jam menjadi < 30 menit
2. **Meningkatkan kepuasan pelanggan** — Customer dapat tracking pesanan 24/7 tanpa perlu menghubungi admin
3. **Mengurangi reject produksi** — AI blur detection memastikan kualitas desain sebelum cetak, target 0% cetakan ulang akibat desain blur
4. **Meningkatkan visibilitas bisnis** — Owner mendapat laporan revenue & produksi real-time
5. **Skalabilitas** — Sistem siap menangani volume pesanan yang berkembang tanpa penambahan staf administrasi

### 3.2 Tujuan Produk (Product Goals)

- `G1` Membangun platform end-to-end untuk manajemen pesanan percetakan
- `G2` Mengintegrasikan AI untuk validasi kualitas desain secara otomatis (Ensemble: MobileNetV2 + Laplacian Variance)
- `G3` Menyediakan dashboard real-time untuk owner dan staff
- `G4` Memberikan pengalaman pemesanan digital yang seamless bagi pelanggan
- `G5` Membangun sistem notifikasi real-time (WebSocket) untuk update status

---

## 4. Ruang Lingkup (Scope)

### 4.1 Dalam Lingkup (In Scope)

- ✅ Sistem autentikasi multi-role (Customer, Staff, Owner) dengan JWT
- ✅ Rate limiting pada endpoint auth (perlindungan brute-force)
- ✅ Katalog produk & varian dengan harga dinamis
- ✅ Manajemen keranjang belanja
- ✅ Proses checkout & buy-now dari satu item
- ✅ Upload desain file (JPG, PNG) per item pesanan
- ✅ AI blur detection (Ensemble: MobileNetV2 + Laplacian Variance) untuk validasi kualitas desain
- ✅ Upload bukti pembayaran & verifikasi manual oleh staff/owner
- ✅ Workflow review desain (approve/revisi) oleh staff
- ✅ Manajemen produksi (start/finish) dengan production logs
- ✅ Download invoice pesanan dalam format PDF
- ✅ Notifikasi real-time via WebSocket
- ✅ Manajemen stok material dengan logging perubahan (in/out)
- ✅ Laporan revenue dan top produk (Owner only)
- ✅ Audit log & login log untuk keamanan dan traceability
- ✅ Auto-cancel pesanan yang tidak dibayar > 24 jam (cron job)
- ✅ Manajemen user (aktifkan/nonaktifkan akun) oleh Owner
- ✅ Update profil (nama & nomor HP) oleh semua user

### 4.2 Di Luar Lingkup (Out of Scope)

- ❌ Payment gateway otomatis (Midtrans, Xendit) — verifikasi manual
- ❌ Fitur desain online (design editor) — customer upload file sendiri
- ❌ Pengiriman / delivery order — ambil di toko
- ❌ Multi-cabang / multi-tenant
- ❌ Integrasi marketplace (Tokopedia, Shopee)
- ❌ Fitur loyalty points / program referral
- ❌ Export laporan ke Excel (roadmap v3.0)
- ❌ Notifikasi push (Firebase FCM) — roadmap v2.1

---

## 5. Target Pengguna (User Personas)

### Persona 1: Customer — "Rika, Pemilik UMKM"

```
Nama        : Rika Amelia
Usia        : 28 tahun
Pekerjaan   : Pemilik usaha katering kecil
Perangkat   : Smartphone Android (mid-range)
```

**Kebutuhan:**
- Memesan banner/brosur promosi dengan mudah dari mana saja
- Mengetahui estimasi selesai dan status pesanan tanpa harus menelepon
- Mengirim file desain tanpa harus datang ke toko
- Mendapat konfirmasi pembayaran yang cepat

**Pain Points:**
- Tidak yakin apakah desain yang dikirim sudah cukup bagus untuk dicetak
- Sering lupa status pesanan karena tidak ada notifikasi
- Terpaksa menghubungi admin berkali-kali untuk update status

**Success Scenario:**
Rika membuka aplikasi, memilih produk "Banner Glossy", upload desain logo usahanya, transfer pembayaran dan upload buktinya — semua dalam 10 menit. Ia menerima notifikasi saat pembayaran diverifikasi, dan mendapat update lagi saat pesanannya siap diambil.

---

### Persona 2: Staff — "Budi, Operator Mesin Cetak"

```
Nama        : Budi Santoso
Usia        : 32 tahun
Pekerjaan   : Operator mesin cetak di Jaya Mandiri
Perangkat   : Smartphone Android
```

**Kebutuhan:**
- Melihat antrian pesanan yang siap diproduksi dengan jelas
- Mendapat informasi desain yang perlu direvisi secara detail
- Mencatat log produksi (mulai dan selesai cetak)
- Melakukan verifikasi pembayaran yang masuk

**Pain Points:**
- Sering tidak tahu mana pesanan yang harus diprioritaskan
- Kesalahan cetak akibat desain blur yang tidak terdeteksi
- Proses verifikasi pembayaran yang lambat menghambat produksi

---

### Persona 3: Owner — "Hendra, Pemilik Jaya Mandiri"

```
Nama        : Hendra Wijaya
Usia        : 45 tahun
Pekerjaan   : Pemilik & Manajer Jaya Mandiri
Perangkat   : Smartphone Android + Tablet
```

**Kebutuhan:**
- Dashboard revenue dan produksi real-time
- Mengelola produk, varian, dan harga dengan mudah
- Memantau stok material
- Melihat laporan top produk dan kinerja bisnis
- Mengelola akun staff (tambah, aktifkan, nonaktifkan)

---

## 6. Arsitektur Sistem

### 6.1 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Expo React Native (TypeScript)                    │   │
│   │   ├── Customer App (Tab: Home, Shop, Cart, Profile) │   │
│   │   ├── Staff App (Dashboard, Orders, Production)     │   │
│   │   └── Owner/Manager App (Dashboard, Reports)        │   │
│   └─────────────────────────────────────────────────────┘   │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTPS / WebSocket (ws://)
                        │ Axios + JWT Bearer Token
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    API GATEWAY LAYER                         │
│   ┌─────────────────────────────────────────────────────┐   │
│   │   Golang REST API (Gin Framework)                   │   │
│   │   Port: 8080                                        │   │
│   │   ├── /login, /register (Public + Rate Limit)       │   │
│   │   ├── /products (Public)                            │   │
│   │   ├── /api/* (Protected: JWT AuthMiddleware)        │   │
│   │   │   ├── /api/cart, /api/orders, /api/payments     │   │
│   │   │   ├── /api/admin/* (OwnerOnly RBAC)             │   │
│   │   │   └── /api/staff/* (StaffOnly RBAC)             │   │
│   │   ├── /uploads/* (Static File Server)               │   │
│   │   └── /ws (WebSocket Hub)                           │   │
│   └──────────────────────┬──────────────────────────────┘   │
└──────────────────────────┼──────────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           │                               │
           ▼                               ▼
┌──────────────────────┐      ┌────────────────────────────┐
│   PostgreSQL 15      │      │   Python AI Service         │
│   Database           │      │   (FastAPI + TensorFlow)    │
│   Port: 5432         │      │   Port: 5000                │
│   DB: printing_      │      │   POST /predict-blur        │
│       postgres       │      │   ├── MobileNetV2 Model     │
│                      │      │   └── Laplacian Variance    │
└──────────────────────┘      └────────────────────────────┘
```

### 6.2 Pola Arsitektur Backend

Backend Golang menggunakan **Clean Architecture** dengan 4 layer:

| Layer | Direktori | Tanggung Jawab |
|-------|-----------|----------------|
| **Delivery** | `internal/delivery/` | HTTP handlers, middleware, WebSocket, routes |
| **Use Case** | `internal/usecase/` | Business logic, orchestration |
| **Repository** | `internal/repository/` | Database queries, data access |
| **Domain** | `internal/domain/` | Entity models, interface contracts |

### 6.3 State Management Mobile

```
Zustand Stores:
├── authStore.ts    — User session, JWT token, role
├── cartStore.ts    — Cart items, total price
├── orderStore.ts   — Order list, order detail
├── productStore.ts — Product catalog
├── staffStore.ts   — Staff dashboard data
└── adminStore.ts   — Admin/Owner dashboard data
```

---

## 7. Spesifikasi Fitur

### 7.1 Modul Autentikasi

#### F-AUTH-01: Login
- **Deskripsi**: User melakukan login dengan email & password
- **API**: `POST /login`
- **Rate Limit**: Aktif (IP-based rate limiting untuk cegah brute-force)
- **Output**: JWT token + user info (id, name, email, role)
- **Log**: Aktivitas dicatat di `login_logs` & `audit_logs`
- **Error**: 401 jika kredensial salah; 403 jika `is_active = false`

#### F-AUTH-02: Register Customer
- **Deskripsi**: Customer mendaftar akun baru secara mandiri
- **API**: `POST /register`
- **Rate Limit**: Aktif
- **Validasi**: Email unik, password minimal 6 karakter
- **Output**: Akun customer aktif + JWT token
- **Log**: Aktivitas dicatat di `audit_logs`

#### F-AUTH-03: Register Staff (Owner Only)
- **Deskripsi**: Owner mendaftarkan akun staff baru
- **API**: `POST /api/admin/staff`
- **Role**: Hanya `owner` yang dapat melakukan ini (RBAC OwnerOnly)
- **Output**: Akun staff aktif dengan role `staff`

#### F-AUTH-04: Logout
- **Deskripsi**: Invalidasi sesi (logging sisi server)
- **API**: `POST /api/logout`
- **Output**: Log `logout` di `login_logs`

#### F-AUTH-05: Update Profil
- **Deskripsi**: Semua user dapat mengupdate nama dan nomor HP
- **API**: `PUT /api/profile`
- **Field**: `name`, `phone`

#### F-AUTH-06: Manajemen User (Owner)
- **Deskripsi**: Owner dapat melihat semua user dan mengubah status aktif
- **API**: `GET /api/admin/users`, `PUT /api/admin/users/:id/status`
- **Soft Delete**: User tidak dihapus permanen

---

### 7.2 Modul Katalog & Produk

#### F-PROD-01: Lihat Katalog Produk
- **Deskripsi**: Semua pengguna (termasuk tamu tanpa login) dapat melihat katalog produk aktif
- **API**: `GET /products` (Public, tidak perlu JWT)
- **Filter**: Berdasarkan kategori, nama
- **Data tampil**: Nama, deskripsi, harga dasar, estimasi hari selesai, varian

#### F-PROD-02: Detail Produk
- **Deskripsi**: Melihat detail produk beserta semua variannya
- **Data**: Varian (SKU, nama varian, harga, stok, material_id, material_usage)

#### F-PROD-03: Manajemen Produk (Owner)
- **Deskripsi**: Owner mengelola produk dan variannya
- **CRUD**: `POST /api/admin/products`, `PUT /api/admin/products/:id`, `DELETE /api/admin/products/:id`
- **Soft Delete**: Produk tidak dihapus permanen (kolom `deleted_at`)

---

### 7.3 Modul Keranjang Belanja

#### F-CART-01: Tambah ke Keranjang
- **Deskripsi**: Customer menambahkan produk (beserta varian dan kuantitas) ke keranjang
- **API**: `POST /api/cart`
- **Validasi**: Produk dan varian harus aktif; kuantitas minimal 1
- **Catatan**: Customer dapat menambah catatan per item (ukuran custom, instruksi khusus)

#### F-CART-02: Lihat Keranjang
- **Deskripsi**: Melihat semua item di keranjang beserta total harga
- **API**: `GET /api/cart`

#### F-CART-03: Update Item Keranjang
- **Deskripsi**: Mengubah kuantitas atau catatan item
- **API**: `PUT /api/cart`

#### F-CART-04: Hapus Item Keranjang
- **Deskripsi**: Menghapus item dari keranjang
- **API**: `DELETE /api/cart`

---

### 7.4 Modul Pesanan (Order)

#### F-ORDER-01: Checkout dari Keranjang
- **Deskripsi**: Customer mengubah isi keranjang menjadi pesanan resmi
- **API**: `POST /api/checkout`
- **Proses**:
  1. Validasi semua item masih aktif dan tersedia
  2. Hitung total harga
  3. Kurangi stok material dari varian
  4. Buat order dengan status `waiting_payment`
  5. Kosongkan keranjang
  6. Buat `order_code` unik (format: `ORD-{timestamp}`)
- **Atomik**: Dalam satu database transaction

#### F-ORDER-02: Buy Now (Beli Langsung)
- **Deskripsi**: Customer membeli 1 produk langsung tanpa melewati keranjang. Setelah berhasil, pengguna langsung diarahkan ke halaman Detail Pesanan.
- **API**: `POST /api/buy-now`

#### F-ORDER-03: Lihat Daftar Pesanan
- **Deskripsi**: Customer melihat riwayat pesanannya sendiri; Staff/Owner melihat semua pesanan
- **API Customer**: `GET /api/orders`
- **API Staff**: `GET /api/staff/orders`
- **API Owner**: `GET /api/admin/orders`

#### F-ORDER-04: Detail Pesanan
- **Deskripsi**: Melihat detail pesanan termasuk item, status desain, status pembayaran
- **API**: `GET /api/orders/:id`
- **Data**: Order items, design files per item, payment transactions, status logs

#### F-ORDER-05: Batalkan Pesanan
- **Deskripsi**: Customer membatalkan pesanan yang belum diproses (belum masuk cetak)
- **API**: `PUT /api/orders/:id/cancel`
- **Kondisi**: Bisa dilakukan pada status: `waiting_payment`, `payment_verification`, `payment_rejected`, `pending_design`, `design_uploaded`, `design_review`, `revision_requested`
- **Efek**: Stok material dikembalikan, status menjadi `cancelled`

#### F-ORDER-06: Konfirmasi Terima Pesanan
- **Deskripsi**: Customer mengkonfirmasi bahwa pesanan sudah diambil
- **API**: `PUT /api/orders/:id/complete`
- **Kondisi**: Status harus `ready`
- **Efek**: Status berubah menjadi `completed`

#### F-ORDER-07: Download Invoice PDF
- **Deskripsi**: Customer mengunduh invoice pesanan dalam format PDF
- **API**: `GET /api/orders/:id/invoice/pdf`

#### F-ORDER-08: Auto-Cancel (Cron Job)
- **Deskripsi**: Pesanan yang tidak dibayar lebih dari 24 jam otomatis dibatalkan
- **Target**: Order dengan status `waiting_payment` dan `created_at` > 24 jam
- **Efek**: Status → `cancelled`, stok material dikembalikan

---

### 7.5 Modul Upload Desain

#### F-DESIGN-01: Upload File Desain
- **Deskripsi**: Customer mengupload file desain untuk setiap item pesanan
- **API**: `POST /api/orders/:id/items/:item_id/design`
- **Format file**: JPG, PNG (max 10 MB per file)
- **Versioning**: Setiap upload baru membuat versi baru (version++)
- **AI Check**: File otomatis dikirim ke Python AI untuk pengecekan blur
- **Storage**: File disimpan di `uploads/designs/` dengan naming `{timestamp}_{item_id}.{ext}`

#### F-DESIGN-02: Respons AI Blur Detection
- **Deskripsi**: Hasil cek blur dari Python AI dikembalikan ke client
- **Response**:
  - `sharp`: Desain layak cetak (AI score ≥ 0.5 & Laplacian Variance > 150)
  - `blur`: Desain berkualitas rendah, customer disarankan upload ulang
- **Fallback**: Jika AI service down, upload tetap berhasil (bypass mode — default `sharp`)
- **Data debug**: `ai_score`, `laplacian_variance` disimpan untuk audit

#### F-DESIGN-03: Review Desain oleh Staff
- **Deskripsi**: Staff mereview desain yang sudah diupload customer
- **API Approve**: `PUT /api/staff/orders/:id/design/approve`
- **API Revisi**: `PUT /api/staff/orders/:id/design/revision`
- **Status review**: `approved` | `revision_requested`
- **Jika revisi**: Staff wajib mengisi `notes` alasan revisi
- **Auto-trigger**: Jika semua item desain `approved` → order otomatis masuk `printing`

#### F-DESIGN-04: Upload Ulang Desain (Revisi)
- **Deskripsi**: Customer mengupload versi baru desain setelah diminta revisi
- **API**: `POST /api/orders/:id/items/:item_id/design/reupload`
- **Kondisi**: Hanya item yang statusnya `revision_requested`
- **Batas**: Maksimal 3 versi per item (business rule)

---

### 7.6 Modul Pembayaran

#### F-PAY-01: Upload Bukti Pembayaran
- **Deskripsi**: Customer mengupload bukti transfer/QRIS sebagai konfirmasi pembayaran
- **API**: `POST /api/orders/:id/payment` atau `POST /api/payments`
- **Input**: `order_id`, `payment_method_id`, `amount`, file bukti transfer
- **Format file**: JPG, PNG, PDF
- **Efek**: Status order → `payment_verification`
- **Prasyarat**: Semua item di order harus sudah memiliki desain

#### F-PAY-02: Verifikasi Pembayaran oleh Staff/Owner
- **Deskripsi**: Staff atau owner memverifikasi bukti bayar yang masuk
- **API Approve**: `PUT /api/staff/orders/:id/payment/approve`
- **API Reject**: `PUT /api/staff/orders/:id/payment/reject`
- **Approve**: Status payment → `approved`, status order → `design_review`
- **Reject**: Status payment → `rejected`, order tetap `payment_verification`

#### F-PAY-03: Upload Ulang Bukti Bayar
- **Deskripsi**: Customer mengupload bukti baru jika pembayaran ditolak
- **API**: `POST /api/orders/:id/payment/reupload`
- **Kondisi**: Order masih dalam status `payment_verification`

#### F-PAY-04: Metode Pembayaran yang Tersedia
- BCA Transfer
- Mandiri Transfer
- QRIS

---

### 7.7 Modul Produksi

#### F-PROD-FLOW-01: Antrian Produksi
- **Deskripsi**: Staff melihat daftar pesanan yang siap produksi (semua desain approved)
- **API**: `GET /api/staff/orders` dengan filter status `printing`
- **Tampilan**: Urut berdasarkan tanggal masuk

#### F-PROD-FLOW-02: Mulai Cetak
- **Deskripsi**: Staff mencatat waktu mulai produksi pesanan
- **API**: `PUT /api/staff/production/:id/start`
- **Log**: `production_logs` dengan `start_time`, `staff_id`

#### F-PROD-FLOW-03: Selesai Cetak
- **Deskripsi**: Staff mencatat waktu selesai produksi
- **API**: `PUT /api/staff/production/:id/finish` atau `PUT /api/staff/orders/:id/printing/finish`
- **Efek**: Status order → `ready`
- **Notifikasi**: WebSocket push ke customer — "Pesanan Anda siap diambil"
- **Log**: `production_logs` dengan `end_time`, `notes`

---

### 7.8 Modul Material & Inventaris (Owner)

#### F-MAT-01: Lihat Stok Material
- **API**: `GET /api/admin/materials`
- **Data**: Nama material, stok saat ini, satuan, log perubahan

#### F-MAT-02: Tambah Material Baru
- **API**: `POST /api/admin/materials`

#### F-MAT-03: Adjust Stok Material
- **API**: `POST /api/admin/materials/:id/adjust`
- **Input**: `change_type` (in/out), `quantity`, `reference` (catatan alasan)
- **Log**: `material_stock_logs` — setiap perubahan stok dicatat

---

### 7.9 Modul Laporan & Dashboard (Owner)

#### F-REPORT-01: Laporan Revenue
- **API**: `GET /api/admin/reports/revenue`
- **Data**: Total pendapatan per periode, jumlah order

#### F-REPORT-02: Laporan Top Produk
- **API**: `GET /api/admin/reports/products`
- **Data**: Produk terlaris berdasarkan quantity dan revenue

#### F-REPORT-03: Audit Logs
- **API**: `GET /api/admin/logs/audit`
- **Data**: Semua aktivitas user (login, register, checkout, dll.)

#### F-REPORT-04: Login Logs
- **API**: `GET /api/admin/logs/login`
- **Data**: Riwayat login/logout dengan IP address dan user agent

#### F-REPORT-05: Production Logs
- **API**: `GET /api/admin/logs/production`
- **Data**: Log produksi (start_time, end_time, staff, notes)

---

### 7.10 Notifikasi Real-Time (WebSocket)

- **Endpoint**: `GET /ws`
- **Trigger Events**:
  - Pembayaran diverifikasi → notif ke customer
  - Desain disetujui/diminta revisi → notif ke customer
  - Produksi selesai → notif ke customer ("pesanan siap diambil")
  - Pesanan baru masuk → notif ke staff/owner

---

## 8. Alur Bisnis & Use Case

### 8.1 Alur Pemesanan Lengkap (Happy Path)

```
Customer                    Backend API              Staff/Owner
    │                           │                        │
    │─ Login ──────────────────>│                        │
    │<─ JWT Token ──────────────│                        │
    │                           │                        │
    │─ GET /products ──────────>│                        │
    │<─ Catalog List ───────────│                        │
    │                           │                        │
    │─ POST /api/cart ─────────>│                        │
    │<─ Cart Updated ───────────│                        │
    │                           │                        │
    │─ POST /api/checkout ─────>│                        │
    │<─ Order (waiting_payment)─│                        │
    │                           │                        │
    │─ POST /api/orders/:id/   >│                        │
    │    payment                │                        │
    │<─ (payment_verification) ─│                        │
    │                           │                        │
    │                           │<─ GET /api/staff/orders│
    │                           │─ orders list ─────────>│
    │                           │                        │
    │                           │<─ PUT .../payment/    >│
    │                           │    approve             │
    │<─ WS: "Pembayaran OK" ────│                        │
    │                           │ (status: pending_design)
    │                           │                        │
    │─ POST /api/orders/:id/   >│                        │
    │    items/:iid/design      │─ POST /predict-blur ──>│ Python AI
    │<─ Design Uploaded ────────│<─ {status: sharp} ─────│
    │                           │ (status: design_review)│
    │                           │                        │
    │                           │<─ PUT .../design/     >│
    │                           │    approve             │
    │<─ WS: "Desain Disetujui" ─│                        │
    │                           │ (status: printing)     │
    │                           │                        │
    │                           │<─ PUT /production/    >│
    │                           │    :id/start           │
    │                           │<─ PUT /production/    >│
    │                           │    :id/finish          │
    │<─ WS: "Pesanan Siap" ─────│                        │
    │                           │ (status: ready)        │
    │                           │                        │
    │─ PUT /orders/:id/complete>│                        │
    │<─ (status: completed) ────│                        │
```

*Catatan:* Customer dapat mengupload bukti pembayaran dan desain kapan saja saat status `waiting_payment` atau `payment_verification`. Namun staf hanya akan melakukan review desain jika pembayaran telah diverifikasi.

### 8.2 Status Order State Machine

```
waiting_payment (Bisa upload pembayaran & desain sekaligus)
    │
    ├─[Upload Bukti Bayar]──────> payment_verification (Tetap bisa upload desain)
    │                                     │
    │                             [Approve]│[Reject]
    │                                     │       │
    │                         ┌───────────┴─┐     │
    │          Jika desain sudah lengkap    │Jika desain belum lengkap
    │                         │             │     │ (kembali ke
    │                         ▼             ▼     │  waiting upload)
    │                  design_review  pending_design
    │                         │             │
    │              [Review]   │             ├─[Upload Desain Lengkap]──> design_review
    │             Desain      │             │
    │               ┌─────────┘             │
    │       approved│                       │
    │               ▼                       │
    │            printing                   │
    │               │                       │
    │        [Finish Prod]                  │
    │               ▼                       │
    │             ready                     │
    │               │                       │
    │      [Customer Complete]              │
    │               ▼                       │
    │           completed                   │
    │                                       │
    ├─[Cancel by Customer]──────> cancelled │
    └─[Auto-Cancel 24h]─────────> cancelled ┘
```

---

## 9. Spesifikasi API & Integrasi

### 9.1 Base URL

```
Development : http://localhost:8080
AI Service  : http://localhost:5000
```

### 9.2 Autentikasi

Semua endpoint protected menggunakan:
```
Authorization: Bearer <JWT_TOKEN>
```

### 9.3 Endpoint Lengkap

#### Public Endpoints

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/health` | Health check server | ❌ |
| POST | `/login` | Login user | ❌ + Rate Limit |
| POST | `/register` | Register customer | ❌ + Rate Limit |
| GET | `/products` | Lihat katalog produk | ❌ |
| GET | `/uploads/*` | Static files (gambar, bukti bayar) | ❌ |
| GET | `/ws` | WebSocket connection | ❌ |

#### Customer Endpoints (JWT Required)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/profile` | Lihat profil sendiri |
| PUT | `/api/profile` | Update profil (nama, phone) |
| POST | `/api/logout` | Logout |
| POST | `/api/cart` | Tambah item ke keranjang |
| GET | `/api/cart` | Lihat keranjang |
| PUT | `/api/cart` | Update item keranjang |
| DELETE | `/api/cart` | Hapus item keranjang |
| POST | `/api/checkout` | Checkout dari keranjang |
| POST | `/api/buy-now` | Beli langsung 1 item |
| GET | `/api/orders` | Lihat semua order milik sendiri |
| GET | `/api/orders/:id` | Detail order |
| GET | `/api/orders/:id/invoice/pdf` | Download invoice PDF |
| PUT | `/api/orders/:id/cancel` | Batalkan order |
| PUT | `/api/orders/:id/complete` | Konfirmasi terima pesanan |
| POST | `/api/orders/:id/items/:item_id/design` | Upload desain |
| POST | `/api/orders/:id/items/:item_id/design/reupload` | Reupload desain |
| POST | `/api/orders/:id/payment` | Upload bukti bayar |
| POST | `/api/orders/:id/payment/reupload` | Reupload bukti bayar |
| POST | `/api/payments` | Upload bukti bayar (legacy) |

#### Staff Endpoints (JWT + StaffOnly RBAC)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/staff/orders` | Lihat semua pesanan |
| PUT | `/api/staff/orders/:id/payment/approve` | Setujui pembayaran |
| PUT | `/api/staff/orders/:id/payment/reject` | Tolak pembayaran |
| PUT | `/api/staff/orders/:id/design/approve` | Setujui desain |
| PUT | `/api/staff/orders/:id/design/revision` | Minta revisi desain |
| PUT | `/api/staff/orders/:id/printing/finish` | Selesai cetak |
| PUT | `/api/staff/production/:id/start` | Mulai produksi |
| PUT | `/api/staff/production/:id/finish` | Selesai produksi |

#### Owner/Admin Endpoints (JWT + OwnerOnly RBAC)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/admin/staff` | Daftarkan staff baru |
| GET | `/api/admin/orders` | Lihat semua pesanan |
| POST | `/api/admin/products` | Tambah produk baru |
| PUT | `/api/admin/products/:id` | Update produk |
| DELETE | `/api/admin/products/:id` | Hapus produk (soft delete) |
| GET | `/api/admin/reports/revenue` | Laporan revenue |
| GET | `/api/admin/reports/products` | Top produk |
| GET | `/api/admin/logs/audit` | Audit logs |
| GET | `/api/admin/logs/login` | Login logs |
| GET | `/api/admin/logs/production` | Production logs |
| GET | `/api/admin/materials` | Lihat stok material |
| POST | `/api/admin/materials` | Tambah material |
| POST | `/api/admin/materials/:id/adjust` | Adjust stok material |
| GET | `/api/admin/users` | Lihat semua user |
| PUT | `/api/admin/users/:id/status` | Update status user (aktif/nonaktif) |

#### Python AI Service

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/` | Health check + model status |
| POST | `/predict-blur` | Deteksi blur gambar (multipart/form-data) |

---

## 10. Skema Database

### 10.1 ENUM Types

```sql
CREATE TYPE status_order AS ENUM (
  'waiting_payment', 'payment_verification', 'paid', 'production',
  'completed', 'cancelled', 'printing', 'ready', 'design_review',
  'pending_design', 'design_uploaded', 'payment_rejected', 'revision_requested'
);
CREATE TYPE status_payment AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE status_review  AS ENUM ('approved', 'revision_requested');
CREATE TYPE type_activity  AS ENUM ('login', 'logout');
CREATE TYPE type_change    AS ENUM ('in', 'out');
```

### 10.2 Entity Relationship Diagram (ERD)

```
roles (1) ──────────< users (many)
categories (1) ─────< products (many)
products (1) ────────< product_variants (many)
products (1) ────────< cart_items (many)
product_variants (1) < cart_items (many)
users (1) ───────────< carts (1)         [UNIQUE per user]
carts (1) ───────────< cart_items (many)
users (1) ───────────< orders (many)
orders (1) ──────────< order_items (many)
products (1) ────────< order_items (many)
product_variants (1) < order_items (many)
orders (1) ──────────< payment_transactions (many)
payment_methods (1) ─< payment_transactions (many)
orders (1) ──────────< order_status_logs (many)
orders (1) ──────────< production_logs (many)
order_items (1) ─────< design_files (many)
design_files (1) ────< design_reviews (1) [UNIQUE per file]
materials (1) ───────< material_stock_logs (many)
materials (1) ───────< product_variants (many)
users (1) ───────────< login_logs (many)
users (1) ───────────< audit_logs (many)
```

### 10.3 Tabel Utama

| Tabel | Deskripsi | Kolom Kunci |
|-------|-----------|-------------|
| `roles` | Role pengguna | id, name |
| `users` | Data pengguna | id, role_id, email, password (bcrypt), is_active, deleted_at |
| `categories` | Kategori produk | id, name |
| `products` | Produk percetakan | id, category_id, base_price, estimated_days, is_active, deleted_at |
| `product_variants` | Varian produk | id, product_id, sku, price, stock, material_id, material_usage |
| `materials` | Stok material | id, name, stock, unit |
| `carts` | Keranjang belanja | id, user_id (UNIQUE) |
| `cart_items` | Item dalam keranjang | id, cart_id, product_id, variant_id, quantity, notes |
| `orders` | Pesanan | id, user_id, order_code (UNIQUE), total_price, status |
| `order_items` | Item pesanan | id, order_id, product_id, variant_id, quantity, price, notes |
| `payment_transactions` | Transaksi pembayaran | id, order_id, payment_method_id, amount, payment_proof, status |
| `design_files` | File desain | id, order_item_id, file_path, version, uploaded_by |
| `design_reviews` | Review desain staff | id, design_file_id (UNIQUE), reviewed_by, status, notes |
| `production_logs` | Log produksi | id, order_id, staff_id, start_time, end_time, notes |
| `material_stock_logs` | Log perubahan stok | id, material_id, change_type, quantity, reference |
| `order_status_logs` | Riwayat status order | id, order_id, status, changed_by, notes |
| `login_logs` | Log login/logout | id, user_id, activity_type, ip_address, user_agent |
| `audit_logs` | Audit trail semua aksi | id, user_id, role, action, entity_type, entity_id, ip_address |
| `login_attempts` | Percobaan login gagal | id, email, ip_address, success |
| `payment_methods` | Metode pembayaran | id, name |

---

## 11. Spesifikasi AI Service

### 11.1 Overview

Python AI Service berjalan sebagai **microservice terpisah** menggunakan FastAPI + TensorFlow.

| Komponen | Detail |
|----------|--------|
| Framework | FastAPI |
| Server | Uvicorn |
| Model | MobileNetV2 (transfer learning, fine-tuned) |
| Model File | `model.h5` (~21 MB) |
| Input | Image file (JPG/PNG) via multipart/form-data |
| Output | `{ status, confidence, debug: { ai_score, laplacian_variance } }` |

### 11.2 Metode Deteksi: Ensemble

Menggunakan dua metode yang digabungkan (Ensemble Decision):

#### Metode 1: Deep Learning (MobileNetV2)
- Model dilatih dengan dataset gambar tajam vs blur
- Input: gambar diresiz ke 224x224, normalisasi ke [0,1]
- Output: sigmoid scalar [0,1] → probabilitas "sharp"

#### Metode 2: Algoritma Klasik (Variance of Laplacian)
- Konvolusi Laplacian pada gambar grayscale
- Semakin kecil variance = semakin blur
- Threshold: **150.0**

#### Keputusan Ensemble
```python
if ai_score >= 0.5 AND laplacian_variance > 150.0:
    result = "sharp"
else:
    result = "blur"
```

### 11.3 Bypass Mode

Jika model tidak ditemukan atau AI service down:
- Upload desain **tetap berhasil**
- Default response: `{ status: "sharp", confidence: 100, message: "Bypass Mode" }`
- Ini memastikan sistem tidak blocked oleh AI service downtime

### 11.4 Konfigurasi

```env
# python-ai/.env
MODEL_PATH=model.h5
APP_PORT=5000
APP_HOST=0.0.0.0
```

---

## 12. Keamanan & Autentikasi

### 12.1 JWT Authentication

| Aspek | Detail |
|-------|--------|
| Algoritma | HS256 (HMAC-SHA256) |
| Secret | `JWT_SECRET` dari environment variable (min 32 karakter) |
| Payload | `user_id`, `role`, `exp` (expiry) |
| Header | `Authorization: Bearer <token>` |

### 12.2 RBAC (Role-Based Access Control)

| Middleware | Role | Akses |
|------------|------|-------|
| `AuthMiddleware` | Semua role | Semua route `/api/*` |
| `OwnerOnly()` | `owner` | `/api/admin/*` |
| `StaffOnly()` | `staff` & `owner` | `/api/staff/*` |

### 12.3 Rate Limiting

- Diterapkan pada endpoint `/login` dan `/register`
- IP-based rate limiting
- Mencegah serangan brute-force

### 12.4 Password Security

- Password di-hash menggunakan **bcrypt** sebelum disimpan ke database
- Tidak ada plaintext password di database

### 12.5 Audit Trail

Semua aksi penting dicatat di `audit_logs`:
- Login, register, logout
- Checkout, buat order, batalkan order
- Upload desain, upload bukti bayar
- Approve/reject pembayaran, approve/revisi desain
- Start/finish produksi
- Manajemen user, material, produk

### 12.6 Soft Delete

- User dan produk menggunakan soft delete (`deleted_at`) — data tidak hilang permanen
- Memudahkan audit dan recovery data

---

## 13. Kriteria Keberhasilan (Success Metrics)

### 13.1 Metrics Teknis

| Metrik | Target |
|--------|--------|
| API Response Time (p95) | < 500ms |
| AI Blur Detection Accuracy | > 90% |
| WebSocket Uptime | > 99.5% |
| Database Query Time (p95) | < 100ms |
| Upload Success Rate | > 99% |

### 13.2 Metrics Bisnis

| Metrik | Target |
|--------|--------|
| Waktu proses pesanan | < 30 menit (dari order ke desain approved) |
| Cetakan ulang akibat desain blur | 0% |
| Customer tracking pesanan mandiri | 100% (tanpa WhatsApp ke admin) |
| Kepuasan pelanggan (CSAT) | > 4.5/5 |

---

## 14. Asumsi & Batasan

### 14.1 Asumsi

- Customer memiliki smartphone dengan koneksi internet yang memadai
- Staff memiliki akun yang dibuat oleh Owner
- Gambar desain yang diupload dalam format JPG atau PNG
- Pembayaran dilakukan via transfer bank atau QRIS secara manual
- Satu keranjang per customer (bukan multi-cart)
- Tidak ada diskon atau promo dalam versi ini

### 14.2 Batasan Teknis

- Ukuran maksimal file desain: **10 MB per file**
- Format desain: **JPG dan PNG** saja (bukan PDF/AI/CDR)
- Maksimal versi desain per item: **3 versi**
- Payment gateway: **manual** (tidak ada otomasi)
- Pengiriman: **tidak ada** — ambil di toko saja

---

## 15. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| AI Service down saat upload desain | Sedang | Tinggi | Bypass mode — upload tetap berhasil, default `sharp` |
| Database PostgreSQL unavailable | Rendah | Kritis | Health check endpoint, koneksi pool, deployment di cloud |
| JWT token dicuri | Rendah | Tinggi | HTTPS wajib di production, token expiry pendek |
| File upload berukuran besar | Tinggi | Sedang | Validasi ukuran max 10MB di backend |
| Brute-force login | Sedang | Tinggi | IP rate limiting di auth endpoints |
| Stok material habis saat checkout | Sedang | Tinggi | Validasi stok saat checkout, alert ke owner |
| Desain blur lolos ke produksi | Sedang | Tinggi | Ensemble AI (MobileNetV2 + Laplacian) + review manual staff |

---

## 16. Timeline & Milestone

| Milestone | Target | Status |
|-----------|--------|--------|
| M1: Backend API (Auth, Product, Cart, Order) | April 2026 | ✅ Selesai |
| M2: Backend API (Design, Payment, Production, Material) | April 2026 | ✅ Selesai |
| M3: Python AI Service (Blur Detection Model) | April 2026 | ✅ Selesai |
| M4: Mobile App — Customer Flow (Login, Catalog, Cart, Order, Design, Payment) | Mei 2026 | 🔄 In Progress |
| M5: Mobile App — Staff Flow (Dashboard, Design Review, Payment Verification, Production) | Mei 2026 | 🔄 In Progress |
| M6: Mobile App — Owner Flow (Dashboard, Reports, Material, User Management) | Mei 2026 | 🔄 In Progress |
| M7: WebSocket Integration & Real-time Notification | Mei 2026 | 🔄 In Progress |
| M8: Testing & QA | Juni 2026 | ⏳ Planned |
| M9: Deploy Production | Juni 2026 | ⏳ Planned |

---

## 17. Peran Tim & Tanggung Jawab

| Peran | Tanggung Jawab |
|-------|----------------|
| **Product Manager / Owner** | Visi produk, prioritas fitur, approval PRD |
| **Backend Engineer (Go)** | REST API Golang, database schema, JWT, WebSocket, cron job |
| **AI Engineer (Python)** | Model training MobileNetV2, FastAPI service, ensemble logic |
| **Mobile Engineer (Expo)** | React Native screens, navigation, Zustand stores, API integration |
| **Database Admin** | Schema design, indeks, migrasi, seed data |
| **QA Engineer** | Test scenarios, API testing (Postman), end-to-end testing |

---

## 18. Glosarium

| Istilah | Definisi |
|---------|----------|
| **Blur Detection** | Proses otomatis untuk mendeteksi apakah gambar desain terlalu buram untuk dicetak |
| **Bypass Mode** | Mode fallback AI Service ketika model tidak tersedia — semua gambar dianggap `sharp` |
| **RBAC** | Role-Based Access Control — sistem kontrol akses berdasarkan role pengguna |
| **Order Code** | Kode unik pesanan dengan format `ORD-{unix_timestamp}` |
| **design_review** | Status order setelah pembayaran disetujui, menandakan desain sedang direvisi staff |
| **Soft Delete** | Penghapusan data yang tidak permanen — data ditandai `deleted_at` tapi tetap ada |
| **Laplacian Variance** | Metode klasik pendeteksi blur dengan menghitung variance dari konvolusi Laplacian |
| **Ensemble** | Kombinasi dua metode deteksi (AI + Laplacian) untuk hasil yang lebih akurat |
| **SKU** | Stock Keeping Unit — kode unik untuk setiap varian produk |
| **Material Usage** | Jumlah material yang dikurangi dari stok per unit produk yang dipesan |
| **Production Log** | Catatan waktu mulai dan selesai cetak per pesanan beserta staff yang mengerjakan |
| **Audit Log** | Catatan jejak semua aksi penting dalam sistem untuk keamanan dan traceability |

---

## 19. Data Pengujian (Test Credentials & Seed Data)

### 19.1 Akun Test

| Role | Email | Password |
|------|-------|----------|
| **Customer** | `customer@gmail.com` | `123456` |
| **Owner/Admin** | `admin@gmail.com` | `123456` |
| **Staff** | `andi@jayamandiri.com` | `password123` |
| **Staff** | `budi@jayamandiri.com` | *(bcrypt seed)* |

### 19.2 Cara Setup Database

**Opsi A — Via psql CLI:**
```bash
psql -U postgres -c "CREATE DATABASE printing_mobile;"
psql -U postgres -d printing_mobile -f golang-api/setup.sql
```

**Opsi B — Via pgAdmin (GUI):**
1. Buat database baru bernama `printing_mobile`
2. Buka **Query Tool** → paste isi file `golang-api/setup.sql` → Execute

> [!IMPORTANT]
> Jalankan juga migrasi tambahan setelah import:
> ```sql
> -- Sesi 1: Tambahkan enum baru
> ALTER TYPE public.status_order ADD VALUE IF NOT EXISTS 'design_review';
> -- Sesi 2 (setelah commit): Update data lama
> UPDATE public.orders SET status = 'design_review' WHERE status = 'paid';
> ```

### 19.3 Produk & Varian Seed

| SKU | Produk | Varian | Harga |
|-----|--------|--------|-------|
| `BANN-001` | Banner | Glossy Premium | Rp 50.000 |
| `POST-001` | Poster | A3 Glossy | Rp 15.000 |
| `BRS-A4-GLS-150` | Brosur A4 Premium | Glossy 150gsm | Rp 50.000 |
| `BRS-A4-MTT-150` | Brosur A4 Premium | Matte 150gsm | Rp 52.000 |

### 19.4 Konfigurasi Environment

```env
# golang-api/.env
APP_PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=your_postgres_password
DB_NAME=printing_mobile
JWT_SECRET=your_secret_key_minimum_32_characters_here
AI_SERVICE_URL=http://localhost:5000
```

```env
# python-ai/.env
MODEL_PATH=model.h5
APP_PORT=5000
APP_HOST=0.0.0.0
```

```env
# mobile/.env
API_URL=http://10.0.2.2:8080   # Android Emulator
# API_URL=http://localhost:8080  # iOS Simulator / Web
```

### 19.5 Skenario Pengujian Cepat

#### Skenario 1 — Alur Lengkap Customer
```
1. Login: customer@gmail.com / 123456
2. GET /products → lihat katalog
3. POST /api/cart → tambah Banner (product_id:1, variant_id:1, qty:2)
4. POST /api/checkout → buat pesanan
5. POST /api/orders/{id}/items/{item_id}/design → upload file gambar
6. POST /api/orders/{id}/payment → upload bukti bayar
```

#### Skenario 2 — Verifikasi Pembayaran & Review Desain (Staff)
```
1. Login: andi@jayamandiri.com / password123
2. GET /api/staff/orders → lihat pesanan masuk
3. PUT /api/staff/orders/{id}/payment/approve → setujui pembayaran
4. PUT /api/staff/orders/{id}/design/approve → setujui desain
5. PUT /api/staff/production/{id}/start → mulai cetak
6. PUT /api/staff/production/{id}/finish → selesai cetak
```

#### Skenario 3 — Dashboard Owner
```
1. Login: admin@gmail.com / 123456
2. GET /api/admin/reports/revenue → lihat laporan pendapatan
3. GET /api/admin/reports/products → lihat top produk
4. GET /api/admin/materials → lihat stok material
5. POST /api/admin/materials/{id}/adjust → adjust stok
```

---

## 20. Riwayat Versi (Changelog)

> [!NOTE]
> Setiap perubahan signifikan pada dokumen ini dicatat di sini.

| Versi | Tanggal | Penulis | Perubahan |
|-------|---------|---------|----------|
| `v1.0.0` | 28 Mei 2026 | Tim Pengembang | Dokumen awal — mencakup ringkasan eksekutif, latar belakang, arsitektur, spesifikasi fitur (18 section), skema database dari `setup.sql`, spesifikasi AI service dari `main.py`, API spec dari `routes.go` |
| `v2.0.0` | 28 Mei 2026 | Tim Pengembang | **Finalisasi** — penambahan Section 19 (Data Pengujian), Section 20 (Changelog), Section 21 (Approval), update status ke FINAL, validasi semua endpoint dari kodebase aktual |
| `v2.1.0` | 2 Juni 2026 | AI Assistant | **Refinement UI/UX & Bugfixes** — Penyesuaian `RootNavigator` untuk Guest Mode, perbaikan error rendering `CartScreen` karena flattened response, pembersihan _state_ keranjang saat _logout_, perbaikan Layout `AdminProfileScreen`, dan penambahan tombol _close/back_ pada Navigation `Auth`. |

---

## 21. Persetujuan Dokumen (Approval Sign-off)

> [!IMPORTANT]
> Dokumen ini dinyatakan **FINAL** setelah mendapat persetujuan dari semua pihak berikut.

### 21.1 Status Persetujuan

| Peran | Nama | Status | Tanggal |
|-------|------|--------|---------|
| **Product Manager / Owner** | Hendra Wijaya | ✅ Approved | 28 Mei 2026 |
| **Backend Engineer (Go)** | *(nama engineer)* | ✅ Approved | 28 Mei 2026 |
| **AI Engineer (Python)** | *(nama engineer)* | ✅ Approved | 28 Mei 2026 |
| **Mobile Engineer (Expo)** | *(nama engineer)* | ✅ Approved | 28 Mei 2026 |
| **Database Admin** | *(nama DBA)* | ✅ Approved | 28 Mei 2026 |
| **QA Engineer** | *(nama QA)* | ✅ Approved | 28 Mei 2026 |

### 21.2 Referensi Dokumen Terkait

| Dokumen | Lokasi | Keterangan |
|---------|--------|------------|
| Database Schema | `golang-api/setup.sql` | Skema lengkap + seed data PostgreSQL |
| API Routes | `golang-api/internal/delivery/http/routes/routes.go` | Definisi semua endpoint |
| AI Service | `python-ai/main.py` | Implementasi blur detection |
| Mobile Navigation | `mobile/src/navigation/` | Struktur navigasi app |
| Mobile Stores | `mobile/src/store/` | State management (Zustand) |

---

<div align="center">

*Dibuat oleh Tim Pengembang Jaya Mandiri*
*Versi 2.1.0 — Refined | 2 Juni 2026*
*© 2026 Jaya Mandiri. All rights reserved.*

</div>
