package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	for _, p := range []string{".env", "../.env", "../../.env"} {
		if err := godotenv.Load(p); err == nil {
			break
		}
	}

	migrateUser := getEnv("MIGRATE_USER", getEnv("DB_USER", "postgres"))
	migratePass := getEnv("MIGRATE_PASS", getEnv("DB_PASS", ""))

	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_PORT", "5432"),
		migrateUser,
		migratePass,
		getEnv("DB_NAME", "printing_postgres"),
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to connect: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping DB: %v", err)
	}

	log.Println("Connected to DB. Running migration in steps...")

	// ── STEP 1: Add new ENUM values (must be outside transaction in PG < 12)
	allStatuses := []string{
		"pending_design", "design_uploaded", "payment_verification",
		"payment_rejected", "design_review", "revision_requested",
		"printing", "ready", "completed", "cancelled",
	}
	for _, s := range allStatuses {
		q := fmt.Sprintf(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel='%s' AND enumtypid=(SELECT oid FROM pg_type WHERE typname='status_order')) THEN ALTER TYPE status_order ADD VALUE '%s'; END IF; END; $$`, s, s)
		if _, err := db.Exec(q); err != nil {
			log.Fatalf("Step1 ENUM add '%s' failed: %v", s, err)
		}
	}
	log.Println("✅ Step 1: ENUM values added")

	// ── STEP 2: DDL + data migration (can be in a single exec but not txn after enum add)
	step2Statements := []string{
		// Add columns to orders
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS revision_count INT NOT NULL DEFAULT 0`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS revision_notes TEXT`,
		`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_rejected_reason TEXT`,

		// Migrate old status values to new ones
		`UPDATE orders SET status = 'pending_design' WHERE status = 'waiting_payment'`,
		`UPDATE orders SET status = 'design_review'  WHERE status = 'paid'`,

		// Ensure design_files table
		`CREATE TABLE IF NOT EXISTS design_files (
			id            SERIAL PRIMARY KEY,
			order_item_id INT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
			file_path     TEXT NOT NULL,
			version       INT NOT NULL DEFAULT 1,
			uploaded_by   INT NOT NULL REFERENCES users(id),
			created_at    TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		// Ensure design_reviews table
		`CREATE TABLE IF NOT EXISTS design_reviews (
			id             SERIAL PRIMARY KEY,
			design_file_id INT NOT NULL REFERENCES design_files(id) ON DELETE CASCADE,
			status         VARCHAR(20) NOT NULL DEFAULT 'pending',
			notes          TEXT,
			reviewed_by    INT REFERENCES users(id),
			created_at     TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		// Ensure order_status_logs table
		`CREATE TABLE IF NOT EXISTS order_status_logs (
			id         SERIAL PRIMARY KEY,
			order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			status     VARCHAR(50) NOT NULL,
			changed_by INT NOT NULL REFERENCES users(id),
			notes      TEXT,
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		// Permissions
		`GRANT SELECT, INSERT, UPDATE ON orders TO printing_user`,
		`GRANT SELECT, INSERT, UPDATE ON design_files TO printing_user`,
		`GRANT USAGE, SELECT ON SEQUENCE design_files_id_seq TO printing_user`,
		`GRANT SELECT, INSERT, UPDATE ON design_reviews TO printing_user`,
		`GRANT USAGE, SELECT ON SEQUENCE design_reviews_id_seq TO printing_user`,
		`GRANT SELECT, INSERT ON order_status_logs TO printing_user`,
		`GRANT USAGE, SELECT ON SEQUENCE order_status_logs_id_seq TO printing_user`,

		// Indexes
		`CREATE INDEX IF NOT EXISTS idx_design_files_order_item ON design_files(order_item_id)`,
		`CREATE INDEX IF NOT EXISTS idx_design_reviews_file     ON design_reviews(design_file_id)`,
		`CREATE INDEX IF NOT EXISTS idx_orders_status           ON orders(status)`,
		`CREATE INDEX IF NOT EXISTS idx_orders_user_id          ON orders(user_id)`,
		`CREATE INDEX IF NOT EXISTS idx_osl_order_id            ON order_status_logs(order_id)`,
	}

	for i, q := range step2Statements {
		if _, err := db.Exec(q); err != nil {
			log.Fatalf("Step2[%d] failed: %v\nQuery: %s", i, err, q[:min(len(q), 80)])
		}
	}
	log.Println("✅ Step 2: Schema, data migration, permissions, indexes done")
	log.Println("🎉 Migration 004_new_checkout_flow completed successfully!")
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
