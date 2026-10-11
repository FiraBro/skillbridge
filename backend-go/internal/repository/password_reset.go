package repository

import (
	"context"
	"time"

	"skillbridge/backend/internal/domain/passwordreset"
	"skillbridge/backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type PasswordResetRepository struct {
	db *gorm.DB
}

func NewPasswordResetRepository(db *gorm.DB) *PasswordResetRepository {
	return &PasswordResetRepository{db: db}
}

func (r *PasswordResetRepository) FindUserIDByEmail(ctx context.Context, email string) (uuid.UUID, error) {
	var user models.User
	err := r.db.WithContext(ctx).Select("id").Where("email = ?", email).First(&user).Error
	if err == gorm.ErrRecordNotFound {
		return uuid.Nil, passwordreset.ErrUserNotFound
	}
	return user.ID, err
}

func (r *PasswordResetRepository) StoreResetToken(ctx context.Context, userID uuid.UUID, token string, expiresAt time.Time) error {
	result := r.db.WithContext(ctx).Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"password_reset_token":   token,
		"password_reset_expires": expiresAt,
	})
	if result.Error != nil {
		return result.Error
	}
	if result.RowsAffected == 0 {
		return passwordreset.ErrUserNotFound
	}
	return nil
}

func (r *PasswordResetRepository) HasValidResetToken(ctx context.Context, userID uuid.UUID, token string, now time.Time) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.User{}).
		Where("id = ? AND password_reset_token = ? AND password_reset_expires > ?", userID, token, now).
		Count(&count).Error
	return count > 0, err
}

func (r *PasswordResetRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, token string, now time.Time, passwordHash string) (bool, error) {
	result := r.db.WithContext(ctx).Model(&models.User{}).
		Where("id = ? AND password_reset_token = ? AND password_reset_expires > ?", userID, token, now).
		Updates(map[string]interface{}{
			"password_hash":          passwordHash,
			"password_reset_token":   nil,
			"password_reset_expires": nil,
		})
	return result.RowsAffected > 0, result.Error
}

var _ passwordreset.Repository = (*PasswordResetRepository)(nil)
