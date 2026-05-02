package usecase

import (
	"context"
	"errors"

	"golang-api/internal/domain/audit"
	"golang-api/internal/domain/user"
)

type UserUsecase struct {
	userRepo  user.Repository
	auditRepo audit.Repository
}

func NewUserUsecase(userRepo user.Repository, auditRepo audit.Repository) *UserUsecase {
	return &UserUsecase{
		userRepo:  userRepo,
		auditRepo: auditRepo,
	}
}

// =========================================================================
// UPDATE PROFILE
// =========================================================================
func (u *UserUsecase) UpdateProfile(ctx context.Context, id int, name, phone, ip, ua string) error {
	if name == "" {
		return errors.New("nama tidak boleh kosong")
	}

	err := u.userRepo.UpdateProfile(ctx, id, name, phone)
	if err != nil {
		return err
	}

	// Catat log
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:     id,
		Role:       "", // opsional
		Action:     "UPDATE_PROFILE",
		EntityType: "users",
		EntityID:   id,
		IPAddress:  ip,
		UserAgent:  ua,
	})

	return nil
}

// =========================================================================
// GET ALL USERS (Admin/Owner)
// =========================================================================
func (u *UserUsecase) GetAllUsers(ctx context.Context, roleID *int) ([]user.User, error) {
	return u.userRepo.GetAllUsers(ctx, roleID)
}

// =========================================================================
// UPDATE USER STATUS (Ban / Unban)
// =========================================================================
func (u *UserUsecase) UpdateUserStatus(ctx context.Context, adminID int, targetUserID int, isActive bool, ip, ua string) error {
	// Jangan izinkan owner nge-ban dirinya sendiri (ID 1 atau role owner)
	targetUser, err := u.userRepo.FindByID(ctx, targetUserID)
	if err != nil {
		return err
	}
	if targetUser == nil {
		return errors.New("user tidak ditemukan")
	}
	if targetUser.RoleID == 1 {
		return errors.New("tidak bisa mengubah status akun owner")
	}

	err = u.userRepo.UpdateUserStatus(ctx, targetUserID, isActive)
	if err != nil {
		return err
	}

	action := "BAN_USER"
	if isActive {
		action = "UNBAN_USER"
	}

	// Catat log (pelaku adalah Admin/Owner)
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:     adminID,
		Role:       "admin/owner",
		Action:     action,
		EntityType: "users",
		EntityID:   targetUserID,
		IPAddress:  ip,
		UserAgent:  ua,
	})

	return nil
}
