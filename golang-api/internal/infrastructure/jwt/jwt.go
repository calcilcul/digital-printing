package jwt

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// GetJWTSecret mengembalikan JWT secret key dari environment variable.
// WAJIB set JWT_SECRET di .env — jangan pernah hardcode secret!
func GetJWTSecret() []byte {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		// Fallback aman untuk development (log warning sudah ada di main.go)
		return []byte("fallback-secret-wajib-set-JWT_SECRET-di-env")
	}
	return []byte(secret)
}

func GenerateToken(userID int, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 24).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(GetJWTSecret())
}
