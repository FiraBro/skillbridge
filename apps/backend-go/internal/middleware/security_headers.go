package middleware

import "github.com/gin-gonic/gin"

func SecurityHeaders(production bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "SAMEORIGIN")
		c.Header("Referrer-Policy", "no-referrer")
		c.Header("X-DNS-Prefetch-Control", "off")
		c.Header("X-Permitted-Cross-Domain-Policies", "none")
		c.Header("Cross-Origin-Opener-Policy", "same-origin")
		c.Header("Origin-Agent-Cluster", "?1")
		c.Header("X-XSS-Protection", "0")
		if production {
			c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
		}
		c.Next()
	}
}
