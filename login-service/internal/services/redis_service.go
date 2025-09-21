package services

import (
	"login-service/internal/repository"
	"login-service/pkg/logger"
)

type RedisService struct {
	repo   *repository.RedisRepository
	logger *logger.Logger
}

func NewRedisService(repo *repository.RedisRepository, logger *logger.Logger) *RedisService {
	return &RedisService{
		repo:   repo,
		logger: logger,
	}
}

// HealthCheck checks Redis connection
func (s *RedisService) HealthCheck() error {
	return s.repo.Ping()
}

// GetConnectionInfo returns Redis connection information
func (s *RedisService) GetConnectionInfo() map[string]interface{} {
	return map[string]interface{}{
		"status": "connected",
		"type":   "redis",
	}
}
