package main

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

func main() {
	connStr := "host=localhost port=5432 user=printing_user password=pepelegiindahA18 dbname=printing_postgres sslmode=disable"
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Update products
	_, err = db.Exec("UPDATE products SET is_active = true;")
	if err != nil {
		log.Fatal("Error updating products: ", err)
	}

	// Update variants
	_, err = db.Exec("UPDATE product_variants SET is_active = true;")
	if err != nil {
		log.Fatal("Error updating product variants: ", err)
	}

	log.Println("Successfully updated all products and variants to active!")
}
