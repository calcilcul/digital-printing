package routes

import (
	"golang-api/internal/delivery/http/handler"
	"golang-api/internal/delivery/http/middleware"
	"golang-api/internal/delivery/websocket"
	"golang-api/internal/domain/user"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	r *gin.Engine,
	authHandler *handler.AuthHandler,
	productHandler *handler.ProductHandler,
	orderHandler *handler.OrderHandler,
	cartHandler *handler.CartHandler,
	paymentHandler *handler.PaymentHandler,
	productionHandler *handler.ProductionHandler,
	materialHandler *handler.MaterialHandler,
	designHandler *handler.DesignHandler,
	reportHandler *handler.ReportHandler,
	userHandler *handler.UserHandler,
	userRepo user.Repository,
	wsHub *websocket.Hub,
	limiter *middleware.IPRateLimiter,
) {

	// ========================
	// HEALTH CHECK (OPTIONAL)
	// ========================
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// ========================
	// STATIC FILES & WEBSOCKET
	// ========================
	r.Static("/uploads", "./uploads")
	r.GET("/ws", func(c *gin.Context) {
		wsHub.ServeWs(c.Writer, c.Request)
	})

	// ========================
	// AUTH (PUBLIC with Rate Limit)
	// ========================
	authGroup := r.Group("/")
	authGroup.Use(middleware.RateLimitMiddleware(limiter))
	{
		authGroup.POST("/login", authHandler.Login)
		authGroup.POST("/register", authHandler.Register)
	}

	// ========================
	// PUBLIC ROUTES
	// ========================
	r.GET("/products", productHandler.GetAll)
	r.GET("/categories", productHandler.GetCategories)

	// ========================
	// PROTECTED ROUTES (JWT REQUIRED)
	// ========================
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware(userRepo))
	{

		// ========================
		// USER PROFILE
		// ========================
		api.GET("/profile", func(c *gin.Context) {
			userID, _ := c.Get("user_id")
			
			// Ambil data user lengkap dari DB untuk mendapatkan Nama
			userData, err := userRepo.FindByID(c.Request.Context(), userID.(int))
			if err != nil || userData == nil {
				c.JSON(200, gin.H{
					"message": "success",
					"user_id": userID,
					"role":    c.MustGet("role"),
					"name":    "User",
				})
				return
			}

			c.JSON(200, gin.H{
				"message": "success",
				"user_id": userData.ID,
				"role":    c.MustGet("role"),
				"name":    userData.Name,
				"email":   userData.Email,
				"phone":   userData.Phone,
			})
		})
		api.PUT("/profile", userHandler.UpdateProfile) // 🔥 Update profil (Nama & No HP)

		// 🔥 LOGOUT (Pencatatan aktivitas)
		api.POST("/logout", authHandler.Logout)

		// ========================
		// CART
		// ========================
		api.POST("/cart", cartHandler.Add)
		api.GET("/cart", cartHandler.Get)
		api.PUT("/cart", cartHandler.Update)
		api.DELETE("/cart", cartHandler.Delete)

		// ========================
		// ORDER & DESIGNS
		// ========================
		api.POST("/orders", orderHandler.Create)
		api.GET("/orders", orderHandler.GetMyOrders)
		api.GET("/orders/:id", orderHandler.GetOrderDetail)
		api.GET("/orders/:id/invoice/pdf", orderHandler.DownloadInvoicePDF)
		api.POST("/checkout", orderHandler.Checkout)            // checkout dari keranjang
		api.POST("/buy-now", orderHandler.BuyNow)               // beli langsung 1 item
		api.PUT("/orders/:id/cancel", orderHandler.Cancel)
		api.PUT("/orders/:id/complete", orderHandler.CompleteOrder)

		// Upload & Reupload Desain per Item
		api.POST("/orders/:id/items/:item_id/design", orderHandler.UploadDesign)
		api.POST("/orders/:id/items/:item_id/design/reupload", orderHandler.ReuploadDesign)

		// Legacy design handler (existing)
		api.POST("/orders/items/:id/design", designHandler.UploadDesign)
		api.GET("/orders/items/:id/designs", designHandler.GetDesignsByOrderItemID)

		// Upload & Reupload Bukti Bayar
		api.POST("/orders/:id/payment", orderHandler.UploadPayment)
		api.POST("/orders/:id/payment/reupload", orderHandler.ReuploadPayment)
		api.POST("/payments", paymentHandler.Upload) // multipart: order_id, payment_proof, amount, ...

		// ========================
		// OWNER / ADMIN ROUTES
		// ========================
		admin := api.Group("/admin")
		admin.Use(middleware.OwnerOnly()) // 🔥 RBAC OWNER
		{
			// 🔥 Pendaftaran Staf Khusus Owner
			admin.POST("/staff", authHandler.RegisterStaff)

			// 🔥 Product Management (Admin/Owner)
			admin.GET("/products", productHandler.GetAllForAdmin)
			admin.POST("/products", productHandler.Create)
			admin.POST("/products/:id/image", productHandler.UploadImage)
			admin.PUT("/products/:id", productHandler.Update)
			admin.DELETE("/products/:id", productHandler.Delete)

			// 🔥 Reports & Monitoring (Owner Only)
			admin.GET("/reports/revenue", reportHandler.GetRevenueReport)
			admin.GET("/reports/products", reportHandler.GetTopProducts)
			admin.GET("/logs/audit", reportHandler.GetAuditLogs)
			admin.GET("/logs/login", reportHandler.GetLoginLogs)
			admin.GET("/logs/production", reportHandler.GetProductionLogs)

			// 🔥 Material / Inventory Management (Admin/Owner)
			admin.GET("/materials", materialHandler.GetAll)
			admin.POST("/materials", materialHandler.Create)
			admin.POST("/materials/:id/adjust", materialHandler.AdjustStock)

			// 🔥 FIX #7: Dashboard Owner — lihat semua pesanan
			admin.GET("/orders", orderHandler.GetAllOrders)

			// 🔥 User Management (Owner Only)
			admin.GET("/users", userHandler.GetAllUsers)
			admin.PUT("/users/:id/status", userHandler.UpdateUserStatus)
		}

		// ========================
		// STAFF ROUTES (PRODUCTION, DESIGN, & VERIFICATION)
		// ========================
		staff := api.Group("/staff")
		staff.Use(middleware.StaffOnly())
		{
			// Order Monitoring (Staff/Admin)
			staff.GET("/orders", orderHandler.GetAllOrders)

			// Payment Verification (baru)
			staff.PUT("/orders/:id/payment/approve", orderHandler.ApprovePayment)
			staff.PUT("/orders/:id/payment/reject", orderHandler.RejectPayment)

			// Design Review (baru)
			staff.PUT("/orders/:id/design/approve", orderHandler.ApproveDesign)
			staff.PUT("/orders/:id/design/revision", orderHandler.RequestRevision)

			// Production
			staff.PUT("/orders/:id/printing/finish", orderHandler.FinishPrinting)
			staff.PUT("/production/:id/start", productionHandler.Start)
			staff.PUT("/production/:id/finish", productionHandler.Finish)

			// Legacy
			staff.PUT("/payments/:id/approve", paymentHandler.Approve)
			staff.PUT("/payments/:id/reject", paymentHandler.Reject)
			staff.POST("/designs/:id/review", designHandler.AddReview)
		}
	}
}
