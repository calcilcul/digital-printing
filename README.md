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
├── python-ai/           # 🧠 Python AI Microservice (FastAPI + TensorFlow)
│   ├── main.py          # AI logic (MobileNetV2 + Laplacian Variance)
│   ├── requirements.txt # Dependencies
│   └── .env             # Konfigurasi
│
└── frontend/            # 🌐 Web Dashboard (React + Vite) — referensi porting
```

---

## 🚀 Cara Menjalankan

### Persiapan Prasyarat
- **Node.js** (v18+) & **npm**
- **Golang** (v1.20+)
- **Python 3.12** (Penting: TensorFlow saat ini paling stabil di Python 3.12, jangan gunakan 3.13/3.14)
- **PostgreSQL** (v15+)

### AI Microservice (Python)
```bash
cd python-ai
python -m venv venv
.\venv\Scripts\activate   # Windows
# source venv/bin/activate # Mac/Linux
pip install -r requirements.txt
python main.py
# API berjalan di http://localhost:5000
```

### Backend (Golang API)
```bash
cd golang-api
go run ./cmd/server/main.go
# API berjalan di http://localhost:8000
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
| Backend | Golang (Gin Framework) |
| AI Microservice | Python (FastAPI + TensorFlow) |
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
