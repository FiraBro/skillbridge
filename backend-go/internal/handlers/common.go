package handlers

import (
	"net/http"
	"strings"

	"skillbridge/backend/internal/auth"
	"skillbridge/backend/internal/config"
	"skillbridge/backend/internal/httpx"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Handler struct {
	DB  *gorm.DB
	Cfg *config.Config
}

func New(db *gorm.DB, cfg *config.Config) *Handler {
	return &Handler{DB: db, Cfg: cfg}
}

func (h *Handler) RequireAuth(roles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := ""
		if value := c.GetHeader("Authorization"); strings.HasPrefix(value, "Bearer ") {
			token = strings.TrimSpace(strings.TrimPrefix(value, "Bearer "))
		} else if cookie, err := c.Cookie("token"); err == nil {
			token = cookie
		}
		if token == "" {
			httpx.Fail(c, http.StatusUnauthorized, "Unauthorized: No token provided")
			c.Abort()
			return
		}
		claims, err := auth.ParseAccessToken(h.Cfg.JWTAccessSecret, token)
		if err != nil {
			httpx.Fail(c, http.StatusUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}
		userID, err := auth.UserIDFromClaims(claims)
		if err != nil {
			httpx.Fail(c, http.StatusUnauthorized, "Invalid token subject")
			c.Abort()
			return
		}
		if len(roles) > 0 {
			allowed := false
			for _, role := range roles {
				if claims.Role == role {
					allowed = true
					break
				}
			}
			if !allowed {
				httpx.Fail(c, http.StatusForbidden, "Forbidden: role does not have access")
				c.Abort()
				return
			}
		}
		c.Set("userID", userID)
		c.Set("role", claims.Role)
		c.Set("username", claims.Username)
		c.Next()
	}
}

func (h *Handler) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := ""
		if value := c.GetHeader("Authorization"); strings.HasPrefix(value, "Bearer ") {
			token = strings.TrimSpace(strings.TrimPrefix(value, "Bearer "))
		} else if cookie, err := c.Cookie("token"); err == nil {
			token = cookie
		}
		if token != "" {
			if claims, err := auth.ParseAccessToken(h.Cfg.JWTAccessSecret, token); err == nil {
				if id, err := auth.UserIDFromClaims(claims); err == nil {
					c.Set("userID", id)
					c.Set("role", claims.Role)
				}
			}
		}
		c.Next()
	}
}

func userID(c *gin.Context) (uuid.UUID, bool) {
	value, ok := c.Get("userID")
	if !ok {
		return uuid.Nil, false
	}
	id, ok := value.(uuid.UUID)
	return id, ok
}

func fail(c *gin.Context, status int, message string) {
	httpx.Fail(c, status, message)
}

func bindJSON(c *gin.Context, target interface{}) bool {
	if err := c.ShouldBindJSON(target); err != nil {
		fail(c, http.StatusBadRequest, "Invalid request body")
		return false
	}
	return true
}
