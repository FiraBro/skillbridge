package models

import (
	"time"

	"github.com/google/uuid"
)

// JSON tags use snake_case to match Node pg row objects and the React client.
type User struct {
	ID                    uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Email                 string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	PasswordHash          string     `gorm:"column:password_hash;type:text" json:"-"`
	Name                  *string    `gorm:"type:varchar(120)" json:"name"`
	Username              *string    `gorm:"type:varchar(120)" json:"username"`
	Role                  string     `gorm:"type:varchar(50);default:developer" json:"role"`
	IsActive              bool       `gorm:"column:is_active;default:true" json:"is_active"`
	IsVerified            bool       `gorm:"column:is_verified;default:false" json:"is_verified"`
	PasswordResetToken    *string    `gorm:"column:password_reset_token" json:"-"`
	PasswordResetExpires  *time.Time `gorm:"column:password_reset_expires" json:"-"`
	GitHubID              *int64     `gorm:"column:github_id;uniqueIndex" json:"github_id"`
	GitHubUsername        *string    `gorm:"column:github_username;type:varchar(100)" json:"github_username"`
	AvatarURL             *string    `gorm:"column:avatar_url" json:"avatar_url"`
	OnboardingCompleted   bool       `gorm:"column:onboarding_completed;default:false" json:"onboarding_completed"`
	GitHubVerified        bool       `gorm:"column:github_verified;default:false" json:"github_verified"`
	GitHubConnectedAt     *time.Time `gorm:"column:github_connected_at" json:"github_connected_at"`
	CreatedAt             time.Time  `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time  `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
}

func (User) TableName() string { return "users" }

type Follow struct {
	FollowerID  uuid.UUID `gorm:"type:uuid;primaryKey" json:"follower_id"`
	FollowingID uuid.UUID `gorm:"type:uuid;primaryKey" json:"following_id"`
	CreatedAt   time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
}

func (Follow) TableName() string { return "follows" }
