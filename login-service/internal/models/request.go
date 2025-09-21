package models

// RequestContext represents the context of a request
type RequestContext struct {
	UserID   string `json:"user_id"`
	Username string `json:"username"`
	IP       string `json:"ip"`
}

// HealthCheckResponse represents the health check response
type HealthCheckResponse struct {
	Status  string `json:"status"`
	Service string `json:"service"`
	Version string `json:"version"`
	Uptime  string `json:"uptime,omitempty"`
}
