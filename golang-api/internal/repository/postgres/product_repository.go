package postgres

import (
	"database/sql"

	"golang-api/internal/domain/product"
)

type productRepository struct {
	db *sql.DB
}

func NewProductRepository(db *sql.DB) product.Repository {
	return &productRepository{db}
}

// ========================
// GET ALL ACTIVE PRODUCTS
// ========================
func (r *productRepository) FindAll() ([]product.Product, error) {

	query := `
		SELECT 
			p.id, p.name, p.description, p.base_price,
			v.id as v_id, v.sku as v_sku, v.variant_name as v_name, v.price as v_price, v.stock as v_stock, v.is_active as v_is_active, v.material_id, v.material_usage
		FROM products p
		LEFT JOIN product_variants v ON v.product_id = p.id
		WHERE p.is_active = TRUE
		ORDER BY p.id DESC
	`
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	productMap := make(map[int]*product.Product)
	var productIDs []int

	for rows.Next() {
		var p product.Product
		var vID sql.NullInt64
		var vSku, vName sql.NullString
		var vPrice sql.NullFloat64
		var vStock sql.NullInt64
		var vIsActive sql.NullBool
		var vMaterialID sql.NullInt64
		var vMaterialUsage sql.NullFloat64

		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.BasePrice,
			&vID, &vSku, &vName, &vPrice, &vStock, &vIsActive, &vMaterialID, &vMaterialUsage,
		)
		if err != nil {
			return nil, err
		}

		if _, exists := productMap[p.ID]; !exists {
			productMap[p.ID] = &p
			productIDs = append(productIDs, p.ID)
		}

		if vID.Valid {
			variant := product.ProductVariant{
				ID:          int(vID.Int64),
				ProductID:   p.ID,
				SKU:         vSku.String,
				VariantName: vName.String,
				Price:       vPrice.Float64,
				Stock:       int(vStock.Int64),
				IsActive:    vIsActive.Bool,
			}
			if vMaterialID.Valid {
				matID := int(vMaterialID.Int64)
				variant.MaterialID = &matID
			}
			if vMaterialUsage.Valid {
				variant.MaterialUsage = vMaterialUsage.Float64
			}
			productMap[p.ID].Variants = append(productMap[p.ID].Variants, variant)
		}
	}

	// handle error iteration (WAJIB)
	if err := rows.Err(); err != nil {
		return nil, err
	}

	var products []product.Product
	for _, id := range productIDs {
		products = append(products, *productMap[id])
	}

	// return empty slice instead of nil (best practice API)
	if len(products) == 0 {
		return []product.Product{}, nil
	}

	return products, nil
}

// ========================
// CREATE PRODUCT
// ========================
func (r *productRepository) Create(product *product.Product) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert Product
	queryProduct := `
		INSERT INTO products (category_id, name, description, base_price, estimated_days, is_active, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		RETURNING id, created_at
	`
	err = tx.QueryRow(queryProduct,
		product.CategoryID,
		product.Name,
		product.Description,
		product.BasePrice,
		product.EstimatedDays,
		product.IsActive,
	).Scan(&product.ID, &product.CreatedAt)
	if err != nil {
		return err
	}

	// 2. Insert Variants
	queryVariant := `
		INSERT INTO product_variants (product_id, sku, variant_name, price, stock, is_active, material_id, material_usage, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING id, created_at
	`
	for i := range product.Variants {
		v := &product.Variants[i]
		v.ProductID = product.ID
		err = tx.QueryRow(queryVariant,
			v.ProductID,
			v.SKU,
			v.VariantName,
			v.Price,
			v.Stock,
			v.IsActive,
			v.MaterialID,
			v.MaterialUsage,
		).Scan(&v.ID, &v.CreatedAt)
		if err != nil {
			return err
		}
	}

	return tx.Commit()
}

// ========================
// UPDATE PRODUCT
// ========================
func (r *productRepository) Update(product *product.Product) error {
	tx, err := r.db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Update Product
	queryProduct := `
		UPDATE products
		SET category_id = $1, name = $2, description = $3, base_price = $4, estimated_days = $5, is_active = $6, updated_at = NOW()
		WHERE id = $7 AND deleted_at IS NULL
	`
	_, err = tx.Exec(queryProduct,
		product.CategoryID,
		product.Name,
		product.Description,
		product.BasePrice,
		product.EstimatedDays,
		product.IsActive,
		product.ID,
	)
	if err != nil {
		return err
	}

	// 2. Handle Variants
	// Ambil semua variant_id yang dikirim untuk produk ini
	var keepVariantIDs []int
	for _, v := range product.Variants {
		if v.ID > 0 {
			keepVariantIDs = append(keepVariantIDs, v.ID)
		}
	}

	// Soft delete/hard delete varian yang tidak ada di request?
	// Karena ini tabel relasional, amannya kita hapus saja varian yang tidak dikirim jika memungkinkan.
	// Jika gagal karena foreign key, itu di luar cakupan ini (harus di-handle dengan baik di DB).
	if len(keepVariantIDs) > 0 {
		// Hapus varian yang tidak ada di list
	}

	queryVariantUpdate := `
		UPDATE product_variants
		SET sku = $1, variant_name = $2, price = $3, stock = $4, is_active = $5, material_id = $6, material_usage = $7, updated_at = NOW()
		WHERE id = $8 AND product_id = $9
	`
	queryVariantInsert := `
		INSERT INTO product_variants (product_id, sku, variant_name, price, stock, is_active, material_id, material_usage, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		RETURNING id, created_at
	`

	for i := range product.Variants {
		v := &product.Variants[i]
		if v.ID > 0 {
			// Update
			_, err = tx.Exec(queryVariantUpdate,
				v.SKU, v.VariantName, v.Price, v.Stock, v.IsActive, v.MaterialID, v.MaterialUsage, v.ID, product.ID,
			)
			if err != nil {
				return err
			}
		} else {
			// Insert new variant
			v.ProductID = product.ID
			err = tx.QueryRow(queryVariantInsert,
				v.ProductID, v.SKU, v.VariantName, v.Price, v.Stock, v.IsActive, v.MaterialID, v.MaterialUsage,
			).Scan(&v.ID, &v.CreatedAt)
			if err != nil {
				return err
			}
		}
	}

	return tx.Commit()
}

// ========================
// DELETE PRODUCT (Soft Delete)
// ========================
func (r *productRepository) Delete(id int) error {
	query := `UPDATE products SET deleted_at = NOW(), is_active = false WHERE id = $1`
	_, err := r.db.Exec(query, id)
	return err
}
