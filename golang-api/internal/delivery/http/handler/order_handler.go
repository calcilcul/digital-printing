package handler

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"mime/multipart"
	"net/http"
	"os"
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

	// Parse optional reason dari request body
	var reqBody struct {
		Reason string `json:"reason"`
	}
	_ = c.ShouldBindJSON(&reqBody)

	// Tarik Metadata untuk Audit Log
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// Panggil usecase dengan Context dan metadata
	err = h.usecase.Cancel(c.Request.Context(), orderID, userID, reqBody.Reason, ip, ua)
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

	// Cek apakah ada payment yang approved
	isPaymentApproved := false
	for _, pt := range detail.PaymentTransactions {
		if pt.Status == "approved" || pt.PaymentStatus == "approved" {
			isPaymentApproved = true
			break
		}
	}

	// Guard: jangan generate invoice jika payment belum approved
	if !isPaymentApproved {
		c.JSON(http.StatusForbidden, gin.H{
			"message": "Invoice belum tersedia. Pembayaran belum diverifikasi.",
		})
		return
	}

	// Generate PDF
	pdf := fpdf.New("P", "mm", "A4", "")
	pdf.SetMargins(15, 15, 15)
	pdf.AddPage()

	// 1. Header (Logo & Title)
	// Draw Logo Box (J Jaya Mandiri)
	pdf.SetDrawColor(226, 232, 240) // border grey
	pdf.SetFillColor(255, 255, 255)
	pdf.Rect(15, 15, 55, 12, "D")

	// Print letter "J" in blue bold
	pdf.SetFont("Arial", "B", 13)
	pdf.SetTextColor(37, 99, 235) // blue
	pdf.SetXY(18, 16)
	pdf.Cell(5, 10, "J")

	// Print text "Jaya Mandiri" in dark slate
	pdf.SetFont("Arial", "B", 11)
	pdf.SetTextColor(30, 41, 59) // dark slate
	pdf.SetXY(24, 16)
	pdf.Cell(40, 10, "Jaya Mandiri")

	// Print invoice title on right side
	pdf.SetFont("Arial", "B", 9)
	pdf.SetTextColor(100, 116, 139) // Slate grey
	pdf.SetXY(140, 14)
	pdf.CellFormat(55, 6, "DIGITAL PRINTING", "", 0, "R", false, 0, "")

	pdf.SetFont("Arial", "B", 24)
	pdf.SetTextColor(15, 23, 42) // Dark Slate/Navy
	pdf.SetXY(140, 20)
	pdf.CellFormat(55, 10, "INVOICE", "", 0, "R", false, 0, "")

	// 2. From & To Address Boxes (Y = 35)
	// Draw From Box (Detail Toko)
	pdf.SetDrawColor(226, 232, 240)
	pdf.Rect(15, 35, 85, 43, "D")

	pdf.SetFont("Arial", "B", 8)
	pdf.SetTextColor(37, 99, 235) // blue
	pdf.SetXY(20, 37)
	pdf.Cell(80, 5, "FROM")
	pdf.SetXY(20, 40)
	pdf.Cell(80, 5, "DETAIL TOKO")

	pdf.SetFont("Arial", "B", 11)
	pdf.SetTextColor(30, 41, 59)
	pdf.SetXY(20, 47)
	pdf.Cell(80, 5, "Jaya Mandiri")

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(71, 85, 105)
	pdf.SetXY(20, 53)
	pdf.Cell(80, 5, "Digital Printing & Percetakan")
	pdf.SetXY(20, 58)
	pdf.Cell(80, 5, "Jl. Percetakan No. 1, Kota")
	pdf.SetXY(20, 63)
	pdf.Cell(80, 5, "Indonesia")
	pdf.SetXY(20, 68)
	pdf.Cell(80, 5, "admin@jayamandiri.com")

	// Draw To Box (Detail Pelanggan)
	pdf.Rect(110, 35, 85, 43, "D")

	pdf.SetFont("Arial", "B", 8)
	pdf.SetTextColor(22, 163, 74) // green
	pdf.SetXY(115, 37)
	pdf.Cell(80, 5, "TO")
	pdf.SetXY(115, 40)
	pdf.Cell(80, 5, "DETAIL PELANGGAN")

	pdf.SetFont("Arial", "B", 11)
	pdf.SetTextColor(30, 41, 59)
	pdf.SetXY(115, 47)
	custName := detail.CustomerName
	if custName == "" {
		custName = "Pelanggan"
	}
	pdf.Cell(80, 5, custName)

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(71, 85, 105)
	pdf.SetXY(115, 53)
	custEmail := detail.CustomerEmail
	if custEmail == "" {
		custEmail = "-"
	}
	pdf.Cell(80, 5, custEmail)
	pdf.SetXY(115, 58)
	custPhone := detail.CustomerPhone
	if custPhone == "" {
		custPhone = "-"
	}
	pdf.Cell(80, 5, custPhone)

	// 3. Metadata Row (Y = 88)
	// Draw horizontal line divider
	pdf.SetDrawColor(226, 232, 240)
	pdf.Line(15, 84, 195, 84)
	pdf.Line(15, 99, 195, 99)

	// Column 1: No Invoice
	pdf.SetFont("Arial", "B", 7.5)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(15, 86)
	pdf.Cell(50, 4, "NO. INVOICE")
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(15, 23, 42)
	pdf.SetXY(15, 91)
	pdf.Cell(50, 6, detail.OrderCode)

	// Column 2: Tanggal Order
	pdf.SetFont("Arial", "B", 7.5)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(75, 86)
	pdf.Cell(50, 4, "TANGGAL ORDER")
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(15, 23, 42)
	pdf.SetXY(75, 91)
	pdf.Cell(50, 6, formatIndonesianDate(detail.CreatedAt))

	// Column 3: Status
	pdf.SetFont("Arial", "B", 7.5)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(135, 86)
	pdf.Cell(50, 4, "STATUS")
	pdf.SetFont("Arial", "B", 10)
	pdf.SetTextColor(15, 23, 42)
	pdf.SetXY(135, 91)
	pdf.Cell(50, 6, mapStatusIndonesian(detail.Status))

	// 4. Table Header (Y = 108)
	pdf.SetFont("Arial", "B", 8)
	pdf.SetTextColor(71, 85, 105)

	pdf.SetXY(15, 106)
	pdf.Cell(90, 6, "ITEM / PRODUK")
	pdf.SetXY(110, 106)
	pdf.CellFormat(15, 6, "QTY", "", 0, "C", false, 0, "")
	pdf.SetXY(130, 106)
	pdf.CellFormat(30, 6, "HARGA SATUAN", "", 0, "R", false, 0, "")
	pdf.SetXY(165, 106)
	pdf.CellFormat(30, 6, "SUBTOTAL", "", 0, "R", false, 0, "")

	pdf.SetDrawColor(226, 232, 240)
	pdf.Line(15, 113, 195, 113)

	// 5. Table Rows (starting Y = 117)
	currentY := 117.0
	for _, item := range detail.Items {
		// Product name & Variant
		pdf.SetFont("Arial", "B", 9.5)
		pdf.SetTextColor(15, 23, 42)
		pdf.SetXY(15, currentY)
		pdf.Cell(90, 5, item.ProductName)

		pdf.SetFont("Arial", "", 8)
		pdf.SetTextColor(37, 99, 235) // blue
		pdf.SetXY(15, currentY+5)
		variantStr := "Varian: " + item.VariantName
		if item.VariantName == "" {
			variantStr = "Varian: Standar"
		}
		pdf.Cell(90, 4, variantStr)

		// Qty
		pdf.SetFont("Arial", "", 9.5)
		pdf.SetTextColor(15, 23, 42)
		pdf.SetXY(110, currentY)
		pdf.CellFormat(15, 5, fmt.Sprintf("%d", item.Quantity), "", 0, "C", false, 0, "")

		// Unit Price
		pdf.SetXY(130, currentY)
		pdf.CellFormat(30, 5, formatRupiah(item.Price), "", 0, "R", false, 0, "")

		// Subtotal
		pdf.SetXY(165, currentY)
		pdf.CellFormat(30, 5, formatRupiah(item.SubTotal), "", 0, "R", false, 0, "")

		// Divider line under item row
		currentY += 14.0
		pdf.SetDrawColor(241, 245, 249) // very light grey divider
		pdf.Line(15, currentY-2, 195, currentY-2)
	}

	// 6. Summary Card (on the right)
	currentY += 5.0

	// Draw stamp LUNAS on the left
	pdf.SetDrawColor(22, 163, 74)
	pdf.SetFillColor(240, 253, 244)
	pdf.Rect(15, currentY+5, 50, 15, "FD")

	pdf.SetFont("Arial", "B", 12)
	pdf.SetTextColor(22, 163, 74)
	pdf.SetXY(15, currentY+10)
	pdf.CellFormat(50, 5, "LUNAS", "", 0, "C", false, 0, "")

	pdf.SetDrawColor(226, 232, 240)
	pdf.SetFillColor(248, 250, 252)
	pdf.Rect(115, currentY, 80, 31, "FD")

	pdf.SetFont("Arial", "B", 7.5)
	pdf.SetTextColor(71, 85, 105)
	pdf.SetXY(120, currentY+3)
	pdf.Cell(70, 4, "RINGKASAN INVOICE")

	pdf.SetFont("Arial", "", 9)
	pdf.SetTextColor(71, 85, 105)
	pdf.SetXY(120, currentY+9)
	pdf.Cell(40, 5, "Subtotal")
	pdf.SetXY(160, currentY+9)
	pdf.CellFormat(30, 5, formatRupiah(detail.TotalPrice), "", 0, "R", false, 0, "")

	pdf.SetXY(120, currentY+15)
	pdf.Cell(40, 5, "Biaya Layanan")
	pdf.SetXY(160, currentY+15)
	pdf.CellFormat(30, 5, "Gratis", "", 0, "R", false, 0, "")

	pdf.SetDrawColor(226, 232, 240)
	pdf.Line(120, currentY+21, 190, currentY+21)

	pdf.SetFont("Arial", "B", 9.5)
	pdf.SetTextColor(15, 23, 42)
	pdf.SetXY(120, currentY+24)
	pdf.Cell(40, 5, "Total")
	pdf.SetXY(160, currentY+24)
	pdf.CellFormat(30, 5, formatRupiah(detail.TotalPrice), "", 0, "R", false, 0, "")

	// 7. Footer
	pdf.SetDrawColor(241, 245, 249)
	pdf.Line(15, 260, 195, 260)

	pdf.SetFont("Arial", "", 8)
	pdf.SetTextColor(100, 116, 139)
	pdf.SetXY(15, 264)
	footerMsg := "Terima kasih telah mempercayai Jaya Mandiri untuk kebutuhan cetak Anda. | Invoice diterbitkan otomatis oleh sistem."
	pdf.CellFormat(180, 5, footerMsg, "", 0, "C", false, 0, "")

	if c.Query("base64") == "true" {
		var buf bytes.Buffer
		err = pdf.Output(&buf)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal generate PDF"})
			return
		}
		encoded := base64.StdEncoding.EncodeToString(buf.Bytes())
		c.JSON(http.StatusOK, gin.H{"pdf": encoded})
		return
	}

	c.Header("Content-Type", "application/pdf")
	c.Header("Content-Disposition", fmt.Sprintf("inline; filename=invoice_%s.pdf", detail.OrderCode))

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

	// === 🧪 AI BLUR DETECTION ===
	ext := strings.ToLower(filepath.Ext(filePath))
	isImage := ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".webp"
	if isImage {
		physicalPath := strings.TrimPrefix(filePath, "/")
		isSharp, aiErr := checkBlurWithAI(physicalPath)
		if aiErr != nil {
			_ = os.Remove(physicalPath)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"message": fmt.Sprintf("Service AI sedang offline atau mengalami gangguan: %v. Harap nyalakan server python-ai.", aiErr),
			})
			return
		} else if !isSharp {
			_ = os.Remove(physicalPath)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Upload ditolak oleh AI: File desain yang Anda unggah terdeteksi buram/blur. Silakan unggah gambar dengan kualitas lebih tajam.",
			})
			return
		}
	}
	// ============================

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

	// === 🧪 AI BLUR DETECTION ===
	ext2 := strings.ToLower(filepath.Ext(filePath))
	isImage2 := ext2 == ".png" || ext2 == ".jpg" || ext2 == ".jpeg" || ext2 == ".webp"
	if isImage2 {
		physicalPath2 := strings.TrimPrefix(filePath, "/")
		isSharp2, aiErr2 := checkBlurWithAI(physicalPath2)
		if aiErr2 != nil {
			_ = os.Remove(physicalPath2)
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"message": fmt.Sprintf("Service AI sedang offline atau mengalami gangguan: %v. Harap nyalakan server python-ai.", aiErr2),
			})
			return
		} else if !isSharp2 {
			_ = os.Remove(physicalPath2)
			c.JSON(http.StatusBadRequest, gin.H{
				"message": "Upload ditolak oleh AI: File desain yang Anda unggah terdeteksi buram/blur. Silakan unggah gambar dengan kualitas lebih tajam.",
			})
			return
		}
	}
	// ============================

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

func formatRupiah(amount float64) string {
	p := int(amount)
	parts := []string{}
	for p > 0 {
		rem := p % 1000
		p = p / 1000
		if p > 0 {
			parts = append([]string{fmt.Sprintf("%03d", rem)}, parts...)
		} else {
			parts = append([]string{fmt.Sprintf("%d", rem)}, parts...)
		}
	}
	if len(parts) == 0 {
		return "Rp 0"
	}
	return "Rp " + strings.Join(parts, ".")
}

func mapStatusIndonesian(status string) string {
	switch status {
	case "waiting_payment":
		return "Menunggu Pembayaran"
	case "payment_verification":
		return "Menunggu Verifikasi"
	case "design_review":
		return "Review Desain"
	case "printing":
		return "Sedang Dicetak"
	case "ready":
		return "Siap Diambil"
	case "completed":
		return "Selesai"
	case "cancelled":
		return "Dibatalkan"
	default:
		return status
	}
}

func formatIndonesianDate(t time.Time) string {
	day := t.Day()
	year := t.Year()
	var month string
	switch t.Month() {
	case time.January:
		month = "Januari"
	case time.February:
		month = "Februari"
	case time.March:
		month = "Maret"
	case time.April:
		month = "April"
	case time.May:
		month = "Mei"
	case time.June:
		month = "Juni"
	case time.July:
		month = "Juli"
	case time.August:
		month = "Agustus"
	case time.September:
		month = "September"
	case time.October:
		month = "Oktober"
	case time.November:
		month = "November"
	case time.December:
		month = "Desember"
	}
	return fmt.Sprintf("%d %s %d", day, month, year)
}


