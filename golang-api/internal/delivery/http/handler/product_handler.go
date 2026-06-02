package handler

import (
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

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

// productImageMap removed as requested by user.

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

	// Remove dummy Unsplash image injection
	for i := range products {
		if products[i].ImageURL == "" {
			// Leave it empty or map a generic placeholder if needed.
			// The frontend will handle empty image_urls.
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "success get products",
		"data":    products,
	})
}

// ========================
// GET ALL PRODUCTS FOR ADMIN
// ========================
func (h *ProductHandler) GetAllForAdmin(c *gin.Context) {

	products, err := h.usecase.GetAllForAdmin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": err.Error(),
		})
		return
	}

	for i := range products {
		if products[i].ImageURL == "" {
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "success get products for admin",
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

	productID, err := h.usecase.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "success create product",
		"product_id": productID,
	})
}

// ========================
// UPLOAD PRODUCT IMAGE
// ========================
func (h *ProductHandler) UploadImage(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "invalid product id"})
		return
	}

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "image is required"})
		return
	}

	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("product_%d_%d%s", id, time.Now().Unix(), ext)
	savePath := filepath.Join("uploads", "products", filename)
	dbPath := "/uploads/products/" + filename

	// Save file locally
	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to save image"})
		return
	}

	// Update image_url in DB
	if err := h.usecase.UpdateImageURL(id, dbPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "failed to update product image url"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "success upload image",
		"image_url": dbPath,
	})
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

// ========================
// GET ALL CATEGORIES
// ========================
func (h *ProductHandler) GetCategories(c *gin.Context) {
	categories, err := h.usecase.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "success get categories",
		"data":    categories,
	})
}
