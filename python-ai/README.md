# Digital Printing AI Service 🤖

Microservice berbasis **FastAPI** dan **TensorFlow** untuk melakukan deteksi kualitas gambar (Blur Detection) secara otomatis.

## Fitur
- **Blur Detection**: Menggunakan model Deep Learning (CNN) untuk menentukan apakah gambar tajam atau pecah/blur.
- **FastAPI**: Endpoint berperforma tinggi untuk integrasi dengan backend lain (Golang).
- **Bypass Mode**: Jika model tidak ditemukan, sistem tetap berjalan dengan memberikan status default "sharp".

## Persyaratan
- Python 3.9+
- TensorFlow 2.15+
- Pillow, FastAPI, Uvicorn

## Cara Instalasi

1. Masuk ke direktori:
   ```bash
   cd python-ai
   ```

2. Buat virtual environment:
   ```bash
   python -m venv venv
   ```

3. Aktifkan venv:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Cara Menjalankan

Layanan ini dikonfigurasi untuk berjalan di **port 5000** agar sesuai dengan request dari Backend Golang.

```bash
python main.py
```
atau menggunakan uvicorn langsung:
```bash
uvicorn main:app --port 5000 --reload
```

## API Endpoint

### `POST /predict-blur`
Menerima file gambar dan mengembalikan hasil analisis.

**Request:** `multipart/form-data` dengan key `file`.

**Response:**
```json
{
  "status": "sharp",
  "confidence": 99.85
}
```

---
*Bagian dari ekosistem Digital Printing Management System.*
