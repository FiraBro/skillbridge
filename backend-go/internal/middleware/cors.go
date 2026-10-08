package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		if originAllowed(origin) {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		} else if origin != "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"message": "Not allowed by CORS"})
			return
		}

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func originAllowed(origin string) bool {
	if origin == "" {
		return true
	}
	switch origin {
	case "http://localhost:5173", "https://skillbridge1234.vercel.app":
		return true
	}
	return strings.HasSuffix(origin, ".vercel.app")
}
