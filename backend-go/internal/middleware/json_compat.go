package middleware

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type bufferedResponseWriter struct {
	gin.ResponseWriter
	status int
	body   bytes.Buffer
}

func (w *bufferedResponseWriter) WriteHeader(status int) {
	w.status = status
}

func (w *bufferedResponseWriter) WriteHeaderNow() {
	if w.status == 0 {
		w.status = http.StatusOK
	}
}

func (w *bufferedResponseWriter) Write(data []byte) (int, error) {
	w.WriteHeaderNow()
	return w.body.Write(data)
}

func (w *bufferedResponseWriter) WriteString(value string) (int, error) {
	w.WriteHeaderNow()
	return w.body.WriteString(value)
}

func (w *bufferedResponseWriter) Status() int {
	if w.status != 0 {
		return w.status
	}
	return w.ResponseWriter.Status()
}

func (w *bufferedResponseWriter) Size() int { return w.body.Len() }

func (w *bufferedResponseWriter) Written() bool { return w.status != 0 || w.body.Len() > 0 }

func LegacyJSONAliases() gin.HandlerFunc {
	return func(c *gin.Context) {
		original := c.Writer
		buffered := &bufferedResponseWriter{ResponseWriter: original}
		c.Writer = buffered
		c.Next()
		c.Writer = original

		body := buffered.body.Bytes()
		if strings.Contains(original.Header().Get("Content-Type"), "application/json") {
			var payload interface{}
			if json.Unmarshal(body, &payload) == nil {
				if encoded, err := json.Marshal(withSnakeAliases(payload)); err == nil {
					body = encoded
				}
			}
		}
		original.Header().Del("Content-Length")
		status := buffered.status
		if status == 0 {
			status = http.StatusOK
		}
		original.WriteHeader(status)
		_, _ = original.Write(body)
	}
}

func withSnakeAliases(value interface{}) interface{} {
	switch current := value.(type) {
	case []interface{}:
		for i := range current {
			current[i] = withSnakeAliases(current[i])
		}
		return current
	case map[string]interface{}:
		aliases := make(map[string]interface{})
		for key, item := range current {
			current[key] = withSnakeAliases(item)
			alias := snakeCase(key)
			if alias != key {
				if _, exists := current[alias]; !exists {
					aliases[alias] = current[key]
				}
			}
		}
		for key, item := range aliases {
			current[key] = item
		}
		return current
	default:
		return value
	}
}

func snakeCase(value string) string {
	var result strings.Builder
	for _, character := range value {
		if character >= 'A' && character <= 'Z' {
			result.WriteByte('_')
			result.WriteRune(character + ('a' - 'A'))
		} else {
			result.WriteRune(character)
		}
	}
	return result.String()
}
