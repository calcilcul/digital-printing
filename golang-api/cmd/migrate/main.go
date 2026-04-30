package main

import (
	"database/sql"
	"log"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	godotenv.Load("../../.env")
	
	// Coba pakai user postgres yang merupakan owner
	dsn := "host=localhost port=5432 user=postgres password=postgres dbname=printing_postgres sslmode=disable"
	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	query := `
		ALTER TABLE public.users 
		ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT '', 
		ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
	`
	_, err = db.Exec(query)
	if err != nil {
		log.Fatal("Migration failed:", err)
	}
	log.Println("Migration successful!")
}
