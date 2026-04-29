package routes

import (
	"golang-api/internal/delivery/http/handler"
	"golang-api/internal/delivery/http/middleware"
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
) {

	// ========================
	// HEALTH CHECK (OPTIONAL)
	// ========================
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// ========================
	// STATIC FILES (UPLOADS)
	// ========================
	r.Static("/uploads", "./uploads")

	// ========================
	// AUTH (PUBLIC)
	// ========================
	r.POST("/login", authHandler.Login)
	r.POST("/register", authHandler.Register)

	// ========================
	// PUBLIC ROUTES
	// ========================
	r.GET("/products", productHandler.GetAll)

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
			role, _ := c.Get("role")

			c.JSON(200, gin.H{
				"message": "success",
				"user_id": userID,
				"role":    role,
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
		api.GET("/orders", orderHandler.GetMyOrders) // 🔥 FIX #4: Customer lihat pesanannya
		api.POST("/checkout", orderHandler.Checkout)
		api.PUT("/orders/:id/cancel", orderHandler.Cancel)
		api.PUT("/orders/:id/complete", orderHandler.CompleteOrder) // 🔥 Customer konfirmasi selesai
		
		// Customer Upload & View Designs
		api.POST("/orders/items/:id/design", designHandler.UploadDesign)
		api.GET("/orders/items/:id/designs", designHandler.GetDesignsByOrderItemID)

		// ========================
		// PAYMENT (CUSTOMER)
		// ========================
		api.POST("/payments", paymentHandler.Upload)

		// ========================
		// OWNER / ADMIN ROUTES
		// ========================
		admin := api.Group("/admin")
		admin.Use(middleware.OwnerOnly()) // 🔥 RBAC OWNER
		{
			// 🔥 Pendaftaran Staf Khusus Owner
			admin.POST("/staff", authHandler.RegisterStaff)

			// 🔥 Product Management (Admin/Owner)
			admin.POST("/products", productHandler.Create)
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
		staff.Use(middleware.StaffOnly()) // 🔥 FIX #5: RBAC — hanya staff/admin/owner
		{
			// 🔥 Payment Verification (Staff/Admin)
			staff.PUT("/payments/:id/approve", paymentHandler.Approve)
			staff.PUT("/payments/:id/reject", paymentHandler.Reject)

			// 🔥 Order Monitoring (Staff/Admin)
			staff.GET("/orders", orderHandler.GetAllOrders)

			staff.PUT("/production/:id/start", productionHandler.Start)
			staff.PUT("/production/:id/finish", productionHandler.Finish)

			// Staff Review Design
			staff.POST("/designs/:id/review", designHandler.AddReview)
		}
	}
}
