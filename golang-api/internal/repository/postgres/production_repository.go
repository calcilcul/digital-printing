package postgres

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"golang-api/internal/domain/production"
)

type productionRepository struct {
	db *sql.DB
}

func NewProductionRepository(db *sql.DB) production.Repository {
	return &productionRepository{db}
}

// =========================================================================
// START PRODUCTION (Mulai Cetak)
// =========================================================================
func (r *productionRepository) StartProduction(ctx context.Context, orderID int, staffID int, notes string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// ✅ FIX #6: Validasi semua order_items harus punya approved design
	// Cari order_items yang BELUM punya design_reviews dengan status 'approved'
	var unapprovedCount int
	err = tx.QueryRowContext(ctx, `
		SELECT COUNT(*)
		FROM order_items oi
		WHERE oi.order_id = $1
		  AND NOT EXISTS (
			SELECT 1
			FROM design_files df
			JOIN design_reviews dr ON dr.design_file_id = df.id
			WHERE df.order_item_id = oi.id
			  AND dr.status = 'approved'
		  )
	`, orderID).Scan(&unapprovedCount)
	if err != nil {
		return err
	}
	if unapprovedCount > 0 {
		return errors.New("produksi tidak dapat dimulai: masih ada item pesanan yang desainnya belum disetujui oleh staf")
	}

	// 1. Update status order menjadi 'printing' (Hanya bisa jika status 'paid')
	res, err := tx.ExecContext(ctx, `
		UPDATE orders 
		SET status = 'printing', updated_at = $1 
		WHERE id = $2 AND status = 'paid'`,
		time.Now(), orderID)
	if err != nil {
		return err
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("pesanan tidak ditemukan atau belum lunas")
	}

	// 2. Insert ke tabel production_logs
	_, err = tx.ExecContext(ctx, `
		INSERT INTO production_logs (order_id, staff_id, start_time, notes) 
		VALUES ($1, $2, $3, $4)`,
		orderID, staffID, time.Now(), notes)
	if err != nil {
		return err
	}

	// 3. Insert ke tabel order_status_logs
	_, err = tx.ExecContext(ctx, `
		INSERT INTO order_status_logs (order_id, status, changed_by, notes) 
		VALUES ($1, 'printing', $2, $3)`,
		orderID, staffID, notes)
	if err != nil {
		return err
	}

	// 4. Stok material dikurangi (material_stock_logs type='out' dan updates stock di materials)
	rows, err := tx.QueryContext(ctx, `
		SELECT pv.material_id, (pv.material_usage * oi.quantity) as usage_amount, o.order_code
		FROM order_items oi
		JOIN orders o ON o.id = oi.order_id
		JOIN product_variants pv ON pv.id = oi.variant_id
		WHERE oi.order_id = $1 AND pv.material_id IS NOT NULL
	`, orderID)
	if err != nil {
		return err
	}
	defer rows.Close()

	type MaterialDeduction struct {
		MaterialID  int
		UsageAmount float64
		OrderCode   string
	}

	var deductions []MaterialDeduction
	for rows.Next() {
		var d MaterialDeduction
		if err := rows.Scan(&d.MaterialID, &d.UsageAmount, &d.OrderCode); err != nil {
			return err
		}
		deductions = append(deductions, d)
	}

	for _, d := range deductions {
		// Update stock di tabel materials
		_, err = tx.ExecContext(ctx, `
			UPDATE materials 
			SET stock = stock - $1 
			WHERE id = $2`,
			d.UsageAmount, d.MaterialID)
		if err != nil {
			return err
		}

		// Insert ke tabel material_stock_logs
		_, err = tx.ExecContext(ctx, `
			INSERT INTO material_stock_logs (material_id, change_type, quantity, reference)
			VALUES ($1, 'out', $2, $3)`,
			d.MaterialID, d.UsageAmount, "Production Start: "+d.OrderCode)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// =========================================================================
// FINISH PRODUCTION (Selesai Cetak)
// =========================================================================
func (r *productionRepository) FinishProduction(ctx context.Context, orderID int, staffID int, notes string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Update status order menjadi 'ready' (Hanya bisa jika status 'printing')
	res, err := tx.ExecContext(ctx, `
		UPDATE orders 
		SET status = 'ready', updated_at = $1 
		WHERE id = $2 AND status = 'printing'`,
		time.Now(), orderID)
	if err != nil {
		return err
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("pesanan tidak ditemukan atau belum dicetak")
	}

	// 2. Update waktu selesai di tabel production_logs
	_, err = tx.ExecContext(ctx, `
		UPDATE production_logs 
		SET end_time = $1, notes = CONCAT(notes, ' | ', $2::text)
		WHERE order_id = $3 AND end_time IS NULL`,
		time.Now(), notes, orderID)
	if err != nil {
		return err
	}

	// 3. Insert ke tabel order_status_logs
	_, err = tx.ExecContext(ctx, `
		INSERT INTO order_status_logs (order_id, status, changed_by, notes) 
		VALUES ($1, 'ready', $2, $3)`,
		orderID, staffID, notes)
	if err != nil {
		return err
	}

	return tx.Commit()
}
