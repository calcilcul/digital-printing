package audit

import "context"

type Repository interface {
	// Tambahkan context.Context agar bisa melacak timeout dan pembatalan request [cite: 1259 16626]
	Create(ctx context.Context, log *AuditLog) error
}
