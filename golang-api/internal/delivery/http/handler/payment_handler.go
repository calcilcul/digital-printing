package handler

import (
	"net/http"
	"strconv"

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
	var req UploadPaymentRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Data request tidak valid",
			"error":   err.Error(),
		})
		return
	}

	// Ambil data dari context (JWT Middleware)
	userID := c.MustGet("user_id").(int)

	// Tangkap metadata untuk Audit Log
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// PERBAIKAN: Masukkan req.TransactionCode ke dalam argumen [Penting!]
	paymentID, err := h.usecase.UploadProof(
		c.Request.Context(),
		userID,
		req.OrderID,
		req.MethodID,
		req.TransactionCode, // Parameter ini harus dikirim
		req.Amount,
		req.Proof,
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
