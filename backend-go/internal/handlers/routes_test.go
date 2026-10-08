package handlers

import (
	"testing"

	"skillbridge/backend/internal/config"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func TestRegisterRoutes(t *testing.T) {
	gin.SetMode(gin.TestMode)
	engine := gin.New()
	RegisterRoutes(engine.Group("/api"), &config.Config{}, &gorm.DB{})

	routes := make(map[string]bool)
	for _, route := range engine.Routes() {
		routes[route.Method+" "+route.Path] = true
	}
	for _, route := range []string{
		"POST /api/auth/register",
		"GET /api/profiles/:username",
		"POST /api/posts/:id/like",
		"GET /api/projects/:id",
		"GET /api/jobs/:id",
		"GET /api/companies/discovery",
		"GET /api/notifications/inbox",
		"GET /api/search/trending-skills",
		"GET /api/admin/system-health",
		"GET /api/github/profile/:username",
	} {
		if !routes[route] {
			t.Errorf("expected route %q to be registered", route)
		}
	}
}
