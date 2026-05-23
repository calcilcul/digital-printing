package handler

import (
	"net/http"
	"strconv"

	"golang-api/internal/domain/product"
	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	usecase *usecase.ProductUsecase
}

func NewProductHandler(u *usecase.ProductUsecase) *ProductHandler {
	return &ProductHandler{u}
}

// productImageMap maps product ID ke URL gambar Unsplash
// Ini workaround sementara karena kolom image_url belum ada di DB Railway
var productImageMap = map[int]string{
	1:  "https://images.unsplash.com/photo-1598301257982-0cf014dff316?w=800&q=80",  // Banner umum
	2:  "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",  // Poster
	4:  "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",     // Brosur
	10: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",     // Spanduk Flexi
	11: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80",  // X-Banner
	12: "https://images.unsplash.com/photo-1569017388730-020b5f80a004?w=800&q=80",  // Roll Up Banner
	13: "https://images.unsplash.com/photo-1612538498456-e861df91d4d0?w=800&q=80",  // Stiker Vinyl
	14: "https://images.unsplash.com/photo-1559163499-413811fb2344?w=800&q=80",     // Label Kemasan
	15: "https://images.unsplash.com/photo-1606836576983-8b458e75221d?w=800&q=80",  // Kartu Nama Art Carton
	16: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=800&q=80",  // Kartu Nama Linen
	17: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80",     // Brosur A4
	18: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&q=80",  // Flyer A5
	19: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80",  // Poster UV
	20: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80",  // Mug
	21: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80",  // Kaos
	22: "https://images.unsplash.com/photo-1591378603223-e15b45a81640?w=800&q=80",  // Tote Bag
	23: "https://images.unsplash.com/photo-1586281380117-5a60ae2050cc?w=800&q=80",  // Stempel
	24: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",  // Undangan Hard Cover
	25: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80",  // Undangan Digital
}

// ========================
// GET ALL PRODUCTS
// ========================
func (h *ProductHandler) GetAll(c *gin.Context) {

	products, err := h.usecase.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	// Inject image_url dari map jika kolom belum ada di DB
	for i := range products {
		if products[i].ImageURL == "" {
			if url, ok := productImageMap[products[i].ID]; ok {
				products[i].ImageURL = url
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "success get products",
		"data":    products,
	})
}

// ========================
// CREATE PRODUCT
// ========================
func (h *ProductHandler) Create(c *gin.Context) {
	var req product.ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request", "error": err.Error()})
		return
	}

	if err := h.usecase.Create(req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "success create product"})
}

// ========================
// UPDATE PRODUCT
// ========================
func (h *ProductHandler) Update(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid product id"})
		return
	}

	var req product.ProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid request", "error": err.Error()})
		return
	}

	if err := h.usecase.Update(id, req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "success update product"})
}

// ========================
// DELETE PRODUCT
// ========================
func (h *ProductHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid product id"})
		return
	}

	if err := h.usecase.Delete(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "success delete product"})
}
