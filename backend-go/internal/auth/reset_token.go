package auth

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type ResetTokenManager struct {
	secret    string
	expiresIn string
}

func NewResetTokenManager(secret, expiresIn string) *ResetTokenManager {
	return &ResetTokenManager{secret: secret, expiresIn: expiresIn}
}

func (m *ResetTokenManager) Issue(userID uuid.UUID) (string, error) {
	ttl, err := parseResetDuration(m.expiresIn)
	if err != nil {
		return "", err
	}
	now := time.Now()
	expiresAt := now.Add(ttl)
	claims := jwt.RegisteredClaims{
		Subject:   userID.String(),
		IssuedAt:  jwt.NewNumericDate(now),
		ExpiresAt: jwt.NewNumericDate(expiresAt),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(m.secret))
	return signed, err
}

func (m *ResetTokenManager) Subject(raw string) (uuid.UUID, error) {
	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(raw, claims, func(token *jwt.Token) (interface{}, error) {
		if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(m.secret), nil
	})
	if err != nil || !token.Valid {
		return uuid.Nil, errors.New("invalid reset token")
	}
	return uuid.Parse(claims.Subject)
}

func parseResetDuration(value string) (time.Duration, error) {
	if value == "" {
		return 15 * time.Minute, nil
	}
	if len(value) >= 2 && value[len(value)-1] == 'd' {
		duration, err := time.ParseDuration(value[:len(value)-1] + "h")
		if err != nil {
			return 0, err
		}
		return duration * 24, nil
	}
	return time.ParseDuration(value)
}
