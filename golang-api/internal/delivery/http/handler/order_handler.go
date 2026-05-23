package handler

import (
	"fmt"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"golang-api/internal/domain/order"
	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
	"github.com/go-pdf/fpdf"
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
// GET ORDER DETAIL (INVOICE)
// =========================================================================
func (h *OrderHandler) GetOrderDetail(c *gin.Context) {
	orderIDStr := c.Param("id")
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}

	userID := c.MustGet("user_id").(int)
	role := c.MustGet("role").(string)

	detail, err := h.usecase.GetOrderDetail(c.Request.Context(), orderID, userID, role)
	if err != nil {
		if err.Error() == "anda tidak memiliki akses untuk melihat pesanan ini" {
			c.JSON(http.StatusForbidden, gin.H{"message": err.Error()})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Detail pesanan berhasil diambil",
		"data":    detail,
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

// =========================================================================
// DOWNLOAD INVOICE PDF
// =========================================================================
func (h *OrderHandler) DownloadInvoicePDF(c *gin.Context) {
	orderIDStr := c.Param("id")
	orderID, err := strconv.Atoi(orderIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}

	userID := c.MustGet("user_id").(int)
	role := c.MustGet("role").(string)

	detail, err := h.usecase.GetOrderDetail(c.Request.Context(), orderID, userID, role)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	// Generate PDF
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.AddPage()

	// Header
	pdf.SetFont("Arial", "B", 20)
	pdf.Cell(0, 10, "INVOICE JAYA MANDIRI")
	pdf.Ln(12)

	pdf.SetFont("Arial", "", 12)
	pdf.Cell(0, 10, fmt.Sprintf("Order Code: %s", detail.OrderCode))
	pdf.Ln(8)
	pdf.Cell(0, 10, fmt.Sprintf("Status: %s", detail.Status))
	pdf.Ln(8)
	pdf.Cell(0, 10, fmt.Sprintf("Tanggal: %s", detail.CreatedAt.Format("02 Jan 2006 15:04")))
	pdf.Ln(15)

	// Table Header
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(80, 10, "Produk", "1", 0, "C", false, 0, "")
	pdf.CellFormat(30, 10, "Harga", "1", 0, "C", false, 0, "")
	pdf.CellFormat(20, 10, "Qty", "1", 0, "C", false, 0, "")
	pdf.CellFormat(40, 10, "Subtotal", "1", 0, "C", false, 0, "")
	pdf.Ln(10)

	// Table Content
	pdf.SetFont("Arial", "", 12)
	for _, item := range detail.Items {
		pdf.CellFormat(80, 10, item.ProductName, "1", 0, "", false, 0, "")
		pdf.CellFormat(30, 10, fmt.Sprintf("%.0f", item.Price), "1", 0, "R", false, 0, "")
		pdf.CellFormat(20, 10, fmt.Sprintf("%d", item.Quantity), "1", 0, "C", false, 0, "")
		pdf.CellFormat(40, 10, fmt.Sprintf("%.0f", item.SubTotal), "1", 0, "R", false, 0, "")
		pdf.Ln(10)
	}

	// Total
	pdf.SetFont("Arial", "B", 12)
	pdf.CellFormat(130, 10, "TOTAL", "1", 0, "R", false, 0, "")
	pdf.CellFormat(40, 10, fmt.Sprintf("%.0f", detail.TotalPrice), "1", 0, "R", false, 0, "")

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=invoice_%s.pdf", detail.OrderCode))

	err = pdf.Output(c.Writer)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal generate PDF"})
	}
}

// =========================================================================
// BUY NOW (Customer - beli langsung 1 item)
// =========================================================================
type BuyNowRequest struct {
	ProductID int    `json:"product_id" binding:"required"`
	VariantID int    `json:"variant_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
	Notes     string `json:"notes"`
}

func (h *OrderHandler) BuyNow(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	var req BuyNowRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Format request tidak valid: " + err.Error()})
		return
	}
	orderID, orderCode, total, err := h.usecase.BuyNow(c.Request.Context(), userID, req.ProductID, req.VariantID, req.Quantity, req.Notes)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message":     "Pesanan berhasil dibuat, silakan upload desain",
		"order_id":    orderID,
		"order_code":  orderCode,
		"total_price": total,
	})
}

// =========================================================================
// UPLOAD DESIGN PER ITEM (Customer - multipart/form-data)
// =========================================================================
func (h *OrderHandler) UploadDesign(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}
	orderItemID, err := strconv.Atoi(c.Param("item_id"))
	if err != nil || orderItemID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID item tidak valid"})
		return
	}

	file, fileHeader, err := c.Request.FormFile("design_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "File desain tidak ditemukan di request"})
		return
	}
	defer file.Close()

	// Simpan file
	filePath, err := saveUploadedFile(c, fileHeader, "designs")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan file: " + err.Error()})
		return
	}

	if err := h.usecase.UploadDesign(c.Request.Context(), orderID, orderItemID, filePath, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Desain berhasil diupload", "file_path": filePath})
}

// =========================================================================
// REUPLOAD DESIGN (Customer - setelah revisi)
// =========================================================================
func (h *OrderHandler) ReuploadDesign(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}
	orderItemID, err := strconv.Atoi(c.Param("item_id"))
	if err != nil || orderItemID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID item tidak valid"})
		return
	}

	file, fileHeader, err := c.Request.FormFile("design_file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "File desain tidak ditemukan di request"})
		return
	}
	defer file.Close()

	filePath, err := saveUploadedFile(c, fileHeader, "designs")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan file: " + err.Error()})
		return
	}

	if err := h.usecase.ReuploadDesign(c.Request.Context(), orderID, orderItemID, filePath, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Desain berhasil diupload ulang", "file_path": filePath})
}

// =========================================================================
// UPLOAD PAYMENT (Customer - bukti transfer)
// =========================================================================
func (h *OrderHandler) UploadPayment(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}

	file, fileHeader, err := c.Request.FormFile("payment_proof")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "File bukti bayar tidak ditemukan di request"})
		return
	}
	defer file.Close()

	// Parse amount dari form data
	amountStr := c.PostForm("amount")
	var amount float64
	if amountStr != "" {
		if _, err := fmt.Sscanf(amountStr, "%f", &amount); err != nil {
			amount = 0
		}
	}

	filePath, err := saveUploadedFile(c, fileHeader, "payments")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan file: " + err.Error()})
		return
	}

	if err := h.usecase.UploadPayment(c.Request.Context(), orderID, userID, filePath, amount); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bukti pembayaran berhasil diupload, menunggu verifikasi staf"})
}

// =========================================================================
// REUPLOAD PAYMENT (Customer - setelah ditolak)
// =========================================================================
func (h *OrderHandler) ReuploadPayment(c *gin.Context) {
	userID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}

	file, fileHeader, err := c.Request.FormFile("payment_proof")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "File bukti bayar tidak ditemukan di request"})
		return
	}
	defer file.Close()

	filePath, err := saveUploadedFile(c, fileHeader, "payments")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan file: " + err.Error()})
		return
	}

	if err := h.usecase.ReuploadPayment(c.Request.Context(), orderID, userID, filePath); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bukti pembayaran berhasil diupload ulang"})
}

// =========================================================================
// STAFF: APPROVE PAYMENT
// =========================================================================
func (h *OrderHandler) ApprovePayment(c *gin.Context) {
	staffID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}
	if err := h.usecase.ApprovePayment(c.Request.Context(), orderID, staffID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pembayaran berhasil diverifikasi"})
}

// =========================================================================
// STAFF: REJECT PAYMENT
// =========================================================================
type RejectPaymentRequest struct {
	Reason string `json:"reason" binding:"required"`
}

func (h *OrderHandler) RejectPayment(c *gin.Context) {
	staffID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}
	var req RejectPaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Alasan penolakan harus diisi"})
		return
	}
	if err := h.usecase.RejectPayment(c.Request.Context(), orderID, staffID, req.Reason); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Pembayaran ditolak, customer akan diminta upload ulang"})
}

// =========================================================================
// STAFF: APPROVE DESIGN
// =========================================================================
func (h *OrderHandler) ApproveDesign(c *gin.Context) {
	staffID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}
	if err := h.usecase.ApproveDesign(c.Request.Context(), orderID, staffID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Desain disetujui, pesanan masuk antrian cetak"})
}

// =========================================================================
// STAFF: REQUEST REVISION
// =========================================================================
type RequestRevisionRequest struct {
	Notes string `json:"notes" binding:"required"`
}

func (h *OrderHandler) RequestRevision(c *gin.Context) {
	staffID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}
	var req RequestRevisionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Catatan revisi harus diisi"})
		return
	}
	if err := h.usecase.RequestRevision(c.Request.Context(), orderID, staffID, req.Notes); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Permintaan revisi berhasil dikirim ke customer"})
}

// =========================================================================
// STAFF: FINISH PRINTING → ready
// =========================================================================
func (h *OrderHandler) FinishPrinting(c *gin.Context) {
	staffID := c.MustGet("user_id").(int)
	orderID, err := strconv.Atoi(c.Param("id"))
	if err != nil || orderID <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID pesanan tidak valid"})
		return
	}
	if err := h.usecase.FinishPrinting(c.Request.Context(), orderID, staffID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cetak selesai, pesanan siap diambil customer"})
}

// =========================================================================
// HELPER: Save uploaded file to disk
// =========================================================================
var allowedUploadExtensions = map[string]bool{
	".jpg":  true,
	".jpeg": true,
	".png":  true,
	".pdf":  true,
	".ai":   true,
	".psd":  true,
	".cdr":  true,
}

func saveUploadedFile(c *gin.Context, fileHeader *multipart.FileHeader, subfolder string) (string, error) {
	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if !allowedUploadExtensions[ext] {
		return "", fmt.Errorf("tipe file '%s' tidak diizinkan", ext)
	}
	if fileHeader.Size > 10*1024*1024 {
		return "", fmt.Errorf("ukuran file terlalu besar, maksimal 10MB")
	}
	filename := fmt.Sprintf("%d_%s", time.Now().UnixNano(), filepath.Base(fileHeader.Filename))
	savePath := filepath.Join("uploads", subfolder, filename)
	if err := c.SaveUploadedFile(fileHeader, savePath); err != nil {
		return "", err
	}
	return "/uploads/" + subfolder + "/" + filename, nil
}


