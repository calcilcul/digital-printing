package postgres

import (
	"context"
	"database/sql"
	"errors"

	"golang-api/internal/domain/cart"
)

type cartRepository struct {
	db *sql.DB
}

func NewCartRepository(db *sql.DB) cart.Repository {
	return &cartRepository{db: db}
}

// =========================================================================
// ADD TO CART
// =========================================================================
func (r *cartRepository) Add(ctx context.Context, userID int, item *cart.CartItem) error {
	// 1. GET / CREATE CART [cite: 1259 16626]
	var cartID int
	err := r.db.QueryRowContext(ctx, "SELECT id FROM carts WHERE user_id = $1", userID).Scan(&cartID)

	if err == sql.ErrNoRows {
		// Jika keranjang belum ada, buat baru dan ambil ID-nya [cite: 1259 16626]
		err = r.db.QueryRowContext(ctx, "INSERT INTO carts (user_id) VALUES ($1) RETURNING id", userID).Scan(&cartID)
		if err != nil {
			return err
		}
	} else if err != nil {
		return err
	}

	// 2. CHECK EXISTING ITEM 
	// Dalam printing, item dianggap sama JIKA Product, dan Variant-nya identik.
	var existingID int
	var existingQty int
	queryCheck := `
		SELECT id, quantity FROM cart_items 
		WHERE cart_id = $1 AND product_id = $2 AND variant_id = $3
	`
	err = r.db.QueryRowContext(ctx, queryCheck,
		cartID, item.ProductID, item.VariantID,
	).Scan(&existingID, &existingQty)

	// 3. UPDATE QUANTITY IF EXISTS
	if err == nil {
		_, err := r.db.ExecContext(ctx, "UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2", item.Quantity, existingID)
		return err
	}

	// 4. INSERT NEW ITEM
	queryInsert := `
		INSERT INTO cart_items (cart_id, product_id, variant_id, quantity, notes)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err = r.db.ExecContext(ctx, queryInsert,
		cartID, item.ProductID, item.VariantID, item.Quantity, item.Notes,
	)

	return err
}

// =========================================================================
// GET CART BY USER
// =========================================================================
func (r *cartRepository) GetByUserID(ctx context.Context, userID int) ([]map[string]interface{}, error) {
	query := `
		SELECT 
			ci.id, ci.product_id, p.name, ci.quantity, v.price,
			v.variant_name,
			ci.notes
		FROM carts c
		JOIN cart_items ci ON ci.cart_id = c.id
		JOIN products p ON p.id = ci.product_id
		JOIN product_variants v ON v.id = ci.variant_id
		WHERE c.user_id = $1
		ORDER BY ci.id DESC
	`
	rows, err := r.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var items []map[string]interface{}
	for rows.Next() {
		var id, productID, qty int
		var name, variantName, notes string
		var price float64

		if err := rows.Scan(&id, &productID, &name, &qty, &price, &variantName, &notes); err != nil {
			return nil, err
		}

		items = append(items, map[string]interface{}{
			"cart_item_id": id,
			"product_id":   productID,
			"product_name": name,
			"quantity":     qty,
			"price":        price,
			"variant_name": variantName,
			"notes":        notes,
			"subtotal":     float64(qty) * price,
		})
	}

	return items, nil
}

// =========================================================================
// UPDATE QUANTITY
// =========================================================================
func (r *cartRepository) Update(ctx context.Context, cartItemID int, qty int) error {
	res, err := r.db.ExecContext(ctx, "UPDATE cart_items SET quantity = $1 WHERE id = $2", qty, cartItemID)
	if err != nil {
		return err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return errors.New("item keranjang tidak ditemukan")
	}

	return nil
}

// =========================================================================
// DELETE ITEM
// =========================================================================
func (r *cartRepository) Delete(ctx context.Context, cartItemID int) error {
	res, err := r.db.ExecContext(ctx, "DELETE FROM cart_items WHERE id = $1", cartItemID)
	if err != nil {
		return err
	}

	rows, _ := res.RowsAffected()
	if rows == 0 {
		return errors.New("item keranjang tidak ditemukan")
	}

	return nil
}
