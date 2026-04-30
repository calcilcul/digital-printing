package main

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/lib/pq"
)

func main() {
	users := []string{"postgres", "printing_user"}
	passwords := []string{"", "postgres", "root", "123456", "admin", "password", "printing_user"}
	dbName := "printing_postgres"

	for _, u := range users {
		for _, p := range passwords {
			connStr := fmt.Sprintf("host=localhost port=5432 user=%s password=%s dbname=%s sslmode=disable", u, p, dbName)
			db, err := sql.Open("postgres", connStr)
			if err == nil {
				err = db.Ping()
				if err == nil {
					fmt.Printf("SUCCESS: User=%s Pass=%s\n", u, p)
					os.Exit(0)
				}
			}
		}
	}
	fmt.Println("FAILED ALL COMBINATIONS")
	os.Exit(1)
}
