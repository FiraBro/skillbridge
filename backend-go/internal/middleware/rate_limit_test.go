package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
)

func TestRateLimitAllowsConfiguredCountAndRejectsNextRequest(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.New()
	router.GET("/limited", RateLimit(2, time.Minute, func(*gin.Context) string { return "client" }, "slow down"), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	for requestNumber := 0; requestNumber < 2; requestNumber++ {
		response := httptest.NewRecorder()
		router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/limited", nil))
		if response.Code != http.StatusNoContent {
			t.Fatalf("request %d status = %d, want %d", requestNumber+1, response.Code, http.StatusNoContent)
		}
	}

	response := httptest.NewRecorder()
	router.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/limited", nil))
	if response.Code != http.StatusTooManyRequests {
		t.Fatalf("third request status = %d, want %d", response.Code, http.StatusTooManyRequests)
	}
	if response.Header().Get("RateLimit-Limit") != "2" {
		t.Fatalf("RateLimit-Limit = %q, want 2", response.Header().Get("RateLimit-Limit"))
	}
}
