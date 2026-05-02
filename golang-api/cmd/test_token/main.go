package main

import (
	"fmt"
	"log"

	"golang-api/internal/infrastructure/jwt"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load("../../.env")
	
	// Generate token for Owner (ID: 1, Role: owner)
	token, err := jwt.GenerateToken(1, "owner")
	if err != nil {
		log.Fatal(err)
	}
	
	fmt.Print(token)
}
