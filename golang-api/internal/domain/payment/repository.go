package payment

import "context"

type Repository interface {
	// Harus ada 'ctx context.Context' agar sinkron dengan repository [cite: 1259 16710]
	Create(ctx context.Context, p *Payment) error

	// Parameter 'orderID' dan 'orderStatus' wajib ada untuk transaksi database [cite: 1259 16666, 16710]
	UpdateStatus(ctx context.Context, id int, status string, verifiedBy int, orderID int, orderStatus string) error

	FindByID(ctx context.Context, id int) (*Payment, error)
}
