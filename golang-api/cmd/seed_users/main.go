package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  .env tidak ditemukan, menggunakan system env")
	}

	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	dbname := os.Getenv("DB_NAME")

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable search_path=public",
		host, port, user, pass, dbname,
	)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("❌ Gagal membuka koneksi DB:", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("❌ Gagal ping DB:", err)
	}

	// Memastikan tabel users sudah ada dengan struktur yang benar
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			role_id INT DEFAULT 3,
			name VARCHAR(100) NOT NULL,
			email VARCHAR(100) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			phone VARCHAR(20) DEFAULT '',
			is_active BOOLEAN DEFAULT TRUE,
			created_at TIMESTAMP DEFAULT NOW(),
			updated_at TIMESTAMP NULL,
			deleted_at TIMESTAMP NULL
		);
		ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20) DEFAULT '';
		ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
	`)
	if err != nil {
		log.Fatal("❌ Gagal memastikan tabel users:", err)
	}

	// Data Akun yang akan disuntikkan
	// Role: 1 = Owner/Admin, 2 = Staff, 3 = Customer
	users := []struct {
		RoleID int
		Name   string
		Email  string
		Pass   string
		Phone  string
	}{
		{1, "Admin Jaya Mandiri", "admin@jayamandiri.com", "admin123", "08111111111"},
		{2, "Staff Produksi", "staff@jayamandiri.com", "staff123", "08222222222"},
		{3, "Customer Test", "customer@gmail.com", "customer123", "08333333333"},
	}

	log.Println("🚀 Mulai memasukkan data akun ke database...")

	for _, u := range users {
		// Cek apakah email sudah ada
		var exists bool
		err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", u.Email).Scan(&exists)
		if err != nil {
			log.Fatalf("❌ Gagal cek email %s: %v", u.Email, err)
		}

		if exists {
			log.Printf("⚠️  Akun %s sudah ada di database, di-skip.", u.Email)
			continue
		}

		// Hash password menggunakan bcrypt (seperti yang digunakan di Golang API)
		hashedBytes, err := bcrypt.GenerateFromPassword([]byte(u.Pass), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("❌ Gagal hash password untuk %s: %v", u.Email, err)
		}
		hashedPassword := string(hashedBytes)

		// Insert ke database
		_, err = db.Exec(`
			INSERT INTO users (role_id, name, email, password, phone, is_active, created_at)
			VALUES ($1, $2, $3, $4, $5, TRUE, NOW())
		`, u.RoleID, u.Name, u.Email, hashedPassword, u.Phone)

		if err != nil {
			log.Fatalf("❌ Gagal insert akun %s: %v", u.Email, err)
		}

		log.Printf("✅ Berhasil membuat akun: %s (Role ID: %d)", u.Email, u.RoleID)
	}

	log.Println("=====================================================")
	log.Println("🎉 SELESAI! Akun berhasil disuntikkan ke database.")
	log.Println("Gunakan akun berikut untuk login:")
	log.Println("👉 ADMIN : admin@jayamandiri.com | Pass: admin123")
	log.Println("👉 STAFF : staff@jayamandiri.com | Pass: staff123")
	log.Println("=====================================================")
}
