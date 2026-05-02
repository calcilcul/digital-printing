package production

import "time"

// ProductionLog merepresentasikan tabel production_logs di database
type ProductionLog struct {
	ID        int        `json:"id"`
	OrderID   int        `json:"order_id"`
	StaffID   int        `json:"staff_id"`
	StartTime time.Time  `json:"start_time"`
	EndTime   *time.Time `json:"end_time"` // Pakai pointer karena bisa bernilai NULL saat baru dimulai
	Notes     *string    `json:"notes"`
	CreatedAt time.Time  `json:"created_at"`
}
