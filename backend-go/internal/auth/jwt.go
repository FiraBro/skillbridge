package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type AccessClaims struct {
	Role     string `json:"role"`
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

func SignAccessToken(secret, userID, role, username, email, expiresIn string) (string, error) {
	ttl, err := parseNodeDuration(expiresIn)
	if err != nil {
		return "", err
	}

	claims := AccessClaims{
		Role:     role,
		Username: username,
		Email:    email,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   userID,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func ParseAccessToken(secret, tokenString string) (*AccessClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &AccessClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(*AccessClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

func UserIDFromClaims(c *AccessClaims) (uuid.UUID, error) {
	return uuid.Parse(c.Subject)
}

// parseNodeDuration accepts jsonwebtoken-style values like "7d" and "15m".
func parseNodeDuration(s string) (time.Duration, error) {
	if s == "" {
		return 7 * 24 * time.Hour, nil
	}
	if len(s) >= 2 && s[len(s)-1] == 'd' {
		n := s[:len(s)-1]
		d, err := time.ParseDuration(n + "h")
		if err != nil {
			return 0, err
		}
		return d * 24, nil
	}
	return time.ParseDuration(s)
}
