package postgres

import (
	"context"
	"database/sql"

	"golang-api/internal/domain/audit"
)

type auditRepository struct {
	db *sql.DB
}

// NewAuditRepository menginisialisasi repository audit dengan koneksi database
func NewAuditRepository(db *sql.DB) audit.Repository {
	return &auditRepository{db: db}
}

// Create menyisipkan catatan aktivitas user ke tabel audit_logs [cite: 1259 16531]
func (r *auditRepository) Create(ctx context.Context, a *audit.AuditLog) error {
	// Query disesuaikan dengan skema tabel audit_logs kamu
	query := `
		INSERT INTO audit_logs (
			user_id,
			role,
			action,
			entity_type,
			entity_id,
			ip_address,
			user_agent,
			created_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
	`

	// Menggunakan ExecContext untuk mendukung pembatalan request (timeout) [cite: 1259 16626]
	_, err := r.db.ExecContext(
		ctx,
		query,
		a.UserID,
		a.Role,
		a.Action,
		a.EntityType, // Value ini akan masuk ke kolom entity_type
		a.EntityID,
		a.IPAddress,
		a.UserAgent,
	)

	return err
}
