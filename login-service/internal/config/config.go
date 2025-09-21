package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Redis    RedisConfig
	Consul   ConsulConfig
	LogLevel string
}

type RedisConfig struct {
	Host     string
	Port     string
	Password string
	DB       int
}

type ConsulConfig struct {
	Host string
	Port string
}

func Load() *Config {
	// Load .env file if it exists
	godotenv.Load()

	return &Config{
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "redis"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Password: getEnv("REDIS_PASSWORD", "redis_password_123"),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},
		Consul: ConsulConfig{
			Host: getEnv("CONSUL_HOST", "consul"),
			Port: getEnv("CONSUL_PORT", "8500"),
		},
		LogLevel: getEnv("LOG_LEVEL", "info"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
