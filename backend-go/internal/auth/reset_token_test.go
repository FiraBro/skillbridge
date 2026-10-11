package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func TestResetTokenManagerUsesNodeCompatibleClaims(t *testing.T) {
	userID := uuid.New()
	manager := NewResetTokenManager("shared-secret", "15m")
	tokenString, err := manager.Issue(userID)
	if err != nil {
		t.Fatal(err)
	}

	claims := &jwt.RegisteredClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte("shared-secret"), nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
		t.Fatalf("algorithm = %q, want HS256", token.Method.Alg())
	}
	if claims.Subject != userID.String() {
		t.Fatalf("subject = %q, want %q", claims.Subject, userID)
	}
	if claims.ExpiresAt == nil || claims.ExpiresAt.Time.Before(time.Now()) {
		t.Fatal("expected an unexpired exp claim")
	}
	if got, err := manager.Subject(tokenString); err != nil || got != userID {
		t.Fatalf("Subject() = %s, %v; want %s, nil", got, err, userID)
	}
}

func TestResetTokenManagerRejectsWrongSecret(t *testing.T) {
	userID := uuid.New()
	tokenString, err := NewResetTokenManager("first-secret", "15m").Issue(userID)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := NewResetTokenManager("different-secret", "15m").Subject(tokenString); err == nil {
		t.Fatal("Subject() accepted a token signed with a different secret")
	}
}
