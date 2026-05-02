package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"golang-api/internal/domain/payment"
)

type paymentRepository struct {
	db *sql.DB
}

// NewPaymentRepository menginisialisasi repository payment dengan koneksi DB
func NewPaymentRepository(db *sql.DB) payment.Repository {
	return &paymentRepository{db: db}
}

// =========================================================================
// CREATE PAYMENT
// =========================================================================
func (r *paymentRepository) Create(ctx context.Context, p *payment.Payment) error {
	// Sesuai skema: order_id, payment_method_id, transaction_code, amount, proof, status [cite: 1259 16710]
	query := `
		INSERT INTO payment_transactions 
		(order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id
	`
	err := r.db.QueryRowContext(ctx, query,
		p.OrderID,
		p.MethodID,
		p.TransactionCode,
		p.Amount,
		p.Proof,
		p.Status,
	).Scan(&p.ID)

	return err
}

// =========================================================================
// UPDATE STATUS (TRANSACTIONAL)
// =========================================================================
func (r *paymentRepository) UpdateStatus(ctx context.Context, id int, status string, verifiedBy int, orderID int, orderStatus string) error {
	// Memulai Transaksi Database agar tabel Payment dan Order terupdate bersamaan [cite: 1259 16666, 16710]
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}

	// 1. Update status pembayaran [cite: 1259 16710]
	queryPayment := `
		UPDATE payment_transactions
		SET payment_status = $1, 
		    verified_by = $2, 
		    verified_at = NOW()
		WHERE id = $3
	`
	res, err := tx.ExecContext(ctx, queryPayment, status, verifiedBy, id)
	if err != nil {
		tx.Rollback()
		return err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		tx.Rollback()
		return errors.New("transaksi pembayaran tidak ditemukan")
	}

	// 2. Update status order [cite: 1259 16666]
	queryOrder := `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`
	_, err = tx.ExecContext(ctx, queryOrder, orderStatus, orderID)
	if err != nil {
		tx.Rollback()
		return err
	}

	// 3. LOGIKA OTOMATIS POTONG STOK JIKA APPROVED (paid)
	if orderStatus == "paid" {
		// Ambil semua item pesanan dan cek material usagenya
		queryUsage := `
			SELECT oi.quantity, pv.material_id, pv.material_usage 
			FROM order_items oi
			JOIN product_variants pv ON oi.variant_id = pv.id
			WHERE oi.order_id = $1 AND pv.material_id IS NOT NULL AND pv.material_usage > 0
		`
		rows, err := tx.QueryContext(ctx, queryUsage, orderID)
		if err != nil {
			tx.Rollback()
			return err
		}
		
		type usageData struct {
			Qty           int
			MaterialID    int
			MaterialUsage float64
		}
		var usages []usageData
		for rows.Next() {
			var u usageData
			if err := rows.Scan(&u.Qty, &u.MaterialID, &u.MaterialUsage); err != nil {
				rows.Close()
				tx.Rollback()
				return err
			}
			usages = append(usages, u)
		}
		rows.Close()

		for _, u := range usages {
			totalUsage := float64(u.Qty) * u.MaterialUsage
			
			// Kurangi stok
			_, err = tx.ExecContext(ctx, "UPDATE materials SET stock = stock - $1 WHERE id = $2", totalUsage, u.MaterialID)
			if err != nil {
				tx.Rollback()
				return err
			}

			// Catat ke log
			ref := fmt.Sprintf("Order Paid #%d", orderID)
			_, err = tx.ExecContext(ctx, "INSERT INTO material_stock_logs (material_id, change_type, quantity, reference, created_at) VALUES ($1, 'out', $2, $3, NOW())", u.MaterialID, totalUsage, ref)
			if err != nil {
				tx.Rollback()
				return err
			}
		}
	}

	// Commit jika semua update berhasil
	return tx.Commit()
}

// =========================================================================
// FIND BY ID
// =========================================================================
func (r *paymentRepository) FindByID(ctx context.Context, id int) (*payment.Payment, error) {
	var p payment.Payment
	query := `
		SELECT id, order_id, payment_method_id, transaction_code, amount, payment_proof, payment_status
		FROM payment_transactions
		WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, id).Scan(
		&p.ID,
		&p.OrderID,
		&p.MethodID,
		&p.TransactionCode,
		&p.Amount,
		&p.Proof,
		&p.Status,
	)

	if err == sql.ErrNoRows {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}

	return &p, nil
}
