package order

import "time"

// Order mencerminkan struktur tabel orders di PostgreSQL [cite: 1259 16666]
type Order struct {
	ID                  int        `json:"id"`
	UserID              int        `json:"user_id"`
	OrderCode           string     `json:"order_code"`            // Contoh: "ORD-2026-0001" [cite: 1259 16666]
	TotalPrice          float64    `json:"total_price"`           // Sesuai numeric(12,2) [cite: 1259 16666]
	Status              string     `json:"status"`                // ENUM: waiting_payment, production, dll [cite: 1247 1247]
	EstimatedFinishDate *time.Time  `json:"estimated_finish_date"` // Bisa NULL jika belum diproses [cite: 1259 16666]
	CreatedAt           time.Time   `json:"created_at"`            // Default CURRENT_TIMESTAMP [cite: 1259 16666]
	UpdatedAt           *time.Time  `json:"updated_at,omitempty"`  // Pointer karena bisa NULL [cite: 1259 16666]
	Items               []OrderItem `json:"items,omitempty"`       // Relasi ke order_items
}

// OrderItem mencerminkan item-item individual dalam satu Order
type OrderItem struct {
	ID          int     `json:"id"`
	OrderID     int     `json:"order_id"`
	ProductID   int     `json:"product_id"`
	VariantID   int     `json:"variant_id"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
	Notes       string  `json:"notes"`
	ProductName string  `json:"product_name,omitempty"` // Di-join dari tabel products
	VariantName string  `json:"variant_name,omitempty"` // Di-join dari tabel product_variants
}

// =========================================================================
// INVOICE / DETAIL PESANAN
// =========================================================================

// OrderDetail digunakan untuk response get detail pesanan / invoice
type OrderDetail struct {
	ID                  int               `json:"id"`
	OrderCode           string            `json:"order_code"`
	CustomerName        string            `json:"customer_name"`
	CustomerEmail       string            `json:"customer_email"`
	CustomerPhone       string            `json:"customer_phone"`
	Status              string            `json:"status"`
	TotalPrice          float64           `json:"total_price"`
	EstimatedFinishDate *time.Time        `json:"estimated_finish_date"`
	CreatedAt           time.Time         `json:"created_at"`
	UpdatedAt           *time.Time        `json:"updated_at,omitempty"`
	Items               []OrderItemDetail `json:"items"`
	Payment             *PaymentInfo      `json:"payment,omitempty"`
}

type OrderItemDetail struct {
	ID          int     `json:"id"`
	ProductName string  `json:"product_name"`
	VariantName string  `json:"variant_name"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"` // Harga satuan varian saat dipesan
	SubTotal    float64 `json:"sub_total"`
	Notes       string  `json:"notes,omitempty"`
}

type PaymentInfo struct {
	TransactionCode string     `json:"transaction_code"`
	PaymentMethod   string     `json:"payment_method"`
	Amount          float64    `json:"amount"`
	PaymentStatus   string     `json:"payment_status"`
	VerifiedAt      *time.Time `json:"verified_at,omitempty"`
}
