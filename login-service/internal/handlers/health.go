package handlers

import (
	"net/http"
	"login-service/internal/models"
	"login-service/internal/services"
	"login-service/pkg/logger"
	"time"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	redisService *services.RedisService
	logger       *logger.Logger
	startTime    time.Time
}

func NewHealthHandler(redisService *services.RedisService, logger *logger.Logger) *HealthHandler {
	return &HealthHandler{
		redisService: redisService,
		logger:       logger,
		startTime:    time.Now(),
	}
}

// HealthCheck handles health check requests
func (h *HealthHandler) HealthCheck(c *gin.Context) {
	// Check Redis connection
	redisErr := h.redisService.HealthCheck()

	status := "healthy"
	httpStatus := http.StatusOK

	if redisErr != nil {
		status = "unhealthy"
		httpStatus = http.StatusServiceUnavailable
		h.logger.Error("Health check failed - Redis:", redisErr)
	}

	uptime := time.Since(h.startTime).String()

	response := models.HealthCheckResponse{
		Status:  status,
		Service: "login-service",
		Version: "1.0.0",
		Uptime:  uptime,
	}

	c.JSON(httpStatus, response)
}

// ReadinessCheck handles readiness check requests
func (h *HealthHandler) ReadinessCheck(c *gin.Context) {
	// Check if all dependencies are ready
	redisErr := h.redisService.HealthCheck()

	if redisErr != nil {
		h.logger.Error("Readiness check failed - Redis:", redisErr)
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"status": "not ready",
			"error":  "Redis connection failed",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "ready",
		"service": "login-service",
	})
}

// LivenessCheck handles liveness check requests
func (h *HealthHandler) LivenessCheck(c *gin.Context) {
	// Simple liveness check - if the service is running, it's alive
	c.JSON(http.StatusOK, gin.H{
		"status": "alive",
		"service": "login-service",
	})
}
