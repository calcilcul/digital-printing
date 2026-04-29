package handler

import (
	"net/http"
	"strconv"

	"golang-api/internal/domain/order"
	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	usecase *usecase.OrderUsecase
}

func NewOrderHandler(u *usecase.OrderUsecase) *OrderHandler {
	return &OrderHandler{u}
}

// =========================================================================
// CREATE (OPTIONAL/MANUAL)
// =========================================================================
type OrderItemRequest struct {
	ProductID int    `json:"product_id" binding:"required"`
	VariantID int    `json:"variant_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required"`
	Notes     string `json:"notes"`
}

type CreateOrderRequest struct {
	Items []OrderItemRequest `json:"items" binding:"required,dive"`
}

func (h *OrderHandler) Create(c *gin.Context) {
	var req CreateOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Format request tidak valid"})
		return
	}

	// Ambil userID dari JWT Middleware
	userID := c.MustGet("user_id").(int)

	// Tarik Metadata untuk Audit Log
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// Map DTO to Domain
	var items []order.OrderItem
	for _, item := range req.Items {
		items = append(items, order.OrderItem{
			ProductID: item.ProductID,
			VariantID: item.VariantID,
			Quantity:  item.Quantity,
			Notes:     item.Notes,
		})
	}

	// Kirim context dan metadata ke usecase
	err := h.usecase.Create(c.Request.Context(), userID, items, ip, ua)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pesanan berhasil dibuat secara manual"})
}

// =========================================================================
// CHECKOUT (PROSES UTAMA)
// =========================================================================
func (h *OrderHandler) Checkout(c *gin.Context) {
	userID := c.MustGet("user_id").(int)

	// Tarik Metadata untuk Audit Log
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// Teruskan context dan metadata ke usecase untuk memproses transaksi DB
	orderID, orderCode, total, err := h.usecase.Checkout(c.Request.Context(), userID, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Checkout berhasil",
		"order_id":    orderID,
		"order_code":  orderCode,
		"total_price": total,
	})
}

// =========================================================================
// CANCEL ORDER
// =========================================================================
func (h *OrderHandler) Cancel(c *gin.Context) {
	// Pastikan hanya customer yang bisa cancel pesanan mereka sendiri
	role := c.MustGet("role").(string)
	if role != "customer" {
		c.JSON(http.StatusForbidden, gin.H{"message": "Hanya pelanggan yang dapat membatalkan pesanan"})
		return
	}

	// Ambil ID pesanan dari URL parameter
	orderIDStr := c.Param("id")
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}

	userID := c.MustGet("user_id").(int)

	// Tarik Metadata untuk Audit Log
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// Panggil usecase dengan Context dan metadata
	err = h.usecase.Cancel(c.Request.Context(), orderID, userID, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pesanan berhasil dibatalkan"})
}

// =========================================================================
// GET MY ORDERS (Customer — melihat daftar pesanannya sendiri)
// =========================================================================
func (h *OrderHandler) GetMyOrders(c *gin.Context) {
	userID := c.MustGet("user_id").(int)

	orders, err := h.usecase.GetMyOrders(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Daftar pesanan Anda",
		"total":   len(orders),
		"data":    orders,
	})
}

// =========================================================================
// GET ALL ORDERS (Owner/Admin Dashboard)
// =========================================================================
func (h *OrderHandler) GetAllOrders(c *gin.Context) {
	orders, err := h.usecase.GetAllOrders(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Semua pesanan",
		"total":   len(orders),
		"data":    orders,
	})
}

// =========================================================================
// COMPLETE ORDER (Customer mengonfirmasi barang telah diterima)
// =========================================================================
func (h *OrderHandler) CompleteOrder(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	orderIDStr := c.Param("id")
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}

	ip := c.ClientIP()
	ua := c.GetHeader("User-Agent")

	err = h.usecase.CompleteOrder(c.Request.Context(), orderID, userID, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Pesanan berhasil diselesaikan. Terima kasih!"})
}
