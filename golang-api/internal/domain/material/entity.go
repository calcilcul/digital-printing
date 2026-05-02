package material

import "time"

// Material merepresentasikan tabel materials
type Material struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Stock     float64   `json:"stock"`
	Unit      string    `json:"unit"`
	CreatedAt time.Time `json:"created_at"`
}

// MaterialStockLog merepresentasikan tabel material_stock_logs
type MaterialStockLog struct {
	ID         int       `json:"id"`
	MaterialID int       `json:"material_id"`
	ChangeType string    `json:"change_type"` // 'in' atau 'out'
	Quantity   float64   `json:"quantity"`
	Reference  string    `json:"reference"`
	CreatedAt  time.Time `json:"created_at"`
}

// MaterialRequest digunakan untuk payload saat membuat/update material baru
type MaterialRequest struct {
	Name  string  `json:"name" binding:"required"`
	Stock float64 `json:"stock"` // Bisa 0 saat awal dibuat
	Unit  string  `json:"unit" binding:"required"`
}

// MaterialStockAdjustmentRequest digunakan oleh admin untuk nambah/kurang stok manual (Stock Opname)
type MaterialStockAdjustmentRequest struct {
	ChangeType string  `json:"change_type" binding:"required,oneof=in out"`
	Quantity   float64 `json:"quantity" binding:"required,gt=0"`
	Reference  string  `json:"reference"`
}
