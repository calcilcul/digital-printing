# 🖨️ Digital Printing — Mobile App

Aplikasi mobile untuk layanan digital printing, dibangun dengan **React Native (Expo)** dan **Golang REST API** dengan database **PostgreSQL**.

---

## 📁 Struktur Proyek

```
digital-printing/
├── mobile/              # 📱 React Native (Expo) — Mobile App
│   ├── src/
│   │   ├── screens/     # Halaman (Login, Home, Cart, Payment, dll.)
│   │   ├── components/  # Komponen reusable
│   │   ├── store/       # State management (Zustand)
│   │   ├── hooks/       # Custom hooks
│   │   ├── navigation/  # Konfigurasi navigasi
│   │   ├── api/         # Axios config & API calls
│   │   └── utils/       # Helper functions
│   ├── assets/          # Gambar, ikon, splash screen
│   ├── App.tsx
│   └── package.json
│
├── golang-api/          # ⚙️ Backend REST API (Go + PostgreSQL)
│   ├── cmd/             # Entry point
│   ├── configs/         # Konfigurasi DB, JWT, dll.
│   ├── internal/        # Handler, middleware, repository
│   ├── uploads/         # File upload storage
│   ├── setup.sql        # Database schema
│   └── go.mod
│
└── frontend/            # 🌐 Web Dashboard (React + Vite) — referensi porting
```

---

## 🚀 Cara Menjalankan

### Backend (Golang API)
```bash
cd golang-api
go run ./cmd/main.go
# API berjalan di http://localhost:8080
```

### Mobile (Expo)
```bash
cd mobile
npx expo start
# Scan QR dengan Expo Go app atau jalankan di emulator
```

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Mobile | React Native + Expo (TypeScript) |
| Backend | Golang (Gin/Fiber) |
| Database | PostgreSQL |
| Auth | JWT |
| HTTP Client | Axios + AsyncStorage |

---

## 👥 Role Pengguna

| Role | Akses |
|---|---|
| **Customer** | Browse produk, cart, checkout, upload bukti bayar, lihat order |
| **Staff** | Monitor produksi, review desain |
| **Owner/Manager** | Dashboard, laporan, manajemen produk |
