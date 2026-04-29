package usecase

import (
	"context"
	"errors"

	"golang-api/internal/domain/audit"
	"golang-api/internal/domain/design"
)

type DesignUsecase struct {
	designRepo design.Repository
	auditRepo  audit.Repository
}

func NewDesignUsecase(designRepo design.Repository, auditRepo audit.Repository) *DesignUsecase {
	return &DesignUsecase{
		designRepo: designRepo,
		auditRepo:  auditRepo,
	}
}

// UploadDesign memproses penyimpanan data file desain dan mengatur versinya.
// Validasi kepemilikan order_item dilakukan SEBELUM file disimpan ke DB.
func (u *DesignUsecase) UploadDesign(ctx context.Context, orderItemID int, filePath string, uploadedBy int, ip, ua string) (*design.DesignFile, error) {
	// ✅ FIX #1: Validasi kepemilikan — customer hanya boleh upload ke pesanannya sendiri
	isOwner, err := u.designRepo.VerifyOrderItemOwnership(ctx, orderItemID, uploadedBy)
	if err != nil {
		return nil, err
	}
	if !isOwner {
		return nil, errors.New("akses ditolak: order item ini bukan milik Anda")
	}

	// 1. Cari tahu versi terakhir untuk order item ini
	latestVersion, err := u.designRepo.GetLatestVersion(ctx, orderItemID)
	if err != nil {
		return nil, err
	}

	newVersion := latestVersion + 1

	d := &design.DesignFile{
		OrderItemID: orderItemID,
		FilePath:    filePath,
		Version:     newVersion,
		UploadedBy:  uploadedBy,
	}

	// 2. Simpan ke database
	err = u.designRepo.UploadDesign(ctx, d)
	if err != nil {
		return nil, err
	}

	// 3. Catat log audit (role diambil dari context JWT, disini kita gunakan "customer")
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:     uploadedBy,
		Role:       "customer",
		Action:     "upload_design",
		EntityType: "design_files",
		EntityID:   d.ID,
		IPAddress:  ip,
		UserAgent:  ua,
	})

	return d, nil
}

// GetDesignsByOrderItemID mendapatkan riwayat desain.
// Jika role == "customer", hanya boleh lihat desain milik pesanannya sendiri.
// Jika role == "admin", "owner", atau "staff", bebas lihat semua.
func (u *DesignUsecase) GetDesignsByOrderItemID(ctx context.Context, orderItemID int, userID int, role string) ([]design.DesignFile, error) {
	// Validasi kepemilikan hanya untuk Customer
	if role == "customer" {
		isOwner, err := u.designRepo.VerifyOrderItemOwnership(ctx, orderItemID, userID)
		if err != nil {
			return nil, err
		}
		if !isOwner {
			return nil, errors.New("akses ditolak: Anda tidak memiliki izin untuk melihat desain pesanan ini")
		}
	}

	return u.designRepo.GetDesignsByOrderItemID(ctx, orderItemID)
}

// AddReview menambahkan review dari staf untuk sebuah file desain
func (u *DesignUsecase) AddReview(ctx context.Context, designID int, req design.DesignReviewRequest, reviewerID int, ip, ua string) error {
	// Cek apakah desain ada
	d, err := u.designRepo.GetDesignByID(ctx, designID)
	if err != nil {
		return err
	}
	if d == nil {
		return errors.New("file desain tidak ditemukan")
	}

	review := &design.DesignReview{
		DesignFileID: designID,
		ReviewedBy:   reviewerID,
		Status:       req.Status,
		Notes:        req.Notes,
	}

	err = u.designRepo.AddReview(ctx, review)
	if err != nil {
		return err
	}

	// Catat log audit
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:     reviewerID,
		Role:       "admin/owner",
		Action:     "review_design_" + req.Status,
		EntityType: "design_reviews",
		EntityID:   review.ID,
		IPAddress:  ip,
		UserAgent:  ua,
	})

	return nil
}
