# 🖨️ Jaya Mandiri Digital Printing — Sistem Manajemen Terpadu

Aplikasi platform terpadu untuk layanan digital printing, dibangun dengan arsitektur modern berbasis **React Native (Expo)**, **Golang REST API**, **PostgreSQL**, dan **Python AI Microservice**.

![Version](https://img.shields.io/badge/version-v2.1.0-blue)
![Status](https://img.shields.io/badge/status-production_ready-success)

---

## 📁 Struktur Proyek

```
digital-printing/
├── mobile/              # 📱 Frontend React Native (Expo)
│   ├── src/
│   │   ├── screens/     # Halaman aplikasi (Customer, Staff, Admin)
│   │   ├── store/       # State management global (Zustand)
│   │   └── navigation/  # Role-based Stack & Tab navigators
│   └── package.json
│
├── golang-api/          # ⚙️ Backend Core REST API (Go + PostgreSQL)
│   ├── internal/        # Arsitektur Clean (Handler, Usecase, Repository)
│   ├── setup.sql        # Skema & Seed Data Database lengkap
│   └── main.go          # Entry point server (Port: 8080/8000)
│
└── python-ai/           # 🧠 Python AI Microservice (FastAPI)
    ├── main.py          # Modul deteksi ketajaman desain & blur
    └── requirements.txt
```

---

## 🚀 Fitur Unggulan (Berdasarkan Role)

### 1. Customer (Pelanggan)
- 🛒 **Katalog & Keranjang:** Jelajahi katalog produk, tambah keranjang dinamis.
- 🖼️ **Validasi AI Desain:** Cek otomatis apakah gambar resolusinya bagus/pecah.
- 💳 **Checkout & Upload Bayar:** Proses pemesanan transparan dengan unggah resi.

### 2. Staff (Produksi)
- 📋 **Manajemen Antrean:** Konfirmasi pesanan, verifikasi pembayaran.
- 🏭 **Update Status Produksi:** Real-time track status cetak dari "Printing" ke "Ready".

### 3. Owner/Admin (Manajemen)
- 📊 **Dashboard & Laporan:** Analisa omset, top produk, dan notifikasi stok tipis.
- 📝 **Log Sistem:** Audit trail, history login user, log riwayat produksi lengkap.
- 👥 **Kelola Data Induk:** Manajemen user, materi bahan cetak, varian, dan harga.

---

## 💻 Cara Menjalankan

### Persiapan Prasyarat
- **Node.js** (v18+) & **npm**
- **Golang** (v1.20+)
- **Python 3.12** (AI microservice)
- **PostgreSQL** (v15+) dengan DB `digital_printing`

### 1. Jalankan Database (PostgreSQL)
Import file `golang-api/setup.sql` ke dalam database lokal Anda. 
File ini sudah berisi DDL dan *Seed Data* awal.

### 2. Jalankan Backend (Golang API)
```bash
cd golang-api
go mod tidy
go run ./cmd/server/main.go
# API akan berjalan di http://localhost:8000 atau 8080
```

### 3. Jalankan AI Microservice (Python)
```bash
cd python-ai
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
python main.py
# API berjalan di http://localhost:5000
```

### 4. Jalankan Aplikasi Mobile (Expo)
```bash
cd mobile
npm install
npx expo start
# Buka di Emulator Android / Web (tekan 'w') / App Expo Go di HP
```

---

## 🔒 Riwayat Versi Utama
- **v1.0.0**: Inisiasi dokumen, pembuatan kerangka API dasar.
- **v2.0.0**: Implementasi penuh seluruh Role (Customer, Staff, Admin), integrasi API.
- **v2.1.0**: Penyempurnaan final (*production release*), *Guest Mode* diizinkan, *UI Polish*, pembersihan *bug* keranjang (flattened response), layout perbaikan profil, hapus skrip pengujian sampah.

Dibuat dengan ❤️ oleh Tim Jaya Mandiri.
