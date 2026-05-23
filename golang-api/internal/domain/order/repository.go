package order

import "context"

type Repository interface {
	// ========================
	// BASIC
	// ========================
	Create(ctx context.Context, o *Order, items []OrderItem) error

	// ========================
	// MAIN FLOW
	// ========================
	Checkout(ctx context.Context, userID int) (orderID int, orderCode string, total float64, err error)

	// BuyNow: beli langsung 1 item tanpa keranjang
	BuyNow(ctx context.Context, userID int, productID int, variantID int, quantity int, notes string) (orderID int, orderCode string, total float64, err error)

	// ========================
	// DESIGN UPLOAD
	// ========================
	// UploadDesign: simpan desain untuk 1 order item, cek apakah semua item sudah ada desain → update status
	UploadDesign(ctx context.Context, orderID int, orderItemID int, filePath string, userID int) error

	// ReuploadDesign: upload ulang desain setelah revisi staff → status kembali ke design_review
	ReuploadDesign(ctx context.Context, orderID int, orderItemID int, filePath string, userID int) error

	// ========================
	// PAYMENT UPLOAD
	// ========================
	// UploadPayment: simpan bukti bayar ke payment_transactions → status: payment_verification
	UploadPayment(ctx context.Context, orderID int, userID int, filePath string, amount float64) error

	// ReuploadPayment: upload ulang bukti bayar setelah ditolak → status: payment_verification
	ReuploadPayment(ctx context.Context, orderID int, userID int, filePath string) error

	// ========================
	// STAFF ACTIONS
	// ========================
	// ApprovePayment: validasi bukti bayar → status: design_review
	ApprovePayment(ctx context.Context, orderID int, staffID int) error

	// RejectPayment: tolak bukti bayar + alasan → status: payment_rejected
	RejectPayment(ctx context.Context, orderID int, staffID int, reason string) error

	// ApproveDesign: setujui desain → status: printing
	ApproveDesign(ctx context.Context, orderID int, staffID int) error

	// RequestRevision: minta revisi desain + catatan (maks 3x) → status: revision_requested
	RequestRevision(ctx context.Context, orderID int, staffID int, notes string) error

	// StartPrinting: mulai cetak → status: printing (sudah ditangani ApproveDesign, method ini opsional)
	StartPrinting(ctx context.Context, orderID int, staffID int) error

	// FinishPrinting: selesai cetak → status: ready
	FinishPrinting(ctx context.Context, orderID int, staffID int) error

	// ========================
	// ORDER MANAGEMENT
	// ========================
	FindByID(ctx context.Context, orderID int) (*Order, error)

	FindDetailByID(ctx context.Context, orderID int) (*OrderDetail, error)

	Cancel(ctx context.Context, orderID int, userID int) error

	UpdateStatus(ctx context.Context, orderID int, status string, changedBy int, notes string) error

	// ========================
	// QUERY FOR CUSTOMER & OWNER
	// ========================
	GetOrdersByUserID(ctx context.Context, userID int) ([]Order, error)

	GetAllOrders(ctx context.Context) ([]Order, error)

	CompleteOrder(ctx context.Context, orderID int, userID int) error
}
