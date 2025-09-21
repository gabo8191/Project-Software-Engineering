package handlers

import (
	"net/http"
	"login-service/internal/models"
	"login-service/internal/services"
	"login-service/pkg/logger"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService *services.AuthService
	logger      *logger.Logger
}

func NewAuthHandler(authService *services.AuthService, logger *logger.Logger) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		logger:      logger,
	}
}

// CreateUser handles user creation
func (h *AuthHandler) CreateUser(c *gin.Context) {
	var req models.CreateUserRequest

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Warn("Invalid request body:", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
		return
	}

	// Validate request
	if req.Username == "" || req.Password == "" || req.Email == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Message: "Username, password, and email are required",
		})
		return
	}

	// Create user
	response := h.authService.CreateUser(req)

	// Set appropriate HTTP status
	status := http.StatusCreated
	if !response.Success {
		status = http.StatusConflict
	}

	c.JSON(status, response)
}

// AuthUser handles user authentication
func (h *AuthHandler) AuthUser(c *gin.Context) {
	var req models.AuthUserRequest

	// Bind JSON request
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.Warn("Invalid request body:", err)
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Message: "Invalid request body",
			Error:   err.Error(),
		})
		return
	}

	// Validate request
	if req.Username == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Success: false,
			Message: "Username and password are required",
		})
		return
	}

	// Authenticate user
	response := h.authService.AuthUser(req)

	// Set appropriate HTTP status
	status := http.StatusOK
	if !response.Success {
		status = http.StatusUnauthorized
	}

	c.JSON(status, response)
}
