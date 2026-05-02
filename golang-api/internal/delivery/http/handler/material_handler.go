package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"golang-api/internal/domain/material"
	"golang-api/internal/usecase"
)

type MaterialHandler struct {
	materialUsecase *usecase.MaterialUsecase
}

func NewMaterialHandler(materialUsecase *usecase.MaterialUsecase) *MaterialHandler {
	return &MaterialHandler{materialUsecase: materialUsecase}
}

// Create endpoint untuk mendaftarkan bahan baku baru
func (h *MaterialHandler) Create(c *gin.Context) {
	var req material.MaterialRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetInt("user_id") // dari middleware Auth
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	err := h.materialUsecase.CreateMaterial(c.Request.Context(), req, adminID, ip, ua)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Material berhasil dibuat"})
}

// GetAll endpoint untuk melihat semua bahan baku dan stoknya
func (h *MaterialHandler) GetAll(c *gin.Context) {
	materials, err := h.materialUsecase.GetAllMaterials(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": materials})
}

// AdjustStock endpoint untuk menambah atau mengurangi stok secara manual
func (h *MaterialHandler) AdjustStock(c *gin.Context) {
	idStr := c.Param("id")
	materialID, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID material tidak valid"})
		return
	}

	var req material.MaterialStockAdjustmentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	adminID := c.GetInt("user_id")
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	err = h.materialUsecase.AdjustStock(c.Request.Context(), materialID, req, adminID, ip, ua)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Stok material berhasil disesuaikan"})
}
