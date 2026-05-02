package cart

import "context"

type Repository interface {
	// Add sekarang memerlukan context, userID (dari JWT), dan data item [cite: 1259 16643]
	Add(ctx context.Context, userID int, item *CartItem) error

	// GetByUserID membutuhkan context untuk menjalankan query Postgres [cite: 1259 16626]
	GetByUserID(ctx context.Context, userID int) ([]map[string]interface{}, error)

	// Update & Delete sekarang menggunakan cartItemID (Primary Key) agar lebih presisi [cite: 1259 16643]
	Update(ctx context.Context, cartItemID int, qty int) error
	Delete(ctx context.Context, cartItemID int) error
}
