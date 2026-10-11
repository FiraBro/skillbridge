package middleware

import (
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
)

type rateLimitEntry struct {
	count   int
	resetAt time.Time
}

type rateLimitStore struct {
	mu      sync.Mutex
	entries map[string]rateLimitEntry
}

func RateLimit(limit int, window time.Duration, key func(*gin.Context) string, message string) gin.HandlerFunc {
	store := rateLimitStore{entries: make(map[string]rateLimitEntry)}
	return func(c *gin.Context) {
		now := time.Now()
		identity := key(c)

		store.mu.Lock()
		entry := store.entries[identity]
		if !now.Before(entry.resetAt) {
			entry = rateLimitEntry{resetAt: now.Add(window)}
		}
		entry.count++
		store.entries[identity] = entry
		if len(store.entries) > 4096 {
			for storedKey, storedEntry := range store.entries {
				if !now.Before(storedEntry.resetAt) {
					delete(store.entries, storedKey)
				}
			}
		}
		store.mu.Unlock()

		remaining := limit - entry.count
		if remaining < 0 {
			remaining = 0
		}
		c.Header("RateLimit-Limit", strconv.Itoa(limit))
		c.Header("RateLimit-Remaining", strconv.Itoa(remaining))
		c.Header("RateLimit-Reset", strconv.FormatInt(entry.resetAt.Unix(), 10))
		if entry.count > limit {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": message})
			return
		}
		c.Next()
	}
}

func ClientIPKey(c *gin.Context) string { return c.ClientIP() }

func UserIDKey(c *gin.Context) string {
	if userID, ok := c.Get("userID"); ok {
		return fmt.Sprint(userID)
	}
	return c.ClientIP()
}
