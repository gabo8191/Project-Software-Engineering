package middleware

import (
	"net/http"
	"login-service/pkg/logger"

	"github.com/gin-gonic/gin"
)

// Recovery middleware for panic recovery
func Recovery(log *logger.Logger) gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		if err, ok := recovered.(string); ok {
			log.Error("Panic recovered:", err)
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "Internal server error",
		})
		c.Abort()
	})
}
