package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"golang-api/internal/delivery/http/handler"
	"golang-api/internal/delivery/http/routes"
	"golang-api/internal/delivery/websocket"
	"golang-api/internal/delivery/http/middleware"
	"golang-api/internal/infrastructure/database"
	postgresRepo "golang-api/internal/repository/postgres"
	"golang-api/internal/usecase"
	"time"
	"golang.org/x/time/rate"
)

func main() {
	// =========================================================================
	// 1. LOAD ENVIRONMENT VARIABLES
	// =========================================================================
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  File .env tidak ditemukan, menggunakan system env")
	}

	// SET GIN MODE
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// =========================================================================
	// 2. DATABASE CONNECTION
	// =========================================================================
	dbConn, err := database.NewPostgresConnection()
	if err != nil {
		log.Fatal("❌ Gagal terhubung ke PostgreSQL:", err)
	}
	defer dbConn.Close()

	log.Println("✅ Database PostgreSQL terhubung")

	// =========================================================================
	// 3. REPOSITORY INITIALIZATION
	// =========================================================================
	userRepo := postgresRepo.NewUserRepository(dbConn)
	productRepo := postgresRepo.NewProductRepository(dbConn)
	orderRepo := postgresRepo.NewOrderRepository(dbConn)
	cartRepo := postgresRepo.NewCartRepository(dbConn)
	paymentRepo := postgresRepo.NewPaymentRepository(dbConn)
	auditRepo := postgresRepo.NewAuditRepository(dbConn) // Wajib ada untuk logging

	// 🔥 TAMBAHAN: Inisialisasi Production, Material & Design Repository
	productionRepo := postgresRepo.NewProductionRepository(dbConn)
	materialRepo := postgresRepo.NewMaterialRepository(dbConn)
	designRepo := postgresRepo.NewDesignRepository(dbConn)
	reportRepo := postgresRepo.NewReportRepository(dbConn)

	// =========================================================================
	// 4. WEBSOCKET & RATE LIMITER INITIALIZATION
	// =========================================================================
	wsHub := websocket.NewHub()
	go wsHub.Run()
	limiter := middleware.NewIPRateLimiter(rate.Every(time.Second), 100)

	// =========================================================================
	// 5. USECASE INITIALIZATION (Dependency Injection)
	// =========================================================================
	authUsecase := usecase.NewAuthUsecase(userRepo, auditRepo)
	productUsecase := usecase.NewProductUsecase(productRepo)
	orderUsecase := usecase.NewOrderUsecase(orderRepo, auditRepo, wsHub)
	cartUsecase := usecase.NewCartUsecase(cartRepo)
	paymentUsecase := usecase.NewPaymentUsecase(paymentRepo, orderRepo, auditRepo, wsHub)

	// 🔥 TAMBAHAN: Inisialisasi Production, Material & Design Usecase
	productionUsecase := usecase.NewProductionUsecase(productionRepo, auditRepo, wsHub)
	materialUsecase := usecase.NewMaterialUsecase(materialRepo, auditRepo)
	designUsecase := usecase.NewDesignUsecase(designRepo, auditRepo)
	reportUsecase := usecase.NewReportUsecase(reportRepo)
	userUsecase := usecase.NewUserUsecase(userRepo, auditRepo)

	// =========================================================================
	// 5. HANDLER INITIALIZATION
	// =========================================================================
	authHandler := handler.NewAuthHandler(authUsecase)
	productHandler := handler.NewProductHandler(productUsecase)
	orderHandler := handler.NewOrderHandler(orderUsecase)
	cartHandler := handler.NewCartHandler(cartUsecase)
	paymentHandler := handler.NewPaymentHandler(paymentUsecase)

	// 🔥 TAMBAHAN: Inisialisasi Production, Material & Design Handler
	productionHandler := handler.NewProductionHandler(productionUsecase)
	materialHandler := handler.NewMaterialHandler(materialUsecase)
	designHandler := handler.NewDesignHandler(designUsecase)
	reportHandler := handler.NewReportHandler(reportUsecase)
	userHandler := handler.NewUserHandler(userUsecase)

	// 7. ROUTER & SERVER SETUP
	// =========================================================================
	r := gin.Default()

	// Batas memori untuk file upload (desain digital printing yang ukurannya bisa besar)
	r.MaxMultipartMemory = 10 << 20 // 10 MiB (Disetel ke 10MB sesuai revisi)

	// ========================
	// CORS CONFIGURATION
	// ========================
	r.Use(cors.New(cors.Config{
		AllowAllOrigins: true,
		AllowMethods:    []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:    []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:   []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:          12 * time.Hour,
	}))

	// Keamanan Proxy
	if err := r.SetTrustedProxies([]string{"127.0.0.1"}); err != nil {
		log.Fatal(err)
	}

	// Setup Routes Utama
	routes.SetupRoutes(
		r,
		authHandler,
		productHandler,
		orderHandler,
		cartHandler,
		paymentHandler,
		productionHandler,
		materialHandler,
		designHandler,
		reportHandler,
		userHandler,
		userRepo,
		wsHub,
		limiter,
	)

	// RUN SERVER
	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 OMS Printing Server berjalan di port: %s", port)

	if err := r.Run(":" + port); err != nil {
		log.Fatal("❌ Gagal menjalankan server:", err)
	}
}
