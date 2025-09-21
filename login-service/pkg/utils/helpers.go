package utils

import (
	"crypto/rand"
	"encoding/hex"
	"strings"
)

// GenerateRandomString generates a random string of specified length
func GenerateRandomString(length int) (string, error) {
	bytes := make([]byte, length/2)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// IsValidEmail performs basic email validation
func IsValidEmail(email string) bool {
	return strings.Contains(email, "@") && strings.Contains(email, ".")
}

// IsValidUsername checks if username meets requirements
func IsValidUsername(username string) bool {
	return len(username) >= 3 && len(username) <= 50
}

// IsValidPassword checks if password meets requirements
func IsValidPassword(password string) bool {
	return len(password) >= 6
}
