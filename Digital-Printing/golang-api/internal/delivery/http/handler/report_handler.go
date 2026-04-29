package handler

import (
	"net/http"
	"strconv"

	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	usecase *usecase.ReportUsecase
}

func NewReportHandler(u *usecase.ReportUsecase) *ReportHandler {
	return &ReportHandler{usecase: u}
}

// =========================================================================
// REVENUE REPORT
// =========================================================================
func (h *ReportHandler) GetRevenueReport(c *gin.Context) {
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	data, err := h.usecase.GetRevenueReport(c.Request.Context(), startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Laporan pendapatan",
		"data":    data,
	})
}

// =========================================================================
// TOP PRODUCTS
// =========================================================================
func (h *ReportHandler) GetTopProducts(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "10")
	limit, _ := strconv.Atoi(limitStr)

	data, err := h.usecase.GetTopProducts(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Statistik produk terlaris",
		"data":    data,
	})
}

// =========================================================================
// AUDIT LOGS
// =========================================================================
func (h *ReportHandler) GetAuditLogs(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	data, err := h.usecase.GetAuditLogs(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Audit logs",
		"data":    data,
	})
}

// =========================================================================
// LOGIN LOGS
// =========================================================================
func (h *ReportHandler) GetLoginLogs(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	data, err := h.usecase.GetLoginLogs(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login logs",
		"data":    data,
	})
}

// =========================================================================
// PRODUCTION LOGS
// =========================================================================
func (h *ReportHandler) GetProductionLogs(c *gin.Context) {
	limitStr := c.DefaultQuery("limit", "50")
	limit, _ := strconv.Atoi(limitStr)

	data, err := h.usecase.GetProductionLogs(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Production logs",
		"data":    data,
	})
}
