package middleware

import (
	"log"
	"net/http"
	"os"
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

		// Coba parse token tanpa verifikasi signature dulu untuk melihat isi claims (menentukan jenis token)
		parsedToken, _, err := new(jwt.Parser).ParseUnverified(tokenString, jwt.MapClaims{})
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid token format"})
			c.Abort()
			return
		}

		claims, ok := parsedToken.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid token claims format"})
			c.Abort()
			return
		}

		var userID int
		var u *user.User

		// Cek apakah ini token bawaan web (mengandung "user_id") atau Supabase (mengandung "sub" & "email")
		if _, hasUserID := claims["user_id"]; hasUserID {
			// ==========================================
			// ALUR 1: TOKEN WEB Bawaan (Custom JWT)
			// ==========================================
			token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
				return jwtpkg.GetJWTSecret(), nil
			})

			if err != nil || !token.Valid {
				c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid token signature"})
				c.Abort()
				return
			}

			validClaims := token.Claims.(jwt.MapClaims)
			userIDFloat, _ := validClaims["user_id"].(float64)
			userID = int(userIDFloat)

			u, err = userRepo.FindByID(c.Request.Context(), userID)

		} else if _, hasSub := claims["sub"]; hasSub {
			// ==========================================
			// ALUR 2: TOKEN SUPABASE (Mobile App)
			// ==========================================
			supabaseSecret := os.Getenv("SUPABASE_JWT_SECRET")
			if supabaseSecret == "" {
				log.Println("WARNING: SUPABASE_JWT_SECRET is not set in environment")
				c.JSON(http.StatusInternalServerError, gin.H{"message": "auth configuration error"})
				c.Abort()
				return
			}

			token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
				return []byte(supabaseSecret), nil
			})

			if err != nil || !token.Valid {
				c.JSON(http.StatusUnauthorized, gin.H{"message": "invalid supabase token signature"})
				c.Abort()
				return
			}

			validClaims := token.Claims.(jwt.MapClaims)
			email, _ := validClaims["email"].(string)

			// Cari user di database internal kita berdasarkan email dari Supabase
			u, err = userRepo.FindByEmail(c.Request.Context(), email)
			if err != nil || u == nil {
				// Jika user login via Supabase tapi belum ada di database kita
				c.JSON(http.StatusUnauthorized, gin.H{"message": "user supabase belum terdaftar di sistem internal"})
				c.Abort()
				return
			}
			userID = u.ID
		} else {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "unknown token format"})
			c.Abort()
			return
		}

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

		// Konversi RoleID ke string role (sesuaikan dengan logika sebelumnya)
		var roleStr string
		switch u.RoleID {
		case 1:
			roleStr = "Manager"
		case 2:
			roleStr = "Staff"
		case 3:
			roleStr = "Customer"
		default:
			roleStr = "Customer"
		}

		// Set ke context agar bisa diakses handler
		c.Set("user_id", userID)
		c.Set("role", roleStr)

		c.Next()
	}
}
