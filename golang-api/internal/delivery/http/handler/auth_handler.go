package handler

import (
	"net/http"
	"strings"

	"golang-api/internal/pkg/response"
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
		response.ErrorResponse(c, http.StatusBadRequest, "Format data tidak valid: " + err.Error())
		return
	}

	req.Email = strings.TrimSpace(req.Email)

	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	token, err := h.authUsecase.Login(c.Request.Context(), req.Email, req.Password, ip, ua)
	if err != nil {
		response.ErrorResponse(c, http.StatusUnauthorized, err.Error())
		return
	}

	response.SuccessResponse(c, "Login berhasil", gin.H{
		"token": token,
	})
}

// =========================================================================
// REGISTER (PUBLIC CUSTOMER)
// =========================================================================
func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorResponse(c, http.StatusBadRequest, "Format data tidak valid: " + err.Error())
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)

	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	err := h.authUsecase.Register(c.Request.Context(), req.Name, req.Email, req.Password, ip, ua)
	if err != nil {
		response.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	response.SuccessResponse(c, "Registrasi berhasil", nil)
}

// =========================================================================
// REGISTER STAFF (OWNER ONLY)
// =========================================================================
func (h *AuthHandler) RegisterStaff(c *gin.Context) {
	var req RegisterStaffRequest

	// 1. Validasi JSON
	if err := c.ShouldBindJSON(&req); err != nil {
		response.ErrorResponse(c, http.StatusBadRequest, "Format data staf tidak valid: " + err.Error())
		return
	}

	// 2. Ambil metadata Audit (IP & UA)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// 3. Ambil UserID si Owner dari JWT Middleware
	ownerID, exists := c.Get("user_id")
	if !exists {
		response.ErrorResponse(c, http.StatusUnauthorized, "Sesi tidak valid")
		return
	}

	// 4. Eksekusi Usecase
	err := h.authUsecase.RegisterStaff(c.Request.Context(), req.Name, req.Email, req.Password, ip, ua, ownerID.(int))
	if err != nil {
		response.ErrorResponse(c, http.StatusBadRequest, err.Error())
		return
	}

	response.CreatedResponse(c, "Staf baru berhasil didaftarkan oleh Owner", nil)
}

// =========================================================================
// LOGOUT (Pencatatan Log)
// =========================================================================
func (h *AuthHandler) Logout(c *gin.Context) {
	// Ambil ID user dari JWT middleware
	userID, exists := c.Get("user_id")
	if !exists {
		response.ErrorResponse(c, http.StatusUnauthorized, "Unauthorized")
		return
	}

	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	// Eksekusi Usecase (Hanya pencatatan)
	_ = h.authUsecase.Logout(c.Request.Context(), userID.(int), ip, ua)

	// Beri tahu client untuk menghapus token
	response.SuccessResponse(c, "Logout berhasil. Silakan hapus token di aplikasi Anda.", nil)
}
