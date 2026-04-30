package payment

import "time"

type Payment struct {
	ID              int        `json:"id"`
	OrderID         int        `json:"order_id"`
	MethodID        int        `json:"payment_method_id"`
	TransactionCode string     `json:"transaction_code"` // Penting untuk tracking [cite: 1259 16710]
	Amount          float64    `json:"amount"`
	Proof           string     `json:"payment_proof"`
	Status          string     `json:"payment_status"` // ENUM: pending, approved, rejected [cite: 1247 16406]
	VerifiedBy      *int       `json:"verified_by"`    // Pakai pointer karena bisa NULL di DB [cite: 1259 16710]
	VerifiedAt      *time.Time `json:"verified_at"`    // Pakai pointer karena bisa NULL [cite: 1259 16710]
	CreatedAt       time.Time  `json:"created_at"`
}
