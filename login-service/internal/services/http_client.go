package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"login-service/pkg/logger"
)

// HTTPClient provides HTTP communication with other services
type HTTPClient struct {
	client        *http.Client
	consulService *ConsulService
	logger        *logger.Logger
}

// NewHTTPClient creates a new HTTP client with service discovery
func NewHTTPClient(consulService *ConsulService, logger *logger.Logger) *HTTPClient {
	return &HTTPClient{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		consulService: consulService,
		logger:        logger,
	}
}

// CallService makes an HTTP request to a discovered service
func (h *HTTPClient) CallService(serviceName, endpoint, method string, body interface{}) ([]byte, error) {
	// Discover the service
	serviceInfo, err := h.consulService.DiscoverService(serviceName)
	if err != nil {
		h.logger.Error(fmt.Sprintf("Failed to discover service %s: %v", serviceName, err))
		return nil, fmt.Errorf("service discovery failed: %w", err)
	}

	// Build the URL
	url := fmt.Sprintf("%s%s", serviceInfo.URL, endpoint)
	h.logger.Info(fmt.Sprintf("Making %s request to %s", method, url))

	// Prepare request body
	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	// Create request
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	// Set headers
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "login-service/1.0")

	// Make the request
	resp, err := h.client.Do(req)
	if err != nil {
		h.logger.Error(fmt.Sprintf("HTTP request failed: %v", err))
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	// Read response
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response: %w", err)
	}

	// Check status code
	if resp.StatusCode >= 400 {
		h.logger.Error(fmt.Sprintf("HTTP request failed with status %d: %s", resp.StatusCode, string(respBody)))
		return nil, fmt.Errorf("request failed with status %d: %s", resp.StatusCode, string(respBody))
	}

	h.logger.Info(fmt.Sprintf("Request to %s successful", url))
	return respBody, nil
}

// GetUserInfo calls the user service to get user information
func (h *HTTPClient) GetUserInfo(userID string) (map[string]interface{}, error) {
	endpoint := fmt.Sprintf("/users/%s", userID)
	
	respBody, err := h.CallService("user-service", endpoint, "GET", nil)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}

	var userInfo map[string]interface{}
	if err := json.Unmarshal(respBody, &userInfo); err != nil {
		return nil, fmt.Errorf("failed to unmarshal user info: %w", err)
	}

	return userInfo, nil
}

// ValidateUser calls the user service to validate user credentials
func (h *HTTPClient) ValidateUser(email, password string) (map[string]interface{}, error) {
	endpoint := "/auth/validate"
	requestBody := map[string]string{
		"email":    email,
		"password": password,
	}

	respBody, err := h.CallService("user-service", endpoint, "POST", requestBody)
	if err != nil {
		return nil, fmt.Errorf("failed to validate user: %w", err)
	}

	var validationResult map[string]interface{}
	if err := json.Unmarshal(respBody, &validationResult); err != nil {
		return nil, fmt.Errorf("failed to unmarshal validation result: %w", err)
	}

	return validationResult, nil
}