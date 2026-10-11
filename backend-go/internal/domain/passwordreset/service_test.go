package passwordreset

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
)

type fakeRepository struct {
	userID       uuid.UUID
	findErr      error
	storedToken  string
	storedExpiry time.Time
	valid        bool
	updated      bool
	passwordHash string
}

func (r *fakeRepository) FindUserIDByEmail(context.Context, string) (uuid.UUID, error) {
	return r.userID, r.findErr
}

func (r *fakeRepository) StoreResetToken(_ context.Context, _ uuid.UUID, token string, expiresAt time.Time) error {
	r.storedToken, r.storedExpiry = token, expiresAt
	return nil
}

func (r *fakeRepository) HasValidResetToken(context.Context, uuid.UUID, string, time.Time) (bool, error) {
	return r.valid, nil
}

func (r *fakeRepository) UpdatePassword(_ context.Context, _ uuid.UUID, _ string, _ time.Time, hash string) (bool, error) {
	r.passwordHash = hash
	return r.updated, nil
}

type fakeTokens struct {
	issued string
	userID uuid.UUID
}

func (t fakeTokens) Issue(uuid.UUID) (string, error)   { return t.issued, nil }
func (t fakeTokens) Subject(string) (uuid.UUID, error) { return t.userID, nil }

type fakeHasher struct{}

func (fakeHasher) Hash(password string) (string, error) { return "hash:" + password, nil }

func TestForgotPasswordStoresTokenAndFifteenMinuteExpiry(t *testing.T) {
	repository := &fakeRepository{userID: uuid.New()}
	service := NewService(repository, fakeTokens{issued: "signed-token"}, fakeHasher{})
	started := time.Now()

	if err := service.ForgotPassword(context.Background(), " person@example.com "); err != nil {
		t.Fatal(err)
	}
	if repository.storedToken != "signed-token" {
		t.Fatalf("stored token = %q", repository.storedToken)
	}
	if repository.storedExpiry.Before(started.Add(15*time.Minute)) || repository.storedExpiry.After(time.Now().Add(15*time.Minute)) {
		t.Fatal("stored token expiry should be fifteen minutes from now")
	}
}

func TestForgotPasswordDoesNotRevealUnknownEmail(t *testing.T) {
	repository := &fakeRepository{findErr: ErrUserNotFound}
	service := NewService(repository, fakeTokens{}, fakeHasher{})
	if err := service.ForgotPassword(context.Background(), "unknown@example.com"); err != nil {
		t.Fatalf("ForgotPassword() error = %v, want nil", err)
	}
}

func TestResetPasswordValidatesAndPersistsHash(t *testing.T) {
	userID := uuid.New()
	repository := &fakeRepository{valid: true, updated: true}
	service := NewService(repository, fakeTokens{userID: userID}, fakeHasher{})

	if err := service.ResetPassword(context.Background(), "signed-token", "new-password"); err != nil {
		t.Fatal(err)
	}
	if repository.passwordHash != "hash:new-password" {
		t.Fatalf("password hash = %q", repository.passwordHash)
	}
}

func TestResetPasswordRejectsUnstoredToken(t *testing.T) {
	repository := &fakeRepository{}
	service := NewService(repository, fakeTokens{userID: uuid.New()}, fakeHasher{})
	if err := service.ResetPassword(context.Background(), "signed-token", "new-password"); !errors.Is(err, ErrInvalidOrExpired) {
		t.Fatalf("ResetPassword() error = %v, want %v", err, ErrInvalidOrExpired)
	}
}
