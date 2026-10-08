package server

import (
	"log"
	"net/http"

	"skillbridge/backend/internal/config"
	"skillbridge/backend/internal/handlers"
	"skillbridge/backend/internal/httpx"
	"skillbridge/backend/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func New(cfg *config.Config, db *gorm.DB) *gin.Engine {
	if cfg.IsProduction() {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(requestLogger())
	r.Use(middleware.CORS())
	r.Use(middleware.LegacyJSONAliases())
	r.Static("/uploads", "uploads")

	r.GET("/health", func(c *gin.Context) {
		sqlDB, err := db.DB()
		if err != nil {
			httpx.Fail(c, http.StatusServiceUnavailable, "database unavailable")
			return
		}
		if err := sqlDB.Ping(); err != nil {
			httpx.Fail(c, http.StatusServiceUnavailable, "database unavailable")
			return
		}
		httpx.Success(c, http.StatusOK, gin.H{"db": "ok"}, "healthy")
	})

	r.GET("/api/test/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "Server is working properly!"})
	})

	api := r.Group("/api")
	handlers.RegisterRoutes(api, cfg, db)

	return r
}

func requestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		log.Printf("🌍 [%s] %s %s", c.Request.Method, c.Request.URL.Path, c.ClientIP())
	}
}
