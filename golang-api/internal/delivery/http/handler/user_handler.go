package handler

import (
	"net/http"
	"strconv"
	"strings"

	"golang-api/internal/usecase"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	usecase *usecase.UserUsecase
}

func NewUserHandler(u *usecase.UserUsecase) *UserHandler {
	return &UserHandler{usecase: u}
}

// =========================================================================
// REQUEST STRUCT
// =========================================================================
type UpdateProfileRequest struct {
	Name  string `json:"name" binding:"required"`
	Phone string `json:"phone_number"` // bisa kosong
}

type UpdateStatusRequest struct {
	IsActive bool `json:"is_active"`
}

// =========================================================================
// UPDATE PROFILE (Customer/Staff)
// =========================================================================
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	userID := c.MustGet("user_id").(int)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	err := h.usecase.UpdateProfile(c.Request.Context(), userID, strings.TrimSpace(req.Name), strings.TrimSpace(req.Phone), ip, ua)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profil berhasil diperbarui"})
}

// =========================================================================
// GET ALL USERS (Owner Only)
// =========================================================================
func (h *UserHandler) GetAllUsers(c *gin.Context) {
	roleIDStr := c.Query("role_id")
	var roleID *int
	if roleIDStr != "" {
		id, err := strconv.Atoi(roleIDStr)
		if err == nil {
			roleID = &id
		}
	}

	users, err := h.usecase.GetAllUsers(c.Request.Context(), roleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Data pengguna",
		"data":    users,
	})
}

// =========================================================================
// BAN / UNBAN USER (Owner Only)
// =========================================================================
func (h *UserHandler) UpdateUserStatus(c *gin.Context) {
	var req UpdateStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Format data tidak valid"})
		return
	}

	targetIDStr := c.Param("id")
	targetID, err := strconv.Atoi(targetIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID user tidak valid"})
		return
	}

	adminID := c.MustGet("user_id").(int)
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	err = h.usecase.UpdateUserStatus(c.Request.Context(), adminID, targetID, req.IsActive, ip, ua)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": err.Error()})
		return
	}

	msg := "Akun berhasil diaktifkan"
	if !req.IsActive {
		msg = "Akun berhasil dinonaktifkan (Banned)"
	}

	c.JSON(http.StatusOK, gin.H{"message": msg})
}
