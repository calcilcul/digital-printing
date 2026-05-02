package product

import "time"

// ProductVariant mencerminkan tabel product_variants di PostgreSQL
type ProductVariant struct {
	ID            int        `json:"id"`
	ProductID     int        `json:"product_id"`
	SKU           string     `json:"sku"`
	VariantName   string     `json:"variant_name"`
	Price         float64    `json:"price"`
	Stock         int        `json:"stock"`
	IsActive      bool       `json:"is_active"`
	MaterialID    *int       `json:"material_id"`    // Fitur otomatis potong stok gudang
	MaterialUsage float64    `json:"material_usage"` // Fitur otomatis potong stok gudang
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     *time.Time `json:"updated_at,omitempty"`
}

// Product mencerminkan struktur tabel products di PostgreSQL [cite: 1259 16548]
type Product struct {
	ID            int              `json:"id"`
	CategoryID    *int             `json:"category_id"` // Menggunakan pointer karena category_id bisa NULL [cite: 1259 16548]
	Name          string           `json:"name"`
	Description   string           `json:"description"`
	BasePrice     float64          `json:"base_price"`     // numeric(12,2) di DB dipetakan ke float64 [cite: 1259 16548]
	EstimatedDays int              `json:"estimated_days"` // Estimasi waktu produksi dalam hari [cite: 1259 16548]
	IsActive      bool             `json:"is_active"`
	Variants      []ProductVariant `json:"variants,omitempty"` // Relasi ke product_variants
	CreatedAt     time.Time        `json:"created_at"`
	UpdatedAt     *time.Time       `json:"updated_at,omitempty"`
	DeletedAt     *time.Time       `json:"deleted_at,omitempty"` // Digunakan untuk soft delete [cite: 1259 16548]
}

// ProductVariantRequest DTO untuk input varian
type ProductVariantRequest struct {
	ID            int     `json:"id"` // Jika > 0 berarti update varian lama, jika 0 berarti varian baru
	SKU           string  `json:"sku" binding:"required"`
	VariantName   string  `json:"variant_name" binding:"required"`
	Price         float64 `json:"price" binding:"required"`
	Stock         int     `json:"stock"`
	IsActive      *bool   `json:"is_active" binding:"required"`
	MaterialID    *int    `json:"material_id"`
	MaterialUsage float64 `json:"material_usage"`
}

// ProductRequest DTO untuk input produk (Create/Update)
type ProductRequest struct {
	CategoryID    *int                    `json:"category_id"`
	Name          string                  `json:"name" binding:"required"`
	Description   string                  `json:"description"`
	BasePrice     float64                 `json:"base_price" binding:"required"`
	EstimatedDays int                     `json:"estimated_days"`
	IsActive      *bool                   `json:"is_active" binding:"required"`
	Variants      []ProductVariantRequest `json:"variants" binding:"required,dive"`
}
