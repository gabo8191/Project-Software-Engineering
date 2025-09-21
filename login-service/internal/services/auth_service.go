package services

import (
	"crypto/rand"
	"encoding/hex"
	"login-service/internal/models"
	"login-service/internal/repository"
	"login-service/pkg/logger"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo   *repository.RedisRepository
	logger *logger.Logger
}

func NewAuthService(repo *repository.RedisRepository, logger *logger.Logger) *AuthService {
	return &AuthService{
		repo:   repo,
		logger: logger,
	}
}

// CreateUser creates a new user
func (s *AuthService) CreateUser(req models.CreateUserRequest) models.CreateUserResponse {
	// Check if user already exists
	existingUser, err := s.repo.GetUserByUsername(req.Username)
	if err == nil && existingUser != nil {
		return models.CreateUserResponse{
			Success: false,
			Message: "User already exists",
		}
	}

	// Hash password
	hashedPassword, err := s.hashPassword(req.Password)
	if err != nil {
		s.logger.Error("Failed to hash password:", err)
		return models.CreateUserResponse{
			Success: false,
			Message: "Failed to create user",
		}
	}

	// Generate user ID
	userID := s.generateUserID()

	// Create user
	user := &models.User{
		ID:        userID,
		Username:  req.Username,
		Password:  hashedPassword,
		Email:     req.Email,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// Save user to repository
	if err := s.repo.CreateUser(user); err != nil {
		s.logger.Error("Failed to create user in repository:", err)
		return models.CreateUserResponse{
			Success: false,
			Message: "Failed to create user",
		}
	}

	// Create username index
	if err := s.repo.SetUsernameIndex(req.Username, userID); err != nil {
		s.logger.Error("Failed to create username index:", err)
		// Clean up user if index creation fails
		s.repo.DeleteUser(userID)
		return models.CreateUserResponse{
			Success: false,
			Message: "Failed to create user",
		}
	}

	s.logger.Info("User created successfully:", userID)

	return models.CreateUserResponse{
		Success: true,
		Message: "User created successfully",
		UserID:  userID,
	}
}

// AuthUser authenticates a user
func (s *AuthService) AuthUser(req models.AuthUserRequest) models.AuthUserResponse {
	// Get user by username
	user, err := s.repo.GetUserByUsername(req.Username)
	if err != nil {
		s.logger.Warn("User not found:", req.Username)
		return models.AuthUserResponse{
			Success: false,
			Message: "Invalid credentials",
		}
	}

	// Check password
	if !s.checkPassword(req.Password, user.Password) {
		s.logger.Warn("Invalid password for user:", req.Username)
		return models.AuthUserResponse{
			Success: false,
			Message: "Invalid credentials",
		}
	}

	// Generate session token
	token, err := s.generateToken()
	if err != nil {
		s.logger.Error("Failed to generate token:", err)
		return models.AuthUserResponse{
			Success: false,
			Message: "Authentication failed",
		}
	}

	// Create session
	sessionExpiration := 24 * time.Hour // 24 hours
	if err := s.repo.CreateSession(token, user.ID, sessionExpiration); err != nil {
		s.logger.Error("Failed to create session:", err)
		return models.AuthUserResponse{
			Success: false,
			Message: "Authentication failed",
		}
	}

	s.logger.Info("User authenticated successfully:", user.Username)

	// Remove password from response
	user.Password = ""

	return models.AuthUserResponse{
		Success: true,
		Message: "Authentication successful",
		Token:   token,
		User:    user,
	}
}

// Helper functions
func (s *AuthService) hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

func (s *AuthService) checkPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *AuthService) generateUserID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

func (s *AuthService) generateToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}
