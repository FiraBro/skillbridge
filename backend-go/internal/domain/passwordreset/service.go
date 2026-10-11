package passwordreset

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

var (
	ErrUserNotFound     = errors.New("user not found")
	ErrInvalidOrExpired = errors.New("invalid or expired token")
)

type Repository interface {
	FindUserIDByEmail(context.Context, string) (uuid.UUID, error)
	StoreResetToken(context.Context, uuid.UUID, string, time.Time) error
	HasValidResetToken(context.Context, uuid.UUID, string, time.Time) (bool, error)
	UpdatePassword(context.Context, uuid.UUID, string, time.Time, string) (bool, error)
}

type TokenManager interface {
	Issue(uuid.UUID) (string, error)
	Subject(string) (uuid.UUID, error)
}

type PasswordHasher interface {
	Hash(string) (string, error)
}

type Service struct {
	repository Repository
	tokens     TokenManager
	hasher     PasswordHasher
}

func NewService(repository Repository, tokens TokenManager, hasher PasswordHasher) *Service {
	return &Service{repository: repository, tokens: tokens, hasher: hasher}
}

func (s *Service) ForgotPassword(ctx context.Context, email string) error {
	userID, err := s.repository.FindUserIDByEmail(ctx, strings.TrimSpace(email))
	if errors.Is(err, ErrUserNotFound) {
		return nil
	}
	if err != nil {
		return err
	}

	token, err := s.tokens.Issue(userID)
	if err != nil {
		return err
	}
	return s.repository.StoreResetToken(ctx, userID, token, time.Now().Add(15*time.Minute))
}

func (s *Service) ResetPassword(ctx context.Context, token, password string) error {
	if token == "" || len(password) < 8 {
		return ErrInvalidOrExpired
	}

	userID, err := s.tokens.Subject(token)
	if err != nil {
		return ErrInvalidOrExpired
	}

	now := time.Now()
	valid, err := s.repository.HasValidResetToken(ctx, userID, token, now)
	if err != nil {
		return err
	}
	if !valid {
		return ErrInvalidOrExpired
	}

	hash, err := s.hasher.Hash(password)
	if err != nil {
		return err
	}
	updated, err := s.repository.UpdatePassword(ctx, userID, token, now, hash)
	if err != nil {
		return err
	}
	if !updated {
		return ErrInvalidOrExpired
	}
	return nil
}
