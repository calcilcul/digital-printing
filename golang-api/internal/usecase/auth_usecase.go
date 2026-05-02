package usecase

import (
	"context"
	"errors"
	"strings"

	"golang-api/internal/domain/audit"
	"golang-api/internal/domain/user"
	"golang-api/internal/infrastructure/jwt"

	"golang.org/x/crypto/bcrypt"
)

type AuthUsecase struct {
	userRepo  user.Repository
	auditRepo audit.Repository
}

// NewAuthUsecase inisialisasi usecase autentikasi
func NewAuthUsecase(userRepo user.Repository, auditRepo audit.Repository) *AuthUsecase {
	return &AuthUsecase{
		userRepo:  userRepo,
		auditRepo: auditRepo,
	}
}

// =========================================================================
// LOGIN
// =========================================================================
func (u *AuthUsecase) Login(ctx context.Context, email, password, ip, ua string) (string, error) {
	email = strings.TrimSpace(email)

	if email == "" || password == "" {
		return "", errors.New("email dan password wajib diisi")
	}

	// 1. Cari User berdasarkan email
	uData, err := u.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return "", err
	}
	if uData == nil {
		return "", errors.New("email atau password tidak sesuai")
	}

	// 2. Verifikasi Password dengan bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(uData.Password), []byte(password)); err != nil {
		return "", errors.New("email atau password tidak sesuai")
	}

	// 3. Mapping ID Role ke nama string
	role := mapRole(uData.RoleID)

	// 4. Generate JWT Token
	token, err := jwt.GenerateToken(uData.ID, role)
	if err != nil {
		return "", err
	}

	// 5. Catat Log Audit (Login Berhasil)
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:    uData.ID,
		Role:      role,
		Action:    audit.ActionLogin,
		EntityType:"users",
		EntityID:  uData.ID,
		IPAddress: ip,
		UserAgent: ua,
	})

	// 6. Catat ke tabel login_logs (activity_type = 'login')
	_ = u.userRepo.CreateLoginLog(ctx, uData.ID, "login", ip, ua)

	return token, nil
}

// =========================================================================
// LOGOUT (Pencatatan aktivitas)
// =========================================================================
func (u *AuthUsecase) Logout(ctx context.Context, userID int, ip, ua string) error {
	// Catat ke tabel login_logs (activity_type = 'logout')
	_ = u.userRepo.CreateLoginLog(ctx, userID, "logout", ip, ua)
	
	// Catat Audit Log
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:     userID,
		Role:       "", // Role bisa didapat jika dikirim, opsional untuk audit logout
		Action:     "LOGOUT",
		EntityType: "users",
		EntityID:   userID,
		IPAddress:  ip,
		UserAgent:  ua,
	})
	return nil
}

// =========================================================================
// REGISTER (PUBLIC CUSTOMER)
// =========================================================================
func (u *AuthUsecase) Register(ctx context.Context, name, email, password, ip, ua string) error {
	name = strings.TrimSpace(name)
	email = strings.TrimSpace(email)

	if name == "" || email == "" || password == "" {
		return errors.New("seluruh kolom wajib diisi")
	}

	// 1. Validasi: Pastikan email belum terdaftar
	existing, err := u.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("email sudah digunakan oleh akun lain")
	}

	// 2. Hash Password
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 3. Simpan entitas User baru (Default: Customer ID 3)
	newUser := &user.User{
		Name:     name,
		Email:    email,
		Password: string(hashed),
		RoleID:   3,
	}

	if err := u.userRepo.Create(ctx, newUser); err != nil {
		return err
	}

	// 4. Catat Log Audit
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:    newUser.ID,
		Role:      "customer",
		Action:    audit.ActionRegister,
		EntityType:"users",
		EntityID:  newUser.ID,
		IPAddress: ip,
		UserAgent: ua,
	})

	return nil
}

// =========================================================================
// REGISTER STAFF (OWNER ONLY)
// =========================================================================
func (u *AuthUsecase) RegisterStaff(ctx context.Context, name, email, password, ip, ua string, ownerID int) error {
	name = strings.TrimSpace(name)
	email = strings.TrimSpace(email)

	if name == "" || email == "" || password == "" {
		return errors.New("seluruh data staf wajib diisi")
	}

	// 1. Validasi: Pastikan email belum terdaftar
	existing, err := u.userRepo.FindByEmail(ctx, email)
	if err != nil {
		return err
	}
	if existing != nil {
		return errors.New("email staf sudah terdaftar")
	}

	// 2. Hash Password
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// 3. Simpan sebagai Staff (RoleID 2)
	newStaff := &user.User{
		Name:     name,
		Email:    email,
		Password: string(hashed),
		RoleID:   2, // ID 2 dialokasikan untuk role 'staff'
	}

	if err := u.userRepo.Create(ctx, newStaff); err != nil {
		return err
	}

	// 4. Catat Log Audit (Action baru: ActionRegisterStaff)
	// UserID di sini adalah ownerID, karena Owner-lah pelakunya.
	_ = u.auditRepo.Create(ctx, &audit.AuditLog{
		UserID:    ownerID,
		Role:      "owner",
		Action:    audit.ActionRegisterStaff,
		EntityType:"users",
		EntityID:  newStaff.ID,
		IPAddress: ip,
		UserAgent: ua,
	})

	return nil
}

// =========================================================================
// HELPER: ROLE MAPPING
// =========================================================================
func mapRole(roleID int) string {
	switch roleID {
	case 1:
		return "owner"
	case 2:
		return "staff"
	case 3:
		return "customer"
	default:
		return "customer"
	}
}
