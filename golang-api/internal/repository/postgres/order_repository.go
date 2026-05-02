package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"golang-api/internal/domain/order"
)

type orderRepository struct {
	db *sql.DB
}

func NewOrderRepository(db *sql.DB) order.Repository {
	return &orderRepository{db: db}
}

// =========================================================================
// CREATE
// =========================================================================
func (r *orderRepository) Create(ctx context.Context, o *order.Order, items []order.OrderItem) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	var total float64
	// 1. Validasi Variant & Hitung Total Harga murni dari DB
	for i := range items {
		var price float64
		err := tx.QueryRowContext(ctx, "SELECT price FROM product_variants WHERE id = $1", items[i].VariantID).Scan(&price)
		if err == sql.ErrNoRows {
			return fmt.Errorf("variant id %d tidak ditemukan", items[i].VariantID)
		}
		if err != nil {
			return err
		}
		items[i].Price = price
		total += price * float64(items[i].Quantity)
	}

	o.TotalPrice = total

	// 2. Simpan Header Order
	queryOrder := `
		INSERT INTO orders (user_id, order_code, total_price, status, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id
	`
	err = tx.QueryRowContext(ctx, queryOrder, o.UserID, o.OrderCode, o.TotalPrice, o.Status).Scan(&o.ID)
	if err != nil {
		return err
	}

	// 3. Simpan Item Order
	for _, item := range items {
		queryItem := `
			INSERT INTO order_items (order_id, product_id, variant_id, quantity, price, notes)
			VALUES ($1, $2, $3, $4, $5, $6)
		`
		_, err = tx.ExecContext(ctx, queryItem, o.ID, item.ProductID, item.VariantID, item.Quantity, item.Price, item.Notes)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// =========================================================================
// CHECKOUT (TRANSACTION SAFE)
// =========================================================================
func (r *orderRepository) Checkout(ctx context.Context, userID int) (int, string, float64, error) {
	// Memulai Transaksi dengan Context
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return 0, "", 0, err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// 1. Ambil ID Keranjang User
	var cartID int
	err = tx.QueryRowContext(ctx, "SELECT id FROM carts WHERE user_id = $1", userID).Scan(&cartID)
	if err == sql.ErrNoRows {
		return 0, "", 0, fmt.Errorf("keranjang tidak ditemukan")
	}
	if err != nil {
		return 0, "", 0, err
	}

	// 2. Ambil Item Keranjang Beserta Detail Spesifikasi Cetak
	rows, err := tx.QueryContext(ctx, `
		SELECT ci.product_id, ci.quantity, pv.price, 
		       ci.variant_id, ci.notes
		FROM cart_items ci
		JOIN product_variants pv ON pv.id = ci.variant_id
		WHERE ci.cart_id = $1
	`, cartID)
	if err != nil {
		return 0, "", 0, err
	}
	defer rows.Close()

	type item struct {
		productID   int
		quantity    int
		price       float64
		variantID   int
		notes       string
	}

	var items []item
	var total float64

	for rows.Next() {
		var i item
		err = rows.Scan(&i.productID, &i.quantity, &i.price, &i.variantID, &i.notes)
		if err != nil {
			return 0, "", 0, err
		}
		total += i.price * float64(i.quantity)
		items = append(items, i)
	}

	if len(items) == 0 {
		return 0, "", 0, fmt.Errorf("keranjang kosong")
	}

	// 3. Buat Order Utama
	orderCode := fmt.Sprintf("ORD-%d%d", userID, time.Now().Unix())
	var orderID int
	queryOrder := `
		INSERT INTO orders (user_id, order_code, total_price, status, created_at)
		VALUES ($1, $2, $3, 'waiting_payment', NOW())
		RETURNING id
	`
	err = tx.QueryRowContext(ctx, queryOrder, userID, orderCode, total).Scan(&orderID)
	if err != nil {
		return 0, "", 0, err
	}

	// 4. Pindahkan Item Keranjang ke Order Items (Beserta Spesifikasi)
	for _, i := range items {
		queryItems := `
			INSERT INTO order_items (order_id, product_id, quantity, price, variant_id, notes)
			VALUES ($1, $2, $3, $4, $5, $6)
		`
		_, err = tx.ExecContext(ctx, queryItems,
			orderID, i.productID, i.quantity, i.price, i.variantID, i.notes,
		)
		if err != nil {
			return 0, "", 0, err
		}
	}

	// 5. Kosongkan Keranjang Setelah Checkout Berhasil
	_, err = tx.ExecContext(ctx, "DELETE FROM cart_items WHERE cart_id = $1", cartID)
	if err != nil {
		return 0, "", 0, err
	}

	// Selesaikan Transaksi
	if err = tx.Commit(); err != nil {
		return 0, "", 0, err
	}

	return orderID, orderCode, total, nil
}

// =========================================================================
// FIND BY ID
// =========================================================================
func (r *orderRepository) FindByID(ctx context.Context, orderID int) (*order.Order, error) {
	var o order.Order
	query := `SELECT id, user_id, status FROM orders WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, orderID).Scan(&o.ID, &o.UserID, &o.Status)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &o, nil
}

// =========================================================================
// FIND DETAIL BY ID (INVOICE)
// =========================================================================
func (r *orderRepository) FindDetailByID(ctx context.Context, orderID int) (*order.OrderDetail, error) {
	var detail order.OrderDetail

	// 1. Get Header (Order & User & Payment)
	queryHeader := `
		SELECT 
			o.id, o.order_code, o.status, o.total_price, o.estimated_finish_date, o.created_at, o.updated_at,
			u.name, u.email, COALESCE(u.phone, ''),
			pt.transaction_code, pm.name, pt.amount, pt.payment_status, pt.verified_at
		FROM orders o
		JOIN users u ON u.id = o.user_id
		LEFT JOIN payment_transactions pt ON pt.order_id = o.id
		LEFT JOIN payment_methods pm ON pm.id = pt.payment_method_id
		WHERE o.id = $1
	`

	var ptCode, pmName, ptStatus sql.NullString
	var ptAmount sql.NullFloat64
	var ptVerifiedAt sql.NullTime

	err := r.db.QueryRowContext(ctx, queryHeader, orderID).Scan(
		&detail.ID, &detail.OrderCode, &detail.Status, &detail.TotalPrice, &detail.EstimatedFinishDate, &detail.CreatedAt, &detail.UpdatedAt,
		&detail.CustomerName, &detail.CustomerEmail, &detail.CustomerPhone,
		&ptCode, &pmName, &ptAmount, &ptStatus, &ptVerifiedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("pesanan tidak ditemukan")
	}
	if err != nil {
		return nil, err
	}

	if ptStatus.Valid {
		detail.Payment = &order.PaymentInfo{
			TransactionCode: ptCode.String,
			PaymentMethod:   pmName.String,
			Amount:          ptAmount.Float64,
			PaymentStatus:   ptStatus.String,
		}
		if ptVerifiedAt.Valid {
			detail.Payment.VerifiedAt = &ptVerifiedAt.Time
		}
	}

	// 2. Get Items
	queryItems := `
		SELECT 
			oi.id, p.name, COALESCE(pv.variant_name, ''), oi.quantity, oi.price, (oi.quantity * oi.price) as sub_total, COALESCE(oi.notes, '')
		FROM order_items oi
		JOIN products p ON p.id = oi.product_id
		LEFT JOIN product_variants pv ON pv.id = oi.variant_id
		WHERE oi.order_id = $1
	`

	rows, err := r.db.QueryContext(ctx, queryItems, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []order.OrderItemDetail
	for rows.Next() {
		var item order.OrderItemDetail
		if err := rows.Scan(
			&item.ID, &item.ProductName, &item.VariantName, &item.Quantity, &item.Price, &item.SubTotal, &item.Notes,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	detail.Items = items
	return &detail, nil
}

// =========================================================================
// CANCEL ORDER
// =========================================================================
func (r *orderRepository) Cancel(ctx context.Context, orderID int, userID int) error {
	// 1. Cek status order saat ini
	var currentStatus string
	err := r.db.QueryRowContext(ctx, "SELECT status FROM orders WHERE id = $1 AND user_id = $2", orderID, userID).Scan(&currentStatus)
	if err == sql.ErrNoRows {
		return fmt.Errorf("pesanan tidak ditemukan atau akses ditolak")
	}
	if err != nil {
		return err
	}

	// 2. Cegah pembatalan jika order sudah masuk tahap produksi atau selesai
	if currentStatus == "printing" || currentStatus == "ready" || currentStatus == "completed" || currentStatus == "cancelled" {
		return fmt.Errorf("tidak dapat membatalkan pesanan karena status saat ini adalah: %s", currentStatus)
	}

	// 3. Lakukan pembatalan
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = $1`
	_, err = tx.ExecContext(ctx, query, orderID)
	if err != nil {
		return err
	}
	
	// 4. Logika pengembalian stok (Refund Stock) untuk status 'paid' 
	if currentStatus == "paid" {
		queryUsage := `
			SELECT oi.quantity, pv.material_id, pv.material_usage 
			FROM order_items oi
			JOIN product_variants pv ON oi.variant_id = pv.id
			WHERE oi.order_id = $1 AND pv.material_id IS NOT NULL AND pv.material_usage > 0
		`
		rows, err := tx.QueryContext(ctx, queryUsage, orderID)
		if err != nil {
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
				return err
			}
			usages = append(usages, u)
		}
		rows.Close()

		for _, u := range usages {
			totalUsage := float64(u.Qty) * u.MaterialUsage
			
			// Kembalikan stok
			_, err = tx.ExecContext(ctx, "UPDATE materials SET stock = stock + $1 WHERE id = $2", totalUsage, u.MaterialID)
			if err != nil {
				return err
			}

			// Catat ke log
			ref := fmt.Sprintf("Order Cancelled #%d (Refund)", orderID)
			_, err = tx.ExecContext(ctx, "INSERT INTO material_stock_logs (material_id, change_type, quantity, reference, created_at) VALUES ($1, 'in', $2, $3, NOW())", u.MaterialID, totalUsage, ref)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

// =========================================================================
// UPDATE STATUS
// =========================================================================
func (r *orderRepository) UpdateStatus(ctx context.Context, orderID int, status string) error {
	query := `UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2`
	res, err := r.db.ExecContext(ctx, query, status, orderID)
	if err != nil {
		return err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("pesanan tidak ditemukan")
	}
	return nil
}

// =========================================================================
// GET ORDERS BY USER ID (Customer Dashboard)
// =========================================================================
func (r *orderRepository) GetOrdersByUserID(ctx context.Context, userID int) ([]order.Order, error) {
	query := `
		SELECT id, user_id, order_code, total_price, status, created_at
		FROM orders
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	return r.scanOrders(ctx, query, userID)
}

// =========================================================================
// GET ALL ORDERS (Owner/Admin Dashboard)
// =========================================================================
func (r *orderRepository) GetAllOrders(ctx context.Context) ([]order.Order, error) {
	query := `
		SELECT id, user_id, order_code, total_price, status, created_at
		FROM orders
		ORDER BY created_at DESC
	`
	return r.scanOrders(ctx, query)
}

// scanOrders adalah helper internal untuk scan rows orders dengan args variadic
func (r *orderRepository) scanOrders(ctx context.Context, query string, args ...interface{}) ([]order.Order, error) {
	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var orders []order.Order
	for rows.Next() {
		var o order.Order
		if err := rows.Scan(&o.ID, &o.UserID, &o.OrderCode, &o.TotalPrice, &o.Status, &o.CreatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, o)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	// Fetch order items for each order (with product & variant names)
	for i := range orders {
		itemQuery := `
			SELECT oi.id, oi.order_id, oi.product_id, COALESCE(oi.variant_id, 0), oi.quantity, oi.price, 
			       COALESCE(oi.notes, ''),
			       COALESCE(p.name, ''),
			       COALESCE(pv.variant_name, '')
			FROM order_items oi
			LEFT JOIN products p ON p.id = oi.product_id
			LEFT JOIN product_variants pv ON pv.id = oi.variant_id
			WHERE oi.order_id = $1
		`
		itemRows, err := r.db.QueryContext(ctx, itemQuery, orders[i].ID)
		if err != nil {
			return nil, err
		}

		var items []order.OrderItem
		for itemRows.Next() {
			var item order.OrderItem
			if err := itemRows.Scan(
				&item.ID, &item.OrderID, &item.ProductID, &item.VariantID,
				&item.Quantity, &item.Price, &item.Notes,
				&item.ProductName, &item.VariantName,
			); err != nil {
				itemRows.Close()
				return nil, err
			}
			items = append(items, item)
		}
		itemRows.Close()
		if err := itemRows.Err(); err != nil {
			return nil, err
		}

		if items == nil {
			items = []order.OrderItem{}
		}
		orders[i].Items = items
	}

	return orders, nil
}

// =========================================================================
// COMPLETE ORDER (Customer mengonfirmasi barang diterima)
// =========================================================================
func (r *orderRepository) CompleteOrder(ctx context.Context, orderID int, userID int) error {
	query := `
		UPDATE orders 
		SET status = 'completed', updated_at = NOW() 
		WHERE id = $1 AND user_id = $2 AND status = 'ready'
	`
	res, err := r.db.ExecContext(ctx, query, orderID, userID)
	if err != nil {
		return err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return fmt.Errorf("pesanan tidak ditemukan, bukan milik anda, atau statusnya bukan 'ready'")
	}
	return nil
}
