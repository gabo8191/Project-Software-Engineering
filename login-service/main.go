package main

import (
	"log"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"login-service/internal/config"
	"login-service/internal/handlers"
	"login-service/internal/middleware"
	"login-service/internal/repository"
	"login-service/internal/services"
	"login-service/pkg/logger"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize logger
	logger := logger.New(cfg.LogLevel)

	// Initialize Redis repository
	redisRepo := repository.NewRedisRepository(cfg.Redis)

	// Initialize services
	authService := services.NewAuthService(redisRepo, logger)
	redisService := services.NewRedisService(redisRepo, logger)

	// Initialize Consul service
	consulPort, _ := strconv.Atoi(cfg.Consul.Port)
	consulService, err := services.NewConsulService(cfg.Consul.Host, consulPort, logger)
	if err != nil {
		logger.Error("Failed to initialize Consul service: " + err.Error())
		log.Fatal("Failed to initialize Consul service:", err)
	}

	// Wait for Consul to be available
	if err := consulService.WaitForConsul(10, 2); err != nil {
		logger.Error("Consul not available: " + err.Error())
		log.Fatal("Consul not available:", err)
	}

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService, logger)
	healthHandler := handlers.NewHealthHandler(redisService, logger)

	// Setup Gin router
	router := setupRouter(authHandler, healthHandler, logger)

	// Register service with Consul
	serviceID := "login-service-1"
	serviceHost := "login-service"
	servicePort := 8081
	healthCheckPath := "/health"

	if err := consulService.RegisterService("login-service", serviceID, serviceHost, servicePort, healthCheckPath); err != nil {
		logger.Error("Failed to register with Consul: " + err.Error())
		log.Fatal("Failed to register with Consul:", err)
	}

	// Setup graceful shutdown
	setupGracefulShutdown(consulService, serviceID, logger)

	// Start server
	logger.Info("Starting login service on port 8081")
	if err := router.Run(":8081"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

func setupRouter(authHandler *handlers.AuthHandler, healthHandler *handlers.HealthHandler, logger *logger.Logger) *gin.Engine {
	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)

	// Create router
	router := gin.New()

	// Add middleware
	router.Use(middleware.CORS())
	router.Use(middleware.Logger(logger))
	router.Use(middleware.Recovery(logger))

	// Health check endpoints (root level for direct access)
	router.GET("/health", healthHandler.HealthCheck)
	router.GET("/ready", healthHandler.ReadinessCheck)
	router.GET("/live", healthHandler.LivenessCheck)

	// API routes
	api := router.Group("/login")
	{
		// Health endpoints under /login prefix (for API Gateway)
		api.GET("/health", healthHandler.HealthCheck)
		api.GET("/ready", healthHandler.ReadinessCheck)
		api.GET("/live", healthHandler.LivenessCheck)

		// Authentication endpoints
		api.POST("/createuser", authHandler.CreateUser)
		api.POST("/authuser", authHandler.AuthUser)
	}

	return router
}

func setupGracefulShutdown(consulService *services.ConsulService, serviceID string, logger *logger.Logger) {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-c
		logger.Info("Shutting down login service...")

		// Deregister from Consul
		if err := consulService.DeregisterService(serviceID); err != nil {
			logger.Error("Failed to deregister from Consul: " + err.Error())
		}

		logger.Info("Login service shutdown complete")
		os.Exit(0)
	}()
}
