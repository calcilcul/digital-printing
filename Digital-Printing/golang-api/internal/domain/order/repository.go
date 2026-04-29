package order

import "context"

type Repository interface {
	// ========================
	// BASIC
	// ========================
	// Tambahkan context.Context agar sinkron dengan pemanggilan usecase [cite: 1259 16626]
	Create(ctx context.Context, o *Order, items []OrderItem) error

	// ========================
	// MAIN FLOW
	// ========================
	Checkout(ctx context.Context, userID int) (orderID int, orderCode string, total float64, err error)

	// ========================
	// ORDER MANAGEMENT
	// ========================
	// Fungsi ini dipanggil di usecase payment, wajib pakai context [cite: 1259 16666]
	FindByID(ctx context.Context, orderID int) (*Order, error)

	Cancel(ctx context.Context, orderID int, userID int) error

	// Baris 86 di usecase kamu akan sembuh setelah menambahkan ctx di sini [cite: 1259 16666]
	UpdateStatus(ctx context.Context, orderID int, status string) error

	// ========================
	// QUERY FOR CUSTOMER & OWNER
	// ========================
	// GetOrdersByUserID mengembalikan semua pesanan milik satu customer
	GetOrdersByUserID(ctx context.Context, userID int) ([]Order, error)

	// GetAllOrders mengembalikan semua pesanan (untuk dashboard owner/admin)
	GetAllOrders(ctx context.Context) ([]Order, error)

	// CompleteOrder menandai pesanan selesai (hanya jika statusnya ready)
	CompleteOrder(ctx context.Context, orderID int, userID int) error
}
