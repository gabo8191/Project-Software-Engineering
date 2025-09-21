package repository

import (
	"context"
	"fmt"
	"login-service/internal/config"
	"login-service/internal/models"
	"time"

	"github.com/go-redis/redis/v8"
)

type RedisRepository struct {
	client *redis.Client
	ctx    context.Context
}

func NewRedisRepository(cfg config.RedisConfig) *RedisRepository {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Password: cfg.Password,
		DB:       cfg.DB,
	})

	return &RedisRepository{
		client: rdb,
		ctx:    context.Background(),
	}
}

// User operations
func (r *RedisRepository) CreateUser(user *models.User) error {
	key := fmt.Sprintf("user:%s", user.ID)

	// Convert user to map for Redis
	userMap := map[string]interface{}{
		"id":         user.ID,
		"username":   user.Username,
		"password":   user.Password,
		"email":      user.Email,
		"created_at": user.CreatedAt.Format(time.RFC3339),
		"updated_at": user.UpdatedAt.Format(time.RFC3339),
	}

	return r.client.HMSet(r.ctx, key, userMap).Err()
}

func (r *RedisRepository) GetUserByID(userID string) (*models.User, error) {
	key := fmt.Sprintf("user:%s", userID)

	result := r.client.HGetAll(r.ctx, key)
	if err := result.Err(); err != nil {
		return nil, err
	}

	userMap := result.Val()
	if len(userMap) == 0 {
		return nil, fmt.Errorf("user not found")
	}

	user := &models.User{}
	user.ID = userMap["id"]
	user.Username = userMap["username"]
	user.Password = userMap["password"]
	user.Email = userMap["email"]

	if createdAt, err := time.Parse(time.RFC3339, userMap["created_at"]); err == nil {
		user.CreatedAt = createdAt
	}
	if updatedAt, err := time.Parse(time.RFC3339, userMap["updated_at"]); err == nil {
		user.UpdatedAt = updatedAt
	}

	return user, nil
}

func (r *RedisRepository) GetUserByUsername(username string) (*models.User, error) {
	// Get user ID by username
	key := fmt.Sprintf("username:%s", username)
	userID, err := r.client.Get(r.ctx, key).Result()
	if err != nil {
		return nil, err
	}

	return r.GetUserByID(userID)
}

func (r *RedisRepository) SetUsernameIndex(username, userID string) error {
	key := fmt.Sprintf("username:%s", username)
	return r.client.Set(r.ctx, key, userID, 0).Err()
}

func (r *RedisRepository) DeleteUser(userID string) error {
	// Get user first to delete username index
	user, err := r.GetUserByID(userID)
	if err != nil {
		return err
	}

	// Delete username index
	usernameKey := fmt.Sprintf("username:%s", user.Username)
	if err := r.client.Del(r.ctx, usernameKey).Err(); err != nil {
		return err
	}

	// Delete user
	userKey := fmt.Sprintf("user:%s", userID)
	return r.client.Del(r.ctx, userKey).Err()
}

// Session operations
func (r *RedisRepository) CreateSession(sessionID, userID string, expiration time.Duration) error {
	key := fmt.Sprintf("session:%s", sessionID)
	sessionData := map[string]interface{}{
		"user_id": userID,
		"created": time.Now().Format(time.RFC3339),
	}

	return r.client.HMSet(r.ctx, key, sessionData).Err()
}

func (r *RedisRepository) GetSession(sessionID string) (string, error) {
	key := fmt.Sprintf("session:%s", sessionID)
	userID, err := r.client.HGet(r.ctx, key, "user_id").Result()
	if err != nil {
		return "", err
	}
	return userID, nil
}

func (r *RedisRepository) DeleteSession(sessionID string) error {
	key := fmt.Sprintf("session:%s", sessionID)
	return r.client.Del(r.ctx, key).Err()
}

// Health check
func (r *RedisRepository) Ping() error {
	return r.client.Ping(r.ctx).Err()
}

// Close connection
func (r *RedisRepository) Close() error {
	return r.client.Close()
}
