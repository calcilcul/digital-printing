# 🤖 Digital Printing AI Microservice

Microservice berbasis **FastAPI** dan **TensorFlow/OpenCV** untuk melakukan deteksi kualitas gambar (Blur Detection) secara otomatis pada saat pelanggan mengunggah desain cetak.

## Fitur Utama
- 🔍 **Laplacian Variance Detection**: Mengukur ketajaman tepian pixel dengan OpenCV (algoritma *variance of the Laplacian*) untuk mendeteksi *blur* secara matematis.
- ⚡ **FastAPI Integration**: Endpoint REST API berkinerja tinggi yang siap digunakan (plug-and-play) oleh backend Golang.
- 🛡️ **Bypass & Fallback Mode**: Dirancang agar sistem pemesanan (*order flow*) tidak rusak jika terjadi kegagalan deteksi. Mode default adalah `sharp` jika gambar tidak dapat dibaca.

## Persyaratan
- Python 3.12+ (Rekomendasi)
- OpenCV Python, FastAPI, Uvicorn, Python-Multipart

## Instalasi & Menjalankan

1. Masuk ke direktori:
   ```bash
   cd python-ai
   ```

2. Buat & Aktifkan virtual environment (Opsional tapi disarankan):
   ```bash
   python -m venv venv
   # Windows:
   .\venv\Scripts\activate
   # Linux/Mac:
   source venv/bin/activate
   ```

3. Install library:
   ```bash
   pip install -r requirements.txt
   ```

4. Jalankan Service:
   ```bash
   python main.py
   # atau
   uvicorn main:app --port 5000 --reload
   ```

## Endpoint API

### `POST /predict-blur`
Menerima file gambar dan mengembalikan hasil analisis tingkat *blur*.

**Request:** `multipart/form-data` dengan key `file`.

**Response:**
```json
{
  "status": "sharp",
  "blur_score": 1450.55
}
```
*Catatan: Jika `blur_score` < 100, status akan menjadi "blurry".*

---
*Versi 2.1.0 - Bagian dari ekosistem Jaya Mandiri Digital Printing.*
