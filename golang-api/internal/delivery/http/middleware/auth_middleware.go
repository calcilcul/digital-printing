package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"golang-api/internal/domain/user"
	jwtpkg "golang-api/internal/infrastructure/jwt"
)

func AuthMiddleware(userRepo user.Repository) gin.HandlerFunc {
	return func(c *gin.Context) {

		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "missing token"})
			c.Abort()
			return
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		// Parse pakai MapClaims — secret diambil dari satu sumber (package jwt)
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return jwtpkg.GetJWTSecret(), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid token"})
			c.Abort()
			return
		}

		// Ekstrak claims dari MapClaims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid token claims"})
			c.Abort()
			return
		}

		// Ambil user_id (disimpan sebagai float64 di MapClaims JSON)
		userIDFloat, ok := claims["user_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid token: user_id not found"})
			c.Abort()
			return
		}

		userID := int(userIDFloat)

		// 🔥 FIX: Cek status is_active ke Database secara real-time
		u, err := userRepo.FindByID(c.Request.Context(), userID)
		if err != nil || u == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "user tidak ditemukan"})
			c.Abort()
			return
		}
		if !u.IsActive {
			c.JSON(http.StatusForbidden, gin.H{"message": "Akun anda telah dinonaktifkan (Banned)"})
			c.Abort()
			return
		}

		role, _ := claims["role"].(string)

		// Set ke context agar bisa diakses handler
		c.Set("user_id", userID)
		c.Set("role", role)

		c.Next()
	}
}
