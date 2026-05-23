package handler

import (
	"net/http"
	"strconv"
	"fmt"

	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	usecase *usecase.PaymentUsecase
}

func NewPaymentHandler(u *usecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{usecase: u}
}

// =========================================================================
// REQUEST STRUCT
// =========================================================================
type UploadPaymentRequest struct {
	OrderID         int     `json:"order_id" binding:"required"`
	MethodID        int     `json:"payment_method_id" binding:"required"` // Diubah agar sesuai curl
	TransactionCode string  `json:"transaction_code"`                  // Kode referensi dari bank/user
	Amount          float64 `json:"amount" binding:"required"`
	Proof           string  `json:"payment_proof" binding:"required"` // Diubah agar sesuai curl
}

// =========================================================================
// UPLOAD PAYMENT (CUSTOMER)
// =========================================================================
func (h *PaymentHandler) Upload(c *gin.Context) {
	// Parse manual dari form-data
	orderIDStr := c.PostForm("order_id")
	amountStr := c.PostForm("amount")
	methodIDStr := c.DefaultPostForm("payment_method_id", "1") // Default 1 jika tidak dikirim
	transactionCode := c.DefaultPostForm("transaction_code", "MANUAL-TRX")

	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "order_id tidak valid"})
		return
	}

	amount, err := strconv.ParseFloat(amountStr, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "amount tidak valid"})
		return
	}

	methodID, _ := strconv.Atoi(methodIDStr)

	file, err := c.FormFile("payment_proof")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "File payment_proof tidak ditemukan"})
		return
	}

	// Validasi ukuran file (max 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Ukuran file terlalu besar, maksimal 5MB"})
		return
	}

	// Buat nama file unik
	filename := fmt.Sprintf("%d_%s", orderID, file.Filename)
	savePath := "uploads/payments/" + filename
	dbPath := "/uploads/payments/" + filename

	// Simpan file
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan file"})
		return
	}

	userID := c.MustGet("user_id").(int)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	paymentID, err := h.usecase.UploadProof(
		c.Request.Context(),
		userID,
		orderID,
		methodID,
		transactionCode,
		amount,
		dbPath,
		ip,
		ua,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Bukti pembayaran berhasil diunggah",
		"payment_id": paymentID,
	})
}

// =========================================================================
// APPROVE PAYMENT (OWNER/ADMIN)
// =========================================================================
func (h *PaymentHandler) Approve(c *gin.Context) {
	adminID := c.MustGet("user_id").(int)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	idStr := c.Param("id")
	paymentID, err := strconv.Atoi(idStr)
	if err != nil || paymentID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pembayaran tidak valid"})
		return
	}

	err = h.usecase.Approve(c.Request.Context(), paymentID, adminID, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pembayaran berhasil disetujui"})
}

// =========================================================================
// REJECT PAYMENT (OWNER/ADMIN)
// =========================================================================
func (h *PaymentHandler) Reject(c *gin.Context) {
	adminID := c.MustGet("user_id").(int)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	idStr := c.Param("id")
	paymentID, err := strconv.Atoi(idStr)
	if err != nil || paymentID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pembayaran tidak valid"})
		return
	}

	err = h.usecase.Reject(c.Request.Context(), paymentID, adminID, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pembayaran berhasil ditolak"})
}
