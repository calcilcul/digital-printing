package handler

import "github.com/gin-gonic/gin"

// ========================
// GET USER ID
// ========================
func getUserID(c *gin.Context) (int, bool) {
	val, exists := c.Get("user_id")
	if !exists {
		return 0, false
	}

	userID, ok := val.(int)
	if !ok || userID <= 0 {
		return 0, false
	}

	return userID, true
}

// ========================
// GET USER ROLE
// ========================
func getUserRole(c *gin.Context) (string, bool) {
	val, exists := c.Get("role")
	if !exists {
		return "", false
	}

	role, ok := val.(string)
	if !ok || role == "" {
		return "", false
	}

	return role, true
}
