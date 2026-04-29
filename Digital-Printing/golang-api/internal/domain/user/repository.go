package user

import "context"

type Repository interface {
	// Tambahkan context.Context agar sinkron dengan pemanggilan di AuthUsecase
	FindByEmail(ctx context.Context, email string) (*User, error)

	// Tambahkan context.Context untuk mendukung tracking dan timeout database
	Create(ctx context.Context, user *User) error

	// Tambahkan FindByID untuk kebutuhan middleware atau profil user nantinya
	FindByID(ctx context.Context, id int) (*User, error)

	// CreateLoginLog mencatat aktivitas login atau logout ke tabel login_logs
	CreateLoginLog(ctx context.Context, userID int, activityType string, ip string, ua string) error

	// UpdateProfile mengubah nama dan no HP customer
	UpdateProfile(ctx context.Context, id int, name, phone string) error

	// GetAllUsers mengambil semua user berdasarkan role (kosong = semua)
	GetAllUsers(ctx context.Context, roleID *int) ([]User, error)

	// UpdateUserStatus (Ban / Unban)
	UpdateUserStatus(ctx context.Context, id int, isActive bool) error
}
