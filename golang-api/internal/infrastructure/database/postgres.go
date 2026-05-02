package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

// ========================
// NEW POSTGRES CONNECTION (FINAL)
// ========================
func NewPostgresConnection() (*sql.DB, error) {

	// ========================
	// LOAD ENV
	// ========================
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASS")
	dbname := os.Getenv("DB_NAME")

	// ========================
	// DEBUG CONFIG
	// ========================
	log.Println("📌 DB CONFIG:")
	log.Println("HOST:", host)
	log.Println("PORT:", port)
	log.Println("USER:", user)
	log.Println("DB:", dbname)

	// ========================
	// VALIDASI ENV
	// ========================
	if host == "" || port == "" || user == "" || dbname == "" {
		return nil, fmt.Errorf("database config is not set properly")
	}

	// ========================
	// CONNECTION STRING (FINAL FIX)
	// ========================
	// 🔥 WAJIB: search_path=public supaya tidak error "relation does not exist"
	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable search_path=public",
		host,
		port,
		user,
		pass,
		dbname,
	)

	// ========================
	// OPEN CONNECTION
	// ========================
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, err
	}

	// ========================
	// PING DATABASE
	// ========================
	if err := db.Ping(); err != nil {
		return nil, err
	}

	log.Println("✅ Connected to PostgreSQL")

	// ========================
	// DEBUG: CEK DATABASE AKTIF
	// ========================
	var currentDB string
	if err := db.QueryRow("SELECT current_database()").Scan(&currentDB); err != nil {
		log.Println("⚠️ Failed get current DB:", err)
	} else {
		log.Println("📌 CONNECTED DATABASE:", currentDB)
	}

	// ========================
	// DEBUG: CEK TABLE USERS
	// ========================
	var exists bool
	err = db.QueryRow(`
		SELECT EXISTS (
			SELECT FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name = 'users'
		)
	`).Scan(&exists)

	if err != nil {
		log.Println("⚠️ Failed check users table:", err)
	} else {
		log.Println("📌 USERS TABLE EXISTS:", exists)
	}

	// ========================
	// CONNECTION POOL (PRODUCTION)
	// ========================
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(10)
	db.SetConnMaxLifetime(5 * time.Minute)

	return db, nil
}
