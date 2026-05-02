package handler

import (
	"net/http"

	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
)

type CartHandler struct {
	usecase *usecase.CartUsecase
}

func NewCartHandler(u *usecase.CartUsecase) *CartHandler {
	return &CartHandler{u}
}

// =========================================================================
// REQUEST STRUCTS
// =========================================================================
type AddCartRequest struct {
	ProductID int    `json:"product_id" binding:"required"`
	VariantID int    `json:"variant_id" binding:"required"` // Pilihan varian
	Quantity  int    `json:"quantity" binding:"required"`
	Notes     string `json:"notes"`                         // Catatan kustom cetak
}

type UpdateCartRequest struct {
	CartItemID int `json:"cart_item_id" binding:"required"` // Gunakan ID unik baris keranjang [cite: 1259 16643]
	Quantity   int `json:"quantity" binding:"required"`
}

type DeleteCartRequest struct {
	CartItemID int `json:"cart_item_id" binding:"required"` // Hapus berdasarkan ID unik baris [cite: 1259 16643]
}

// =========================================================================
// ADD TO CART
// =========================================================================
func (h *CartHandler) Add(c *gin.Context) {
	var req AddCartRequest

	// Validasi JSON input otomatis menggunakan tag 'binding'
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Format data tidak valid"})
		return
	}

	// Ambil userID dari context (biasanya diset oleh Middleware JWT)
	userID := c.MustGet("user_id").(int)

	// Panggil usecase dengan parameter kustomisasi digital printing [cite: 1259 16643]
	err := h.usecase.Add(
		c.Request.Context(),
		userID,
		req.ProductID,
		req.VariantID,
		req.Quantity,
		req.Notes,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Produk berhasil ditambahkan ke keranjang"})
}

// =========================================================================
// GET CART
// =========================================================================
func (h *CartHandler) Get(c *gin.Context) {
	userID := c.MustGet("user_id").(int)

	items, err := h.usecase.Get(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items": items,
	})
}

// =========================================================================
// UPDATE CART
// =========================================================================
func (h *CartHandler) Update(c *gin.Context) {
	var req UpdateCartRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Data tidak valid"})
		return
	}

	// Gunakan cart_item_id agar tidak tertukar jika ada produk sama dengan bahan berbeda [cite: 1259 16643]
	err := h.usecase.Update(c.Request.Context(), req.CartItemID, req.Quantity)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Jumlah pesanan berhasil diperbarui"})
}

// =========================================================================
// DELETE CART ITEM
// =========================================================================
func (h *CartHandler) Delete(c *gin.Context) {
	var req DeleteCartRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID item diperlukan"})
		return
	}

	err := h.usecase.Delete(c.Request.Context(), req.CartItemID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item berhasil dihapus dari keranjang"})
}
