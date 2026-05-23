package order

import "time"

// Order mencerminkan struktur tabel orders di PostgreSQL
type Order struct {
	ID                    int        `json:"id"`
	UserID                int        `json:"user_id"`
	OrderCode             string     `json:"order_code"`
	TotalPrice            float64    `json:"total_price"`
	Status                string     `json:"status"`
	EstimatedFinishDate   *time.Time `json:"estimated_finish_date"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             *time.Time `json:"updated_at,omitempty"`
	Items                 []OrderItem `json:"items,omitempty"`
	PaymentID             int        `json:"payment_id"`
	PaymentProofUrl       string     `json:"payment_proof_url"`
	RevisionCount         int        `json:"revision_count"`
	RevisionNotes         string     `json:"revision_notes,omitempty"`
	PaymentRejectedReason string     `json:"payment_rejected_reason,omitempty"`
}

// OrderItem mencerminkan item-item individual dalam satu Order
type OrderItem struct {
	ID             int     `json:"id"`
	OrderID        int     `json:"order_id"`
	ProductID      int     `json:"product_id"`
	VariantID      int     `json:"variant_id"`
	Quantity       int     `json:"quantity"`
	Price          float64 `json:"price"`
	Notes          string  `json:"notes"`
	ProductName    string  `json:"product_name,omitempty"` // Di-join dari tabel products
	VariantName    string  `json:"variant_name,omitempty"` // Di-join dari tabel product_variants
	DesignFileID   int     `json:"design_file_id"`
	DesignFilePath string  `json:"design_file_path"`
	DesignVersion  int     `json:"design_version"`
	DesignStatus   string  `json:"design_status"`
	DesignNotes    string  `json:"design_notes"`
}

// =========================================================================
// INVOICE / DETAIL PESANAN
// =========================================================================

// OrderDetail digunakan untuk response get detail pesanan / invoice
type OrderDetail struct {
	ID                    int               `json:"id"`
	OrderCode             string            `json:"order_code"`
	CustomerName          string            `json:"customer_name"`
	CustomerEmail         string            `json:"customer_email"`
	CustomerPhone         string            `json:"customer_phone"`
	Status                string            `json:"status"`
	TotalPrice            float64           `json:"total_price"`
	EstimatedFinishDate   *time.Time        `json:"estimated_finish_date"`
	CreatedAt             time.Time         `json:"created_at"`
	UpdatedAt             *time.Time        `json:"updated_at,omitempty"`
	Items                 []OrderItemDetail `json:"items"`
	Payment               *PaymentInfo      `json:"payment,omitempty"`
	StatusLogs            []OrderStatusLog  `json:"status_logs,omitempty"`
	RevisionCount         int               `json:"revision_count"`
	RevisionNotes         string            `json:"revision_notes,omitempty"`
	PaymentRejectedReason string            `json:"payment_rejected_reason,omitempty"`
}

// OrderStatusLog mencerminkan log riwayat status pesanan
type OrderStatusLog struct {
	ID          int       `json:"id"`
	OrderID     int       `json:"order_id"`
	Status      string    `json:"status"`
	ChangedBy   int       `json:"changed_by"`
	ChangedName string    `json:"changed_name"` // Di-join dari users
	Notes       string    `json:"notes"`
	CreatedAt   time.Time `json:"created_at"`
}

type OrderItemDetail struct {
	ID             int     `json:"id"`
	ProductName    string  `json:"product_name"`
	VariantName    string  `json:"variant_name"`
	Quantity       int     `json:"quantity"`
	Price          float64 `json:"price"` // Harga satuan varian saat dipesan
	SubTotal       float64 `json:"sub_total"`
	Notes          string  `json:"notes,omitempty"`
	DesignFileID   int     `json:"design_file_id"`
	DesignFilePath string  `json:"design_file_path"`
	DesignVersion  int     `json:"design_version"`
	DesignStatus   string  `json:"design_status"`
	DesignNotes    string  `json:"design_notes"`
}

type PaymentInfo struct {
	TransactionCode string     `json:"transaction_code"`
	PaymentMethod   string     `json:"payment_method"`
	Amount          float64    `json:"amount"`
	PaymentStatus   string     `json:"payment_status"`
	VerifiedAt      *time.Time `json:"verified_at,omitempty"`
	PaymentProof    string     `json:"payment_proof,omitempty"`
}
