package postgres

import (
	"context"
	"database/sql"
	"errors"

	"golang-api/internal/domain/design"
)

type designRepository struct {
	db *sql.DB
}

func NewDesignRepository(db *sql.DB) design.Repository {
	return &designRepository{db: db}
}

func (r *designRepository) UploadDesign(ctx context.Context, d *design.DesignFile) error {
	query := `
		INSERT INTO design_files (order_item_id, file_path, version, uploaded_by, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id, created_at
	`
	err := r.db.QueryRowContext(ctx, query, d.OrderItemID, d.FilePath, d.Version, d.UploadedBy).Scan(&d.ID, &d.CreatedAt)
	return err
}

func (r *designRepository) GetLatestVersion(ctx context.Context, orderItemID int) (int, error) {
	var maxVersion sql.NullInt64
	query := `SELECT MAX(version) FROM design_files WHERE order_item_id = $1`
	err := r.db.QueryRowContext(ctx, query, orderItemID).Scan(&maxVersion)
	
	if err != nil {
		return 0, err
	}
	
	if maxVersion.Valid {
		return int(maxVersion.Int64), nil
	}
	return 0, nil
}

func (r *designRepository) GetDesignByID(ctx context.Context, designID int) (*design.DesignFile, error) {
	var d design.DesignFile
	query := `
		SELECT id, order_item_id, file_path, version, uploaded_by, created_at
		FROM design_files
		WHERE id = $1
	`
	err := r.db.QueryRowContext(ctx, query, designID).Scan(
		&d.ID, &d.OrderItemID, &d.FilePath, &d.Version, &d.UploadedBy, &d.CreatedAt,
	)
	
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	
	return &d, nil
}

func (r *designRepository) GetDesignsByOrderItemID(ctx context.Context, orderItemID int) ([]design.DesignFile, error) {
	query := `
		SELECT id, order_item_id, file_path, version, uploaded_by, created_at
		FROM design_files
		WHERE order_item_id = $1
		ORDER BY version DESC
	`
	rows, err := r.db.QueryContext(ctx, query, orderItemID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var designs []design.DesignFile
	for rows.Next() {
		var d design.DesignFile
		if err := rows.Scan(&d.ID, &d.OrderItemID, &d.FilePath, &d.Version, &d.UploadedBy, &d.CreatedAt); err != nil {
			return nil, err
		}
		
		// Ambil reviews untuk desain ini
		d.Reviews, _ = r.getReviewsByDesignID(ctx, d.ID)
		
		designs = append(designs, d)
	}
	return designs, nil
}

func (r *designRepository) getReviewsByDesignID(ctx context.Context, designID int) ([]design.DesignReview, error) {
	query := `
		SELECT id, design_file_id, reviewed_by, status, notes, created_at
		FROM design_reviews
		WHERE design_file_id = $1
		ORDER BY created_at ASC
	`
	rows, err := r.db.QueryContext(ctx, query, designID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reviews []design.DesignReview
	for rows.Next() {
		var rev design.DesignReview
		var notes sql.NullString
		if err := rows.Scan(&rev.ID, &rev.DesignFileID, &rev.ReviewedBy, &rev.Status, &notes, &rev.CreatedAt); err != nil {
			return nil, err
		}
		rev.Notes = notes.String // kosong string jika NULL
		reviews = append(reviews, rev)
	}
	return reviews, nil
}

func (r *designRepository) AddReview(ctx context.Context, review *design.DesignReview) error {
	// Cek apakah sudah pernah direview dengan status 'approved' sebelumnya
	var existingStatus sql.NullString
	checkQuery := `SELECT status FROM design_reviews WHERE design_file_id = $1 ORDER BY id DESC LIMIT 1`
	err := r.db.QueryRowContext(ctx, checkQuery, review.DesignFileID).Scan(&existingStatus)
	
	if err == nil && existingStatus.Valid && existingStatus.String == "approved" {
		return errors.New("desain ini sudah disetujui sebelumnya, tidak dapat direview lagi")
	}

	query := `
		INSERT INTO design_reviews (design_file_id, reviewed_by, status, notes, created_at)
		VALUES ($1, $2, $3, $4, NOW())
		RETURNING id, created_at
	`
	var notes *string
	if review.Notes != "" {
		n := review.Notes
		notes = &n
	}

	err = r.db.QueryRowContext(ctx, query, review.DesignFileID, review.ReviewedBy, review.Status, notes).Scan(&review.ID, &review.CreatedAt)
	return err
}

// VerifyOrderItemOwnership mengecek apakah order_item milik user tersebut
// dengan JOIN order_items -> orders -> user_id
func (r *designRepository) VerifyOrderItemOwnership(ctx context.Context, orderItemID int, userID int) (bool, error) {
	query := `
		SELECT COUNT(1) 
		FROM order_items oi
		JOIN orders o ON o.id = oi.order_id
		WHERE oi.id = $1 AND o.user_id = $2
	`
	var count int
	err := r.db.QueryRowContext(ctx, query, orderItemID, userID).Scan(&count)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}
