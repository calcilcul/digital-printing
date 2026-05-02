package handler

import (
	"net/http"
	"strconv"

	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
)

type ProductionHandler struct {
	usecase *usecase.ProductionUsecase
}

func NewProductionHandler(u *usecase.ProductionUsecase) *ProductionHandler {
	return &ProductionHandler{u}
}

// Struct untuk menerima catatan tambahan (optional)
type ProductionRequest struct {
	Notes string `json:"notes"`
}

// =========================================================================
// START PRODUCTION
// =========================================================================
func (h *ProductionHandler) Start(c *gin.Context) {
	// 1. Validasi Role (Hanya staff/admin/owner yang boleh)
	role := c.MustGet("role").(string)
	if role == "customer" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Akses ditolak. Hanya staf produksi yang diizinkan."})
		return
	}

	// 2. Ambil Order ID dari URL
	orderIDStr := c.Param("id")
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}

	// 3. Ambil Input JSON (Catatan)
	var req ProductionRequest
	_ = c.ShouldBindJSON(&req) // Kita ignore error karena notes sifatnya opsional

	// 4. Tarik data untuk Audit Log
	staffID := c.MustGet("user_id").(int)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// 5. Eksekusi Usecase
	err = h.usecase.StartProduction(c.Request.Context(), orderID, staffID, req.Notes, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Proses produksi (cetak) berhasil dimulai"})
}

// =========================================================================
// FINISH PRODUCTION
// =========================================================================
func (h *ProductionHandler) Finish(c *gin.Context) {
	// 1. Validasi Role
	role := c.MustGet("role").(string)
	if role == "customer" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Akses ditolak. Hanya staf produksi yang diizinkan."})
		return
	}

	// 2. Ambil Order ID dari URL
	orderIDStr := c.Param("id")
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}

	// 3. Ambil Input JSON (Catatan)
	var req ProductionRequest
	_ = c.ShouldBindJSON(&req)

	// 4. Tarik data untuk Audit Log
	staffID := c.MustGet("user_id").(int)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// 5. Eksekusi Usecase
	err = h.usecase.FinishProduction(c.Request.Context(), orderID, staffID, req.Notes, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Proses produksi berhasil diselesaikan. Pesanan siap!"})
}
