package usecase

import (
	"context"
	"errors"
	"fmt"

	"golang-api/internal/domain/audit"
	"golang-api/internal/domain/material"
)

type MaterialUsecase struct {
	repo      material.Repository
	auditRepo audit.Repository
}

func NewMaterialUsecase(repo material.Repository, auditRepo audit.Repository) *MaterialUsecase {
	return &MaterialUsecase{
		repo:      repo,
		auditRepo: auditRepo,
	}
}

// CreateMaterial menambahkan data material baru ke database
func (u *MaterialUsecase) CreateMaterial(ctx context.Context, req material.MaterialRequest, adminID int, ip, ua string) error {
	m := &material.Material{
		Name:  req.Name,
		Stock: req.Stock,
		Unit:  req.Unit,
	}

	err := u.repo.Create(ctx, m)
	if err != nil {
		return err
	}

	// Catat ke audit log
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:     adminID,
		Role:       "admin/owner", // asumsi role
		Action:     "create_material",
		EntityType: "materials",
		EntityID:   m.ID,
		IPAddress:  ip,
		UserAgent:  ua,
	})

	return nil
}

// GetAllMaterials mendapatkan daftar semua material
func (u *MaterialUsecase) GetAllMaterials(ctx context.Context) ([]material.Material, error) {
	return u.repo.FindAll(ctx)
}

// AdjustStock menyesuaikan stok secara manual (misal saat stok masuk dari supplier atau hilang)
func (u *MaterialUsecase) AdjustStock(ctx context.Context, materialID int, req material.MaterialStockAdjustmentRequest, adminID int, ip, ua string) error {
	// Validasi material ada
	existing, err := u.repo.FindByID(ctx, materialID)
	if err != nil {
		return err
	}
	if existing == nil {
		return errors.New("material tidak ditemukan")
	}

	// Validasi stok jika 'out' agar tidak minus berlebih
	if req.ChangeType == "out" && existing.Stock < req.Quantity {
		return fmt.Errorf("stok tidak cukup, stok saat ini: %.2f", existing.Stock)
	}

	err = u.repo.AdjustStock(ctx, materialID, req.ChangeType, req.Quantity, req.Reference)
	if err != nil {
		return err
	}

	// Catat ke audit log
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:     adminID,
		Role:       "admin/owner",
		Action:     "adjust_material_stock",
		EntityType: "materials",
		EntityID:   materialID,
		IPAddress:  ip,
		UserAgent:  ua,
	})

	return nil
}
