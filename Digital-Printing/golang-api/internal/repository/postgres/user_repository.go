package postgres

import (
	"context"
	"database/sql"
	"errors"
	"log"

	"golang-api/internal/domain/user"
)

type userRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) user.Repository {
	return &userRepository{db: db}
}

// =========================================================================
// FIND USER BY EMAIL
// =========================================================================
func (r *userRepository) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	var u user.User

	query := `
		SELECT id, role_id, name, email, password, COALESCE(phone_number, ''), COALESCE(is_active, true)
		FROM public.users
		WHERE email = $1
		LIMIT 1
	`

	// Gunakan ctx yang dikirim dari Usecase agar tracing & timeout sinkron
	err := r.db.QueryRowContext(ctx, query, email).Scan(
		&u.ID,
		&u.RoleID,
		&u.Name,
		&u.Email,
		&u.Password,
		&u.Phone,
		&u.IsActive,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}

	if err != nil {
		log.Println("🔥 QUERY ERROR (FindByEmail):", err)
		return nil, err
	}

	return &u, nil
}

// =========================================================================
// CREATE USER (REGISTER)
// =========================================================================
func (r *userRepository) Create(ctx context.Context, u *user.User) error {
	query := `
		INSERT INTO public.users (name, email, password, role_id)
		VALUES ($1, $2, $3, $4)
		RETURNING id
	`

	// Eksekusi dengan context kiriman usecase
	err := r.db.QueryRowContext(ctx, query,
		u.Name,
		u.Email,
		u.Password,
		u.RoleID,
	).Scan(&u.ID)

	if err != nil {
		log.Println("🔥 QUERY ERROR (CreateUser):", err)
		return err
	}

	return nil
}

// =========================================================================
// FIND USER BY ID (Penting untuk Auth Middleware)
// =========================================================================
func (r *userRepository) FindByID(ctx context.Context, id int) (*user.User, error) {
	var u user.User
	query := `SELECT id, name, email, role_id, COALESCE(phone_number, ''), COALESCE(is_active, true) FROM public.users WHERE id = $1`

	err := r.db.QueryRowContext(ctx, query, id).Scan(&u.ID, &u.Name, &u.Email, &u.RoleID, &u.Phone, &u.IsActive)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return &u, err
}

// =========================================================================
// CREATE LOGIN LOG (Catat login/logout)
// =========================================================================
func (r *userRepository) CreateLoginLog(ctx context.Context, userID int, activityType string, ip string, ua string) error {
	query := `
		INSERT INTO public.login_logs (user_id, activity_type, ip_address, user_agent, created_at)
		VALUES ($1, $2, $3, $4, NOW())
	`
	_, err := r.db.ExecContext(ctx, query, userID, activityType, ip, ua)
	if err != nil {
		log.Println("🔥 QUERY ERROR (CreateLoginLog):", err)
		return err
	}
	return nil
}

// =========================================================================
// UPDATE PROFILE (Customer/Staff)
// =========================================================================
func (r *userRepository) UpdateProfile(ctx context.Context, id int, name, phone string) error {
	query := `UPDATE public.users SET name = $1, phone_number = $2, updated_at = NOW() WHERE id = $3`
	_, err := r.db.ExecContext(ctx, query, name, phone, id)
	return err
}

// =========================================================================
// GET ALL USERS (Owner Dashboard)
// =========================================================================
func (r *userRepository) GetAllUsers(ctx context.Context, roleID *int) ([]user.User, error) {
	query := `
		SELECT id, name, email, role_id, COALESCE(phone_number, ''), COALESCE(is_active, true), created_at
		FROM public.users
	`
	var args []interface{}
	if roleID != nil {
		query += " WHERE role_id = $1"
		args = append(args, *roleID)
	}
	query += " ORDER BY id DESC"

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []user.User
	for rows.Next() {
		var u user.User
		if err := rows.Scan(&u.ID, &u.Name, &u.Email, &u.RoleID, &u.Phone, &u.IsActive, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// =========================================================================
// UPDATE USER STATUS (Ban / Unban)
// =========================================================================
func (r *userRepository) UpdateUserStatus(ctx context.Context, id int, isActive bool) error {
	query := `UPDATE public.users SET is_active = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, isActive, id)
	return err
}
