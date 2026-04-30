package handler

import (
	"net/http"
	"strings"

	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authUsecase *usecase.AuthUsecase
}

func NewAuthHandler(authUsecase *usecase.AuthUsecase) *AuthHandler {
	return &AuthHandler{authUsecase}
}

// =========================================================================
// REQUEST STRUCTS
// =========================================================================
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// Tambahan untuk pendaftaran staff oleh Owner
type RegisterStaffRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// =========================================================================
// LOGIN
// =========================================================================
func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Format data tidak valid",
			"error":   err.Error(),
		})
		return
	}

	req.Email = strings.TrimSpace(req.Email)

	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	token, err := h.authUsecase.Login(c.Request.Context(), req.Email, req.Password, ip, ua)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   token,
	})
}

// =========================================================================
// REGISTER (PUBLIC CUSTOMER)
// =========================================================================
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Format data tidak valid",
			"error":   err.Error(),
		})
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)

	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	err := h.authUsecase.Register(c.Request.Context(), req.Name, req.Email, req.Password, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Registrasi berhasil",
	})
}

// =========================================================================
// REGISTER STAFF (OWNER ONLY)
// =========================================================================
func (h *AuthHandler) RegisterStaff(c *gin.Context) {
	var req RegisterStaffRequest

	// 1. Validasi JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Format data staf tidak valid",
			"error":   err.Error(),
		})
		return
	}

	// 2. Ambil metadata Audit (IP & UA)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// 3. Ambil UserID si Owner dari JWT Middleware
	// Ini penting untuk mencatat siapa yang mendaftarkan staf ini di Audit Log
	ownerID := c.MustGet("user_id").(int)

	// 4. Eksekusi Usecase
	err := h.authUsecase.RegisterStaff(c.Request.Context(), req.Name, req.Email, req.Password, ip, ua, ownerID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Staf baru berhasil didaftarkan oleh Owner",
	})
}

// =========================================================================
// LOGOUT (Pencatatan Log)
// =========================================================================
func (h *AuthHandler) Logout(c *gin.Context) {
	// Ambil ID user dari JWT middleware
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"message": "Unauthorized"})
		return
	}

	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// Eksekusi Usecase (Hanya pencatatan)
	_ = h.authUsecase.Logout(c.Request.Context(), userID.(int), ip, ua)

	// Beri tahu client untuk menghapus token
	c.JSON(http.StatusOK, gin.H{
		"message": "Logout berhasil. Silakan hapus token di aplikasi Anda.",
	})
}
