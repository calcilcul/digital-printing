//go:build ignore
// +build ignore

package main

import (
	"fmt"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	hash := "$2a$10$zF7MVSijR7Ad06nj97nF2ehsymBxBBnahPCdiLdx18Dts53tb19oq"
	
	err1 := bcrypt.CompareHashAndPassword([]byte(hash), []byte("123456"))
	fmt.Printf("123456: %v\n", err1 == nil)

	err2 := bcrypt.CompareHashAndPassword([]byte(hash), []byte("password123"))
	fmt.Printf("password123: %v\n", err2 == nil)
}
