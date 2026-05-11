package response

import (
	"net/http"
	"github.com/gin-gonic/gin"
)

// Response adalah struktur standar untuk API response
type Response struct {
	Status  int         `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

// SuccessResponse mengirimkan response sukses 200 OK
func SuccessResponse(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Status:  http.StatusOK,
		Message: message,
		Data:    data,
	})
}

// CreatedResponse mengirimkan response sukses 201 Created
func CreatedResponse(c *gin.Context, message string, data interface{}) {
	c.JSON(http.StatusCreated, Response{
		Status:  http.StatusCreated,
		Message: message,
		Data:    data,
	})
}

// ErrorResponse mengirimkan response error dengan custom status code
func ErrorResponse(c *gin.Context, status int, message string) {
	c.JSON(status, Response{
		Status:  status,
		Message: message,
	})
}

// InternalServerError mengirimkan response error 500
func InternalServerError(c *gin.Context, message string) {
	if message == "" {
		message = "Terjadi kesalahan internal pada server"
	}
	c.JSON(http.StatusInternalServerError, Response{
		Status:  http.StatusInternalServerError,
		Message: message,
	})
}
