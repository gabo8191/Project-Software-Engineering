package middleware

import (
	"login-service/pkg/logger"

	"github.com/gin-gonic/gin"
)

// Logger middleware for request logging
func Logger(log *logger.Logger) gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		log.Info("HTTP Request",
			"status", param.StatusCode,
			"method", param.Method,
			"path", param.Path,
			"ip", param.ClientIP,
			"latency", param.Latency,
			"user_agent", param.Request.UserAgent(),
		)
		return ""
	})
}
