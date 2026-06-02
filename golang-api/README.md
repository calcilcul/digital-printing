# ⚙️ Golang API - Jaya Mandiri Digital Printing

Backend utama (Core API) yang menyediakan seluruh layanan data dan autentikasi untuk aplikasi Mobile Digital Printing.

## Arsitektur
Proyek ini mengadopsi pola arsitektur **Clean Architecture**, yang memisahkan aplikasi ke dalam beberapa layer (Delivery/Handler, Usecase, Repository) untuk memudahkan pemeliharaan dan pengujian.

## Teknologi Utama
- **Bahasa**: Golang (Go) v1.20+
- **Framework Web**: Gin (HTTP Router & Middleware)
- **Database**: PostgreSQL (Driver `pq` & `database/sql`)
- **Autentikasi**: JSON Web Token (JWT) + Bcrypt (Hashing)
- **Manajemen File**: Local Storage (folder `uploads/`)

## Cara Menjalankan Server

1. **Siapkan Database**:
   - Buat database `digital_printing` di PostgreSQL Anda.
   - Eksekusi (import) skrip `setup.sql` yang ada di folder ini untuk membuat semua tabel dan mengisi *seed data*.

2. **Jalankan Aplikasi**:
   ```bash
   # Unduh dependensi
   go mod tidy

   # Jalankan server
   go run ./cmd/server/main.go
   ```
   *Secara default, server akan mendengarkan di port `8080` (Atau `8000` tergantung ketersediaan environment variable).*

## Layanan & Modul API (Routes)
Berikut daftar endpoint utama yang tersedia:
- `POST /api/register` & `POST /api/login` (Auth)
- `GET /api/profile` (User Profile)
- `GET /api/products` & `GET /api/products/:id` (Katalog)
- `GET/POST/PUT/DELETE /api/cart` (Keranjang Belanja)
- `POST /api/checkout` (Checkout Pesanan)
- `POST /api/orders/:id/payment` (Upload Pembayaran)
- Modul Admin: `/api/admin/orders`, `/api/admin/reports/...`
- Modul Staff: `/api/staff/orders/...`, `/api/staff/production/...`

---
*Versi 2.1.0 - Bagian dari ekosistem Jaya Mandiri Digital Printing.*
