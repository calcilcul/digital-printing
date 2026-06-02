import os
import io
import uvicorn
import numpy as np
try:
    import tensorflow as tf
    TENSORFLOW_AVAILABLE = True
except ImportError:
    TENSORFLOW_AVAILABLE = False
    print("WARNING: TensorFlow is not installed. AI features will be disabled.")
from fastapi import FastAPI, UploadFile, File, HTTPException
from PIL import Image
from contextlib import asynccontextmanager
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
load_dotenv()

# Configuration
MODEL_PATH = os.getenv("MODEL_PATH", "model.h5")
APP_PORT = int(os.getenv("APP_PORT", 5000))
APP_HOST = os.getenv("APP_HOST", "0.0.0.0")

# Global variable for the model
model = None
CLASS_NAMES = ['blur', 'sharp']

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for FastAPI.
    Handles startup and shutdown events.
    """
    if not TENSORFLOW_AVAILABLE:
        print("INFO: TensorFlow tidak tersedia. Menggunakan metode klasik (Laplacian Variance) sebagai fallback.")
    elif os.path.exists(MODEL_PATH):
        try:
            # Load the model
            model = tf.keras.models.load_model(MODEL_PATH)
            print(f"SUCCESS: Berhasil memuat model AI dari {MODEL_PATH}")
        except Exception as e:
            print(f"ERROR: Gagal memuat model AI: {e}")
            print("INFO: Menggunakan metode klasik (Laplacian Variance) sebagai fallback.")
    else:
        print(f"WARNING: File {MODEL_PATH} tidak ditemukan.")
        print("INFO: Menggunakan metode klasik (Laplacian Variance) sebagai fallback.")
    
    yield
    # Clean up and release resources if needed
    print("Mematikan Digital Printing AI Service...")

app = FastAPI(
    title="Digital Printing AI Service",
    description="Microservice untuk deteksi kualitas gambar (Blur Detection) menggunakan TensorFlow.",
    version="1.0.0",
    lifespan=lifespan
)

@app.post("/predict-blur")
async def predict_blur(file: UploadFile = File(...)):
    """
    Endpoint untuk mendeteksi apakah gambar blur atau tajam (sharp).
    """

    try:
        # Baca file ke dalam memori
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # 1. Metode Algoritma Cerdas (Tanpa TensorFlow)
        # Resize ke ukuran standar agar perhitungannya konsisten
        image_resized = image.resize((400, 400))
        gray_image = image_resized.convert('L')
        img_np = np.array(gray_image, dtype=np.float32)
        
        # Hitung Filter Laplacian (Deteksi Tepi / Ketajaman)
        top = img_np[:-2, 1:-1]
        bottom = img_np[2:, 1:-1]
        left = img_np[1:-1, :-2]
        # Hitung Filter Laplacian untuk Fallback & Tambahan
        top = img_np[:-2, 1:-1]
        bottom = img_np[2:, 1:-1]
        left = img_np[1:-1, :-2]
        right = img_np[1:-1, 2:]
        center = img_np[1:-1, 1:-1]
        laplacian = top + bottom + left + right - 4 * center
        
        laplacian_var = float(laplacian.var())
        laplacian_mad = float(np.mean(np.abs(laplacian - np.mean(laplacian))))
        edge_pixels = np.sum(np.abs(laplacian) > 30)
        edge_density = float(edge_pixels) / laplacian.size
        
        score = 1.0 # Default anggap sharp
        nama_kelas = "sharp"
        confidence = 100.0
        
        # JIKA AI TENSORFLOW TERSEDIA (Ini adalah algoritma utama)
        if model is not None and TENSORFLOW_AVAILABLE:
            if image.mode != "RGB":
                image = image.convert("RGB")
            
            # AI MobileNetV2 membutuhkan input 224x224
            ai_image = image.resize((224, 224))
            img_array = tf.keras.preprocessing.image.img_to_array(ai_image) / 255.0
            img_array = tf.expand_dims(img_array, 0)
            
            # Dapatkan skor ketajaman dari AI
            predictions = model.predict(img_array, verbose=0)
            score = float(predictions[0][0])
            
            # Aturan Gabungan: AI mengatakan sharp jika >= 0.5, 
            # Tapi kita proteksi dengan edge_density untuk night motion blur
            if score >= 0.5 and edge_density >= 0.015:
                nama_kelas = "sharp"
                confidence = score * 100
            else:
                nama_kelas = "blur"
                if score >= 0.5:
                    confidence = 85.0
                else:
                    confidence = (1 - score) * 100
                    
        # JIKA AI TIDAK TERSEDIA (Fallback Matematika)
        else:
            MAD_THRESHOLD = 8.0
            DENSITY_THRESHOLD = 0.015
            
            if laplacian_mad < MAD_THRESHOLD or edge_density < DENSITY_THRESHOLD:
                nama_kelas = "blur"
                confidence = 100.0 - (laplacian_mad / MAD_THRESHOLD * 50)
                if confidence > 100: confidence = 100.0
            else:
                nama_kelas = "sharp"
                confidence = 80.0 + (laplacian_mad / 20.0)
                if confidence > 100: confidence = 100.0
                
        return {
            "status":     nama_kelas,
            "confidence": round(confidence, 2),
            "debug": {
                "ai_score": round(score, 4) if TENSORFLOW_AVAILABLE else "Disabled",
                "laplacian_variance": round(laplacian_var, 2),
                "laplacian_mad": round(laplacian_mad, 2),
                "edge_density": round(edge_density, 4)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses gambar: {str(e)}")

@app.get("/")
def read_root():
    return {
        "message": "Digital Printing AI Service is Running",
        "port": APP_PORT,
        "model_loaded": model is not None
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=APP_HOST, port=APP_PORT, reload=True)
