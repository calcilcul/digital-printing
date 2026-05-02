package middleware

import "github.com/gin-gonic/gin"

// ========================
// OWNER ONLY MIDDLEWARE
// ========================
func OwnerOnly() gin.HandlerFunc {
	return func(c *gin.Context) {

		roleInterface, exists := c.Get("role")
		if !exists {
			c.JSON(401, gin.H{"message": "unauthorized"})
			c.Abort()
			return
		}

		role, ok := roleInterface.(string)
		if !ok || role != "owner" {
			c.JSON(403, gin.H{"message": "hanya owner yang dapat mengakses endpoint ini"})
			c.Abort()
			return
		}

		c.Next()
	}
}

// ========================
// STAFF ONLY MIDDLEWARE
// Mengizinkan role: staff, admin, owner
// Menolak role: customer
// ========================
func StaffOnly() gin.HandlerFunc {
	return func(c *gin.Context) {

		roleInterface, exists := c.Get("role")
		if !exists {
			c.JSON(401, gin.H{"message": "unauthorized"})
			c.Abort()
			return
		}

		role, ok := roleInterface.(string)
		if !ok {
			c.JSON(401, gin.H{"message": "invalid token role"})
			c.Abort()
			return
		}

		// Hanya staff, admin, dan owner yang diizinkan
		if role != "staff" && role != "admin" && role != "owner" {
			c.JSON(403, gin.H{"message": "akses ditolak: endpoint ini hanya untuk staf produksi"})
			c.Abort()
			return
		}

		c.Next()
	}
}
