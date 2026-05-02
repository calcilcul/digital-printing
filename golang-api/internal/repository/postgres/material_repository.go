package postgres

import (
	"context"
	"database/sql"
	"errors"

	"golang-api/internal/domain/material"
)

type materialRepository struct {
	db *sql.DB
}

func NewMaterialRepository(db *sql.DB) material.Repository {
	return &materialRepository{db: db}
}

func (r *materialRepository) Create(ctx context.Context, m *material.Material) error {
	query := `
		INSERT INTO materials (name, stock, unit, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, m.Name, m.Stock, m.Unit).Scan(&m.ID, &m.CreatedAt)
	if err != nil {
		return err
	}

	// Jika stock awal > 0, otomatis catat ke log sebagai 'in'
	if m.Stock > 0 {
		logQuery := `
			INSERT INTO material_stock_logs (material_id, change_type, quantity, reference, created_at)
			VALUES ($1, 'in', $2, 'Initial Stock', NOW())
		`
		_, _ = r.db.ExecContext(ctx, logQuery, m.ID, m.Stock)
	}

	return nil
}

func (r *materialRepository) FindAll(ctx context.Context) ([]material.Material, error) {
	query := `SELECT id, name, stock, unit, created_at FROM materials ORDER BY id DESC`
	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var materials []material.Material
	for rows.Next() {
		var m material.Material
		if err := rows.Scan(&m.ID, &m.Name, &m.Stock, &m.Unit, &m.CreatedAt); err != nil {
			return nil, err
		}
		materials = append(materials, m)
	}
	return materials, nil
}

func (r *materialRepository) FindByID(ctx context.Context, id int) (*material.Material, error) {
	var m material.Material
	query := `SELECT id, name, stock, unit, created_at FROM materials WHERE id = $1`
	err := r.db.QueryRowContext(ctx, query, id).Scan(&m.ID, &m.Name, &m.Stock, &m.Unit, &m.CreatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

func (r *materialRepository) AdjustStock(ctx context.Context, materialID int, changeType string, quantity float64, reference string) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Update stok material
	var updateQuery string
	if changeType == "in" {
		updateQuery = `UPDATE materials SET stock = stock + $1 WHERE id = $2`
	} else if changeType == "out" {
		updateQuery = `UPDATE materials SET stock = stock - $1 WHERE id = $2`
	} else {
		return errors.New("invalid change type")
	}

	res, err := tx.ExecContext(ctx, updateQuery, quantity, materialID)
	if err != nil {
		return err
	}

	affected, _ := res.RowsAffected()
	if affected == 0 {
		return errors.New("material tidak ditemukan")
	}

	// 2. Insert log
	logQuery := `
		INSERT INTO material_stock_logs (material_id, change_type, quantity, reference, created_at)
		VALUES ($1, $2, $3, $4, NOW())
	`
	_, err = tx.ExecContext(ctx, logQuery, materialID, changeType, quantity, reference)
	if err != nil {
		return err
	}

	return tx.Commit()
}
