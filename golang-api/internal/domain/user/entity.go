package user

import "time"

// User adalah Entity utama yang mencerminkan tabel users di database [cite: 1259 16483]
type User struct {
	ID        int        `json:"id"`
	RoleID    int        `json:"role_id"`
	Name      string     `json:"name"`
	Email     string     `json:"email"`
	Password  string     `json:"-"` // " - " artinya password tidak akan dikirim saat diconvert ke JSON (keamanan) [cite: 1259 16483]
	Phone     string     `json:"phone"`
	IsActive  bool       `json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at,omitempty"` // Pointer karena bisa NULL [cite: 1259 16483]
	DeletedAt *time.Time `json:"deleted_at,omitempty"` // Untuk soft delete
}

// RegisterRequest digunakan untuk menangkap data dari form pendaftaran di Gin
type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`           // binding:"required" agar Gin otomatis menolak jika kosong
	Email    string `json:"email" binding:"required,email"`    // validasi format email otomatis
	Password string `json:"password" binding:"required,min=6"` // minimal 6 karakter
	Phone    string `json:"phone"`
}
