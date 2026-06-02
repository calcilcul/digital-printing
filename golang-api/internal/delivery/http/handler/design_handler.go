package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"

	"golang-api/internal/domain/design"
	"golang-api/internal/usecase"
)

// allowedFileExtensions adalah whitelist ekstensi file desain yang diizinkan.
// Ekstensi di luar daftar ini akan ditolak untuk mencegah upload file berbahaya.
var allowedFileExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".pdf":  true,
	".ai":   true,
	".psd":  true,
	".cdr":  true,
}

type DesignHandler struct {
	designUsecase *usecase.DesignUsecase
}

func NewDesignHandler(designUsecase *usecase.DesignUsecase) *DesignHandler {
	return &DesignHandler{designUsecase: designUsecase}
}

// UploadDesign endpoint untuk customer mengupload file desain
func (h *DesignHandler) UploadDesign(c *gin.Context) {
	orderItemIDStr := c.Param("id")
	orderItemID, err := strconv.Atoi(orderItemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID order item tidak valid"})
		return
	}

	// Ambil file dari form-data dengan key "design_file"
	file, err := c.FormFile("design_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File tidak ditemukan dalam request (gunakan key 'file')"})
		return
	}

	// ✅ FIX #2: Validasi ekstensi file — tolak file berbahaya (.exe, .php, dll.)
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !allowedFileExtensions[ext] {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": fmt.Sprintf(
				"Tipe file '%s' tidak diizinkan. Gunakan: jpg, jpeg, png, pdf, ai, psd, atau cdr",
				ext,
			),
		})
		return
	}

	// Validasi ukuran file (max 10MB)
	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ukuran file terlalu besar, maksimal 10MB"})
		return
	}

	// Buat nama file unik (timestamp_filename)
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
	savePath := filepath.Join("uploads", "designs", filename)
	dbPath := "/uploads/designs/" + filename

	// Simpan file ke direktori lokal
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan file ke server: " + err.Error()})
		return
	}

	// 🧪 Hubungkan ke Python AI untuk validasi blur jika filenya adalah gambar
	// Hati-hati: HP Android/iOS sering mengirimkan file tanpa ekstensi atau dengan ekstensi berbeda (webp, heic)
	// Kita akan periksa MIME typenya
	contentType := file.Header.Get("Content-Type")
	isImage := strings.HasPrefix(contentType, "image/") || ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".webp"
	
	if isImage {
		isSharp, aiErr := checkBlurWithAI(savePath)
		if aiErr != nil {
			// Hubungan ke AI terputus/off atau error, WAJIB BLOCK
			_ = os.Remove(savePath)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": fmt.Sprintf("Service AI sedang offline atau mengalami gangguan: %v. Harap nyalakan server python-ai.", aiErr),
			})
			return
		} else if !isSharp {
			// Gambar blur! Hapus file fisik lokal yang sudah terlanjur di-SaveUploadedFile
			_ = os.Remove(savePath)
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Upload ditolak oleh AI: File desain yang Anda unggah terdeteksi buram/blur. Silakan unggah gambar dengan kualitas lebih tajam.",
			})
			return
		}
	}

	customerID := c.GetInt("user_id")
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// Proses ke usecase (validasi kepemilikan ada di dalam usecase)
	designFile, err := h.designUsecase.UploadDesign(c.Request.Context(), orderItemID, dbPath, customerID, ip, ua)
	if err != nil {
		// Hapus file fisik lokal yang terlanjur di-upload jika proses database gagal
		_ = os.Remove(savePath)
		
		// ✅ Kembalikan 403 jika error adalah masalah kepemilikan
		if err.Error() == "akses ditolak: order item ini bukan milik Anda" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		// Batas maksimum upload tercapai
		if strings.Contains(err.Error(), "batas maksimum") {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "File desain berhasil diunggah",
		"data":    designFile,
	})
}

// checkBlurWithAI memanggil service Python AI untuk memverifikasi ketajaman gambar
func checkBlurWithAI(filePath string) (bool, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return false, err
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("file", filepath.Base(filePath))
	if err != nil {
		return false, err
	}
	_, err = io.Copy(part, file)
	if err != nil {
		return false, err
	}
	writer.Close()

	// Timeout 3 detik agar sistem tidak hang jika python AI mati
	client := &http.Client{Timeout: 3 * time.Second}
	req, err := http.NewRequest("POST", "http://localhost:5000/predict-blur", body)
	if err != nil {
		return false, err
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := client.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return false, fmt.Errorf("server AI mengembalikan status: %d", resp.StatusCode)
	}

	var result struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return false, err
	}

	// Jika terdeteksi "blur", kembalikan false (tidak tajam)
	if result.Status == "blur" {
		return false, nil
	}

	return true, nil
}

// GetDesignsByOrderItemID mendapatkan riwayat desain untuk satu item pesanan
func (h *DesignHandler) GetDesignsByOrderItemID(c *gin.Context) {
	orderItemIDStr := c.Param("id")
	orderItemID, err := strconv.Atoi(orderItemIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID order item tidak valid"})
		return
	}

	// Ambil identitas user dari JWT (di-set oleh AuthMiddleware)
	userID := c.GetInt("user_id")
	role := c.GetString("role")

	designs, err := h.designUsecase.GetDesignsByOrderItemID(c.Request.Context(), orderItemID, userID, role)
	if err != nil {
		// Kembalikan 403 jika error adalah masalah kepemilikan/akses
		if err.Error() == "akses ditolak: Anda tidak memiliki izin untuk melihat desain pesanan ini" {
			c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": designs})
}

// AddReview endpoint untuk staff/admin memberikan review (approve/revision)
func (h *DesignHandler) AddReview(c *gin.Context) {
	designIDStr := c.Param("id")
	designID, err := strconv.Atoi(designIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID file desain tidak valid"})
		return
	}

	var req design.DesignReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	reviewerID := c.GetInt("user_id")
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	err = h.designUsecase.AddReview(c.Request.Context(), designID, req, reviewerID, ip, ua)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review berhasil disimpan"})
}
